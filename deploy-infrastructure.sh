#!/bin/bash

# Complete Infrastructure Deployment Script
# Islamic App - Terraform + Ansible Automation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}=== $1 ===${NC}"
}

print_step() {
    echo -e "${CYAN}STEP: $1${NC}"
}

# Show banner
show_banner() {
    echo "🚀 Islamic App - Complete Infrastructure Deployment"
    echo "=================================================="
    echo "🏗️  Terraform: Creates AWS Infrastructure"
    echo "🔧 Ansible: Configures and Sets Up Software"
    echo "⏱️  Total Time: ~75 minutes"
    echo "💰 Estimated Cost: ~$315/month (production)"
    echo "=================================================="
    echo
}

# Check prerequisites
check_prerequisites() {
    print_header "CHECKING PREREQUISITES"
    
    local missing_tools=()
    
    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        missing_tools+=("terraform")
    else
        print_success "Terraform found: $(terraform version | head -n1)"
    fi
    
    # Check Ansible
    if ! command -v ansible &> /dev/null; then
        missing_tools+=("ansible")
    else
        print_success "Ansible found: $(ansible --version | head -n1)"
    fi
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        missing_tools+=("aws-cli")
    else
        print_success "AWS CLI found: $(aws --version)"
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured!"
        echo "Please run: aws configure"
        exit 1
    else
        print_success "AWS credentials configured"
    fi
    
    # Check Python packages
    if ! python3 -c "import boto3, kubernetes, docker" &> /dev/null; then
        print_warning "Some Python packages missing. Installing..."
        pip3 install boto3 kubernetes docker
    else
        print_success "Python packages available"
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing tools: ${missing_tools[*]}"
        echo
        echo "Install missing tools:"
        for tool in "${missing_tools[@]}"; do
            case $tool in
                "terraform")
                    echo "  Terraform: https://learn.hashicorp.com/tutorials/terraform/install-cli"
                    ;;
                "ansible")
                    echo "  Ansible: sudo apt install ansible"
                    ;;
                "aws-cli")
                    echo "  AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
                    ;;
            esac
        done
        exit 1
    fi
    
    print_success "All prerequisites met!"
    echo
}

# Deploy infrastructure with Terraform
deploy_terraform() {
    print_header "PHASE 1: TERRAFORM INFRASTRUCTURE DEPLOYMENT"
    
    cd terraform/
    
    print_step "1/4 - Initializing Terraform backend"
    ./deploy.sh init
    
    print_step "2/4 - Planning infrastructure changes"
    ./deploy.sh plan
    
    print_step "3/4 - Applying infrastructure (this takes ~20 minutes)"
    echo "This will create AWS resources and incur costs."
    read -p "Continue with Terraform deployment? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./deploy.sh apply
        print_success "Terraform deployment completed!"
    else
        print_warning "Terraform deployment cancelled."
        exit 0
    fi
    
    print_step "4/4 - Saving Terraform outputs"
    terraform output -json > terraform-outputs.json
    print_success "Infrastructure information saved to terraform-outputs.json"
    
    cd ..
    echo
}

# Configure infrastructure with Ansible
deploy_ansible() {
    print_header "PHASE 2: ANSIBLE CONFIGURATION MANAGEMENT"
    
    cd ansible/
    
    print_step "1/4 - Waiting for servers to be ready"
    echo "Waiting 3 minutes for EC2 instances to fully initialize..."
    sleep 180
    
    print_step "2/4 - Discovering infrastructure"
    # Test dynamic inventory
    ansible-inventory -i inventories/production/aws_ec2.yml --list > /tmp/inventory.json
    print_success "Infrastructure discovered via AWS API"
    
    print_step "3/4 - Running configuration playbooks (this takes ~15 minutes)"
    echo "This will configure Jenkins, Kubernetes, and monitoring."
    read -p "Continue with Ansible configuration? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Run main playbook
        ansible-playbook -i inventories/production/aws_ec2.yml site.yml -v
        print_success "Ansible configuration completed!"
    else
        print_warning "Ansible configuration cancelled."
        exit 0
    fi
    
    print_step "4/4 - Running post-deployment verification"
    ansible-playbook -i inventories/production/aws_ec2.yml playbooks/verify.yml
    
    cd ..
    echo
}

# Show access information
show_access_info() {
    print_header "PHASE 3: ACCESS INFORMATION"
    
    cd terraform/
    
    print_success "🎉 Deployment completed successfully!"
    echo
    
    print_step "Infrastructure Access URLs:"
    
    # Get outputs
    JENKINS_URL=$(terraform output -raw jenkins_url 2>/dev/null || echo "Not available")
    JENKINS_IP=$(terraform output -raw jenkins_public_ip 2>/dev/null || echo "Not available")
    EKS_CLUSTER=$(terraform output -raw eks_cluster_name 2>/dev/null || echo "Not available")
    RDS_ENDPOINT=$(terraform output -raw rds_endpoint 2>/dev/null || echo "Not available")
    
    echo "📊 Jenkins CI/CD:"
    echo "   URL: $JENKINS_URL"
    echo "   IP:  $JENKINS_IP"
    echo
    
    echo "☸️  Kubernetes Cluster:"
    echo "   Name: $EKS_CLUSTER"
    echo "   Configure: aws eks update-kubeconfig --region us-west-2 --name $EKS_CLUSTER"
    echo
    
    echo "🗄️  Database:"
    echo "   Endpoint: $RDS_ENDPOINT"
    echo "   Get credentials: aws secretsmanager get-secret-value --secret-id \$(terraform output -raw database_secret_arn)"
    echo
    
    print_step "Getting Service Passwords:"
    
    # Jenkins password
    echo "🔑 Jenkins Admin Password:"
    if [ "$JENKINS_IP" != "Not available" ]; then
        echo "   SSH command: ssh -i ~/.ssh/islamic-app-key.pem ec2-user@$JENKINS_IP"
        echo "   Then run: sudo docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
    else
        echo "   Jenkins IP not available"
    fi
    echo
    
    # ArgoCD password
    echo "🔑 ArgoCD Admin Password:"
    echo "   Command: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"
    echo
    
    # Grafana password
    echo "🔑 Grafana Admin Password:"
    echo "   Username: admin"
    echo "   Password: islamic-app-admin"
    echo
    
    cd ..
}

# Verification tests
run_verification() {
    print_header "PHASE 4: VERIFICATION TESTS"
    
    cd terraform/
    EKS_CLUSTER=$(terraform output -raw eks_cluster_name 2>/dev/null || echo "")
    cd ..
    
    if [ -n "$EKS_CLUSTER" ]; then
        print_step "Testing Kubernetes connectivity"
        aws eks update-kubeconfig --region us-west-2 --name "$EKS_CLUSTER" &>/dev/null
        
        if kubectl get nodes &>/dev/null; then
            print_success "✅ Kubernetes cluster is accessible"
            echo "   Nodes: $(kubectl get nodes --no-headers | wc -l)"
        else
            print_warning "⚠️  Kubernetes cluster not ready yet"
        fi
        
        if kubectl get pods -n argocd &>/dev/null; then
            print_success "✅ ArgoCD is installed"
        else
            print_warning "⚠️  ArgoCD not ready yet"
        fi
        
        if kubectl get pods -n monitoring &>/dev/null; then
            print_success "✅ Monitoring stack is installed"
        else
            print_warning "⚠️  Monitoring stack not ready yet"
        fi
    fi
    
    print_step "Testing Jenkins connectivity"
    cd terraform/
    JENKINS_IP=$(terraform output -raw jenkins_public_ip 2>/dev/null || echo "")
    if [ -n "$JENKINS_IP" ]; then
        if curl -s "http://$JENKINS_IP:8080" &>/dev/null; then
            print_success "✅ Jenkins is accessible"
        else
            print_warning "⚠️  Jenkins not ready yet (may take a few more minutes)"
        fi
    fi
    cd ..
}

# Create next steps guide
create_next_steps() {
    print_header "NEXT STEPS GUIDE"
    
    cat > NEXT_STEPS.md << 'EOF'
# 🚀 Next Steps After Infrastructure Deployment

## Immediate Actions (Do These First)

### 1. 🔑 Get Access Credentials
```bash
# Get Jenkins password
ssh -i ~/.ssh/islamic-app-key.pem ec2-user@$(cd terraform && terraform output -raw jenkins_public_ip)
sudo docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# Get ArgoCD password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d
```

### 2. ☸️ Configure Kubernetes Access
```bash
# Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name $(cd terraform && terraform output -raw eks_cluster_name)

# Verify cluster access
kubectl get nodes
kubectl get pods --all-namespaces
```

### 3. 🔧 Access Services
- **Jenkins**: http://$(cd terraform && terraform output -raw jenkins_public_ip):8080
- **ArgoCD**: `kubectl port-forward svc/argocd-server -n argocd 8080:443`
- **Grafana**: `kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 3000:80`

## Development Workflow

### 4. 🏗️ Deploy Your Islamic App
```bash
# Navigate to your application manifests
cd k8s/

# Apply Kubernetes manifests
kubectl apply -f .

# Or use ArgoCD for GitOps deployment
cd ../argocd/
./deploy.sh
```

### 5. 🔄 Set Up CI/CD Pipeline
1. Access Jenkins web interface
2. Create new pipeline job
3. Connect to your GitHub repository
4. Configure webhook (use ngrok for local development)
5. Set up Discord notifications

### 6. 📊 Monitor Your Applications
1. Access Grafana dashboard
2. Import Islamic App dashboards
3. Set up alerting rules
4. Configure CloudWatch log insights

## Security Hardening

### 7. 🔒 Secure Your Infrastructure
```bash
# Change default passwords
# Set up SSL certificates
# Configure security groups
# Enable AWS Config rules
# Set up AWS GuardDuty
```

## Cost Optimization

### 8. 💰 Optimize Costs
- Schedule non-production resources to shut down at night
- Use spot instances for development
- Enable AWS Cost Explorer alerts
- Review resource utilization monthly

## Backup Strategy

### 9. 💾 Set Up Backups
- Database automated backups (already configured)
- EKS cluster state backup
- Jenkins configuration backup
- Application data backup

## Monitoring and Alerting

### 10. 📈 Enhance Monitoring
- Set up custom CloudWatch metrics
- Configure SNS notifications
- Create application health checks
- Set up log aggregation

## Need Help?

- 📖 Check the main documentation: `TERRAFORM_ANSIBLE_GUIDE.md`
- 🔍 Troubleshooting guide in `docs/TROUBLESHOOTING.md`
- 💬 Discord notifications for build status
- 📧 CloudWatch alerts for infrastructure issues

Happy coding! 🎉
EOF
    
    print_success "Next steps guide created: NEXT_STEPS.md"
}

# Show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo
    echo "Deploy Islamic App infrastructure using Terraform and Ansible"
    echo
    echo "Options:"
    echo "  deploy          Full deployment (Terraform + Ansible)"
    echo "  terraform       Deploy only infrastructure (Terraform)"
    echo "  ansible         Configure only (Ansible) - requires existing infrastructure"
    echo "  verify          Run verification tests"
    echo "  info            Show access information"
    echo "  destroy         Destroy all infrastructure"
    echo "  help            Show this help message"
    echo
    echo "Examples:"
    echo "  $0 deploy       # Full deployment"
    echo "  $0 terraform    # Infrastructure only"
    echo "  $0 ansible      # Configuration only"
    echo "  $0 destroy      # Remove everything"
}

# Destroy infrastructure
destroy_infrastructure() {
    print_header "DESTROYING INFRASTRUCTURE"
    
    print_warning "⚠️  This will destroy ALL infrastructure and data!"
    print_warning "⚠️  This action cannot be undone!"
    echo
    read -p "Are you absolutely sure? Type 'yes' to confirm: " CONFIRM
    
    if [ "$CONFIRM" = "yes" ]; then
        print_step "Destroying Terraform infrastructure"
        cd terraform/
        terraform destroy
        cd ..
        print_success "Infrastructure destroyed!"
    else
        print_warning "Destruction cancelled."
    fi
}

# Main function
main() {
    show_banner
    
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            deploy_terraform
            deploy_ansible
            run_verification
            show_access_info
            create_next_steps
            ;;
        "terraform")
            check_prerequisites
            deploy_terraform
            show_access_info
            ;;
        "ansible")
            deploy_ansible
            run_verification
            ;;
        "verify")
            run_verification
            ;;
        "info")
            show_access_info
            ;;
        "destroy")
            destroy_infrastructure
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
