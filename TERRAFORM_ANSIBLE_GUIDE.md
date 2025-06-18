# 🚀 Complete Infrastructure Guide: Terraform + Ansible

This guide explains **step by step** how to use **Terraform** and **Ansible** together to build the Islamic App infrastructure on AWS.

## 📋 What We're Building

```
┌─────────────────────────────────────────────────────────┐
│                    AWS CLOUD                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Jenkins   │  │ EKS Cluster │  │ RDS Database│     │
│  │   EC2       │  │ Kubernetes  │  │ PostgreSQL  │     │
│  │             │  │             │  │             │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│         │                 │                 │          │
│         └─────────────────┼─────────────────┘          │
│                           │                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │           CloudWatch Monitoring                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Simple Explanation

### **Terraform** = Building the Infrastructure
- **What it does**: Creates AWS resources (servers, databases, networks)
- **Think of it as**: The construction company that builds the building

### **Ansible** = Configuring the Infrastructure  
- **What it does**: Installs software and configures the servers
- **Think of it as**: The interior decorator that sets up everything inside

## 📚 Step-by-Step Guide

### **PHASE 1: Prerequisites (Getting Ready)**

#### Step 1: Install Required Tools
```bash
# Install Terraform
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform

# Install Ansible
sudo apt update
sudo apt install ansible python3-pip
pip3 install boto3 kubernetes docker

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install
```

#### Step 2: Configure AWS
```bash
# Set up your AWS credentials
aws configure
# Enter your: Access Key, Secret Key, Region (us-west-2), Output format (json)
```

---

### **PHASE 2: Infrastructure Creation with Terraform**

#### Step 3: What Terraform Will Create

**🏗️ Terraform creates these AWS resources:**

1. **VPC (Virtual Private Cloud)**
   - **What**: Private network in AWS
   - **Why**: Isolates our resources securely

2. **EKS Cluster** 
   - **What**: Managed Kubernetes cluster
   - **Why**: Runs our Islamic App containers

3. **EC2 Instance**
   - **What**: Virtual server for Jenkins
   - **Why**: Builds and deploys our code

4. **RDS Database**
   - **What**: Managed PostgreSQL database
   - **Why**: Stores Islamic App data

5. **CloudWatch**
   - **What**: Monitoring service
   - **Why**: Watches our infrastructure health

#### Step 4: Deploy Infrastructure with Terraform
```bash
# Navigate to terraform directory
cd terraform/

# Create infrastructure (this takes 15-20 minutes)
./deploy.sh
```

**What happens during deployment:**
1. ✅ Creates S3 bucket for Terraform state
2. ✅ Creates DynamoDB table for state locking  
3. ✅ Plans the infrastructure changes
4. ✅ Creates all AWS resources
5. ✅ Outputs important information (IPs, URLs, etc.)

---

### **PHASE 3: Configuration with Ansible**

#### Step 5: What Ansible Will Configure

**🔧 Ansible configures the servers:**

1. **Common Setup**
   - Installs basic tools (git, docker, kubectl)
   - Sets up directories and permissions
   - Configures system settings

2. **Jenkins Server**
   - Installs Docker and Jenkins
   - Installs required plugins
   - Connects to EKS cluster
   - Sets up CloudWatch Agent

3. **Kubernetes Cluster**
   - Installs ArgoCD for GitOps
   - Sets up monitoring (Prometheus/Grafana)
   - Creates namespaces and basic resources

4. **CloudWatch Monitoring**
   - Configures metrics collection
   - Sets up log aggregation
   - Creates custom dashboards

#### Step 6: Run Ansible Configuration
```bash
# Navigate to ansible directory
cd ../ansible/

# Run the main playbook
ansible-playbook -i inventories/production/aws_ec2.yml site.yml
```

**What happens during configuration:**
1. ✅ Discovers servers created by Terraform
2. ✅ Installs and configures Docker on Jenkins server
3. ✅ Sets up Jenkins with all required plugins
4. ✅ Configures Kubernetes cluster
5. ✅ Installs monitoring tools
6. ✅ Sets up CloudWatch monitoring

---

### **PHASE 4: Verification and Access**

#### Step 7: Access Your Services

**📊 Get Infrastructure Information:**
```bash
cd ../terraform/
terraform output
```

**🔧 Access Jenkins:**
```bash
# Get Jenkins URL
echo "Jenkins URL: $(terraform output -raw jenkins_url)"

# Get Jenkins password (SSH to server)
ssh -i ~/.ssh/islamic-app-key.pem ec2-user@$(terraform output -raw jenkins_public_ip)
sudo docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**☸️ Access Kubernetes:**
```bash
# Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name $(terraform output -raw eks_cluster_name)

# Check cluster status
kubectl get nodes
kubectl get pods --all-namespaces
```

**📈 Access Monitoring:**
```bash
# Get ArgoCD password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Access Grafana (get external IP)
kubectl get svc -n monitoring kube-prometheus-stack-grafana
```

---

## 🔄 How Terraform and Ansible Work Together

### **1. Information Flow**
```
Terraform → Creates Infrastructure → Outputs Info → Ansible Uses Info
```

### **2. Example Workflow**
1. **Terraform creates** EC2 instance with IP `1.2.3.4`
2. **Terraform outputs** this IP to `terraform-outputs.json`
3. **Ansible reads** the IP from Terraform outputs
4. **Ansible connects** to `1.2.3.4` and configures it

### **3. Key Integration Points**

#### **Terraform Outputs → Ansible Variables**
```hcl
# Terraform outputs.tf
output "jenkins_public_ip" {
  value = module.jenkins.public_ip
}
```

```yaml
# Ansible uses this in site.yml
- name: Get Terraform outputs
  shell: "cd {{ terraform_dir }} && terraform output -json"
  register: terraform_output_raw
```

#### **AWS Tags → Ansible Inventory**
```hcl
# Terraform tags resources
tags = {
  Project = "Islamic-App"
  Type    = "Jenkins-Server"
}
```

```yaml
# Ansible finds servers by tags
filters:
  tag:Project: Islamic-App
  tag:Type: Jenkins-Server
```

---

## 📁 Project Structure Explained

```
Full-DevOps-Project-islamic-app/
├── terraform/                    # 🏗️ Infrastructure Creation
│   ├── main.tf                   # Main configuration
│   ├── variables.tf              # Input variables
│   ├── outputs.tf               # Output values for Ansible
│   ├── deploy.sh                # Deployment script
│   └── modules/                 # Reusable components
│       ├── vpc/                 # Network setup
│       ├── eks/                 # Kubernetes cluster
│       ├── jenkins/             # Jenkins server
│       ├── rds/                 # Database
│       └── cloudwatch/          # Monitoring
├── ansible/                     # 🔧 Configuration Management
│   ├── site.yml                 # Main playbook
│   ├── ansible.cfg              # Ansible settings
│   ├── inventories/             # Server lists
│   │   └── production/
│   │       ├── aws_ec2.yml      # Dynamic inventory
│   │       └── hosts.yml        # Static inventory
│   └── roles/                   # Configuration tasks
│       ├── common/              # Basic setup
│       ├── docker/              # Docker installation
│       ├── jenkins/             # Jenkins configuration
│       ├── kubernetes/          # K8s setup
│       └── cloudwatch/          # Monitoring setup
├── k8s/                         # ☸️ Kubernetes Manifests
├── argocd/                      # 🔄 GitOps Configuration
└── backend/frontend/            # 💻 Application Code
```

---

## 🎯 What Each Component Does

### **Terraform Modules Explained**

#### **1. VPC Module** (`terraform/modules/vpc/`)
- **Creates**: Virtual network, subnets, internet gateway
- **Why**: Provides secure network foundation
- **Simple analogy**: Building the neighborhood streets

#### **2. EKS Module** (`terraform/modules/eks/`)
- **Creates**: Kubernetes cluster, worker nodes
- **Why**: Runs containerized applications
- **Simple analogy**: Creating a container shipping yard

#### **3. Jenkins Module** (`terraform/modules/jenkins/`)
- **Creates**: EC2 server for CI/CD
- **Why**: Builds and deploys code automatically
- **Simple analogy**: Setting up an automated factory

#### **4. RDS Module** (`terraform/modules/rds/`)
- **Creates**: PostgreSQL database
- **Why**: Stores application data securely
- **Simple analogy**: Building a secure warehouse

### **Ansible Roles Explained**

#### **1. Common Role** (`ansible/roles/common/`)
- **Does**: Installs basic tools, creates directories
- **Why**: Every server needs these basics
- **Simple analogy**: Setting up basic utilities in a new house

#### **2. Docker Role** (`ansible/roles/docker/`)
- **Does**: Installs Docker, configures containers
- **Why**: Our applications run in containers
- **Simple analogy**: Installing a container management system

#### **3. Jenkins Role** (`ansible/roles/jenkins/`)
- **Does**: Configures Jenkins, installs plugins
- **Why**: Automates building and deploying code
- **Simple analogy**: Setting up an automated assembly line

#### **4. Kubernetes Role** (`ansible/roles/kubernetes/`)
- **Does**: Installs ArgoCD, monitoring tools
- **Why**: Manages application deployments
- **Simple analogy**: Setting up quality control and oversight

---

## 🔍 Troubleshooting Common Issues

### **Terraform Issues**

#### **Problem**: "AWS credentials not found"
```bash
# Solution: Configure AWS CLI
aws configure
```

#### **Problem**: "Resource already exists"
```bash
# Solution: Import existing resource or destroy and recreate
terraform import aws_instance.example i-1234567890abcdef0
```

### **Ansible Issues**

#### **Problem**: "Host unreachable"
```bash
# Solution: Check security groups and SSH key
aws ec2 describe-security-groups --group-ids sg-xxxxx
ssh -i ~/.ssh/islamic-app-key.pem ec2-user@IP_ADDRESS
```

#### **Problem**: "Permission denied"
```bash
# Solution: Fix SSH key permissions
chmod 400 ~/.ssh/islamic-app-key.pem
```

---

## 📊 Cost Management

### **Monthly Cost Estimates**

#### **Production Environment (~$315/month)**
- EKS Cluster: $75
- EC2 Instances: $160
- RDS Database: $25
- NAT Gateways: $45
- CloudWatch: $10

#### **Development Environment (~$162/month)**
- EKS Cluster: $75
- EC2 Instances: $60
- RDS Database: $12
- NAT Gateway: $15

### **Cost Optimization Tips**
1. **Use Spot Instances** for development
2. **Schedule resources** to shut down at night
3. **Use smaller instance types** for testing
4. **Enable AWS Cost Alerts**

---

## 🚀 Deployment Timeline

### **Complete Deployment Process**

```
Start → Prerequisites (30 min) → Terraform (20 min) → Ansible (15 min) → Verification (10 min) → Done!
Total Time: ~75 minutes
```

#### **Detailed Timeline**
1. **Prerequisites Setup**: 30 minutes
   - Install tools, configure AWS
2. **Terraform Deployment**: 20 minutes
   - Creates all AWS infrastructure
3. **Ansible Configuration**: 15 minutes
   - Configures servers and installs software
4. **Verification & Access**: 10 minutes
   - Test everything works correctly

---

## 🎉 Success Criteria

### **✅ You know it's working when:**

1. **Terraform Success**:
   - All resources created without errors
   - Outputs display correctly
   - AWS console shows resources

2. **Ansible Success**:
   - Playbook completes without failures
   - Jenkins accessible via web browser
   - kubectl connects to EKS cluster

3. **Complete Success**:
   - Jenkins can build projects
   - Applications deploy to Kubernetes
   - Monitoring shows metrics
   - Database accepts connections

---

## 🔗 Integration with Existing Project

### **How This Connects to Your Islamic App**

1. **Your Jenkins Pipeline** → Now runs on AWS EC2
2. **Your Kubernetes Manifests** → Deploy to managed EKS
3. **Your ArgoCD Setup** → Manages deployments on EKS
4. **Your Discord Notifications** → Enhanced with CloudWatch alerts
5. **Your Database** → Now managed RDS PostgreSQL

### **Migration Path**
1. Deploy new infrastructure with Terraform + Ansible
2. Test with sample deployments
3. Migrate existing pipelines gradually
4. Switch DNS to new infrastructure
5. Decommission old infrastructure

---

This comprehensive setup gives you **enterprise-grade infrastructure** that's **scalable**, **secure**, and **fully automated**! 🚀
