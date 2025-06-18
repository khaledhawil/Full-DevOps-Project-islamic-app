# AWS Infrastructure with Terraform

This directory contains Terraform configuration for deploying the Islamic App infrastructure on AWS using EKS, EC2, RDS, and CloudWatch.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Cloud                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌──────────────────────────────────┐ │
│  │   Jenkins EC2   │    │           EKS Cluster            │ │
│  │                 │    │  ┌────────────┐ ┌──────────────┐ │ │
│  │ • Docker        │    │  │ Node Group │ │ Node Group   │ │ │
│  │ • AWS CLI       │    │  │ (On-Demand)│ │ (Spot)       │ │ │
│  │ • kubectl       │    │  └────────────┘ └──────────────┘ │ │
│  │ • CloudWatch    │    │                                  │ │
│  │   Agent         │    │  ┌─────────────────────────────┐ │ │
│  └─────────────────┘    │  │      Islamic App Pods       │ │ │
│                         │  │ • Frontend (React)          │ │ │
│  ┌─────────────────┐    │  │ • Backend (Flask)           │ │ │
│  │   RDS PostgreSQL │   │  │ • ArgoCD                    │ │ │
│  │                 │    │  └─────────────────────────────┘ │ │
│  │ • Multi-AZ      │    └──────────────────────────────────┘ │
│  │ • Encrypted     │                                        │
│  │ • Automated     │    ┌──────────────────────────────────┐ │
│  │   Backups       │    │          CloudWatch              │ │
│  │ • Performance   │    │ • Dashboards                     │ │
│  │   Insights      │    │ • Alarms                         │ │
│  └─────────────────┘    │ • Log Groups                     │ │
│                         │ • SNS Notifications              │ │
│                         └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Components

### 1. **VPC Module** (`modules/vpc/`)
- Custom VPC with public/private subnets across 3 AZs
- Internet Gateway and NAT Gateways
- Route tables and security groups
- EKS-ready subnet tagging

### 2. **EKS Module** (`modules/eks/`)
- Managed Kubernetes cluster (v1.28)
- Mixed node groups (On-Demand + Spot instances)
- Enhanced security with encryption at rest
- CloudWatch logging enabled
- Essential add-ons (CoreDNS, kube-proxy, VPC CNI, EBS CSI)

### 3. **Jenkins Module** (`modules/jenkins/`)
- EC2 instance with Docker and Jenkins
- Pre-configured with AWS CLI, kubectl, Helm
- CloudWatch Agent for monitoring
- IAM roles for EKS and ECR access
- Elastic IP for consistent access

### 4. **RDS Module** (`modules/rds/`)
- PostgreSQL 15.4 with encryption
- Multi-AZ deployment for high availability
- Automated backups and point-in-time recovery
- Performance Insights enabled
- Secrets Manager integration

### 5. **CloudWatch Module** (`modules/cloudwatch/`)
- Comprehensive monitoring dashboard
- Infrastructure health alarms
- Log aggregation from EC2 and EKS
- SNS notifications for alerts
- Custom metrics for application monitoring

## 🚀 Quick Start

### Prerequisites
```bash
# Install Terraform
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform

# Configure AWS CLI
aws configure
```

### Deployment
```bash
# 1. Clone and navigate
cd terraform/

# 2. Deploy infrastructure
./deploy.sh

# 3. Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name $(terraform output -raw eks_cluster_name)

# 4. Get Jenkins password
ssh -i islamic-app-key.pem ec2-user@$(terraform output -raw jenkins_public_ip)
sudo docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## 📋 Configuration

### Environment Variables
Create `terraform.tfvars`:
```hcl
# Basic Configuration
aws_region   = "us-west-2"
environment  = "production"

# Database
database_password = "your-secure-password"

# Jenkins
key_pair_name = "your-key-pair"

# EKS Node Groups
eks_node_groups = {
  main = {
    instance_types = ["t3.medium"]
    scaling_config = {
      desired_size = 3
      max_size     = 6
      min_size     = 2
    }
    capacity_type = "ON_DEMAND"
    disk_size     = 50
  }
}
```

### Cost Optimization
```hcl
# Use spot instances for development
eks_node_groups = {
  spot = {
    instance_types = ["t3.medium", "t3a.medium"]
    capacity_type = "SPOT"
    scaling_config = {
      desired_size = 2
      max_size     = 4
      min_size     = 1
    }
  }
}

# Smaller RDS instance for development
rds_instance_class = "db.t3.micro"
jenkins_instance_type = "t3.small"
```

## 🔧 Operations

### Scaling EKS Nodes
```bash
# Update desired capacity
terraform apply -var='eks_node_groups.main.scaling_config.desired_size=5'
```

### Database Management
```bash
# Get database credentials
aws secretsmanager get-secret-value --secret-id $(terraform output -raw database_secret_arn)

# Connect to database
psql -h $(terraform output -raw rds_endpoint) -U islamic_user -d islamic_app
```

### Monitoring
```bash
# View CloudWatch dashboard
terraform output cloudwatch_dashboard_url

# Stream Jenkins logs
aws logs tail /aws/ec2/jenkins --follow
```

## 🔒 Security Features

- **Encryption**: All data encrypted at rest and in transit
- **Network Isolation**: Private subnets for sensitive resources
- **IAM Roles**: Least privilege access principles
- **Secrets Management**: Database credentials in AWS Secrets Manager
- **Security Groups**: Restrictive firewall rules
- **KMS Keys**: Customer-managed encryption keys

## 💰 Cost Estimation

### Production (Monthly)
- **EKS Cluster**: ~$75
- **EC2 Nodes (3x t3.medium)**: ~$100
- **Jenkins EC2 (t3.large)**: ~$60
- **RDS (db.t3.small)**: ~$25
- **NAT Gateways**: ~$45
- **CloudWatch/Logs**: ~$10
- **Total**: ~$315/month

### Development (Monthly)
- **EKS Cluster**: ~$75
- **EC2 Nodes (2x t3.small)**: ~$30
- **Jenkins EC2 (t3.medium)**: ~$30
- **RDS (db.t3.micro)**: ~$12
- **NAT Gateway**: ~$15
- **Total**: ~$162/month

## 🔄 CI/CD Integration

### Jenkins Pipeline Configuration
```groovy
pipeline {
    agent any
    
    environment {
        AWS_REGION = 'us-west-2'
        EKS_CLUSTER_NAME = '${terraform output -raw eks_cluster_name}'
        ECR_REGISTRY = '${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com'
    }
    
    stages {
        stage('Build') {
            steps {
                script {
                    // Build Docker images
                    sh 'docker build -t islamic-app-frontend ./frontend'
                    sh 'docker build -t islamic-app-backend ./backend'
                }
            }
        }
        
        stage('Push to ECR') {
            steps {
                script {
                    // Push to ECR
                    sh 'aws ecr get-login-password | docker login --username AWS --password-stdin ${ECR_REGISTRY}'
                    sh 'docker tag islamic-app-frontend:latest ${ECR_REGISTRY}/islamic-app-frontend:${BUILD_NUMBER}'
                    sh 'docker push ${ECR_REGISTRY}/islamic-app-frontend:${BUILD_NUMBER}'
                }
            }
        }
        
        stage('Deploy to EKS') {
            steps {
                script {
                    // Update kubeconfig and deploy
                    sh 'aws eks update-kubeconfig --region ${AWS_REGION} --name ${EKS_CLUSTER_NAME}'
                    sh 'helm upgrade --install islamic-app ./helm-chart --set image.tag=${BUILD_NUMBER}'
                }
            }
        }
    }
}
```

## 🛠️ Troubleshooting

### Common Issues

**EKS Access Denied**
```bash
# Update kubeconfig
aws eks update-kubeconfig --region us-west-2 --name your-cluster-name

# Check IAM permissions
aws sts get-caller-identity
```

**Jenkins Connection Issues**
```bash
# Check security group
aws ec2 describe-security-groups --group-ids sg-xxx

# SSH to Jenkins instance
ssh -i islamic-app-key.pem ec2-user@$(terraform output -raw jenkins_public_ip)

# Check Jenkins container
sudo docker ps
sudo docker logs jenkins
```

**RDS Connection Issues**
```bash
# Test database connectivity
nc -zv $(terraform output -raw rds_endpoint) 5432

# Check security groups
aws rds describe-db-instances --db-instance-identifier your-db-name
```

## 📚 Additional Resources

- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Jenkins on AWS](https://docs.aws.amazon.com/whitepapers/latest/jenkins-on-aws/jenkins-on-aws.html)

## 🤝 Contributing

1. Make changes in feature branches
2. Test with `terraform plan`
3. Update documentation
4. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
