#!/bin/bash

# Ansible Configuration Management Script
# For Islamic App DevOps Project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Ansible
    if ! command -v ansible &> /dev/null; then
        print_error "Ansible is not installed. Installing Ansible..."
        if command -v pip3 &> /dev/null; then
            pip3 install ansible
        elif command -v yum &> /dev/null; then
            sudo yum install -y python3-pip
            pip3 install ansible
        else
            print_error "Please install Ansible manually"
            exit 1
        fi
    fi
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Install required Ansible collections
    print_status "Installing Ansible collections..."
    ansible-galaxy collection install kubernetes.core
    ansible-galaxy collection install amazon.aws
    ansible-galaxy collection install community.docker
    
    print_success "All prerequisites met!"
}

# Update inventory with Terraform outputs
update_inventory() {
    print_status "Updating inventory with Terraform outputs..."
    
    if [ ! -f "../terraform/terraform-outputs.json" ]; then
        print_warning "Terraform outputs not found. Running terraform output..."
        cd ../terraform && terraform output -json > terraform-outputs.json && cd ../ansible
    fi
    
    # Extract values from Terraform outputs
    JENKINS_IP=$(jq -r '.jenkins_public_ip.value' ../terraform/terraform-outputs.json)
    EKS_CLUSTER=$(jq -r '.eks_cluster_name.value' ../terraform/terraform-outputs.json)
    RDS_ENDPOINT=$(jq -r '.rds_endpoint.value' ../terraform/terraform-outputs.json)
    
    # Update hosts.yml with actual values
    sed -i "s/ansible_host: .*/ansible_host: $JENKINS_IP/" inventories/production/hosts.yml
    sed -i "s/kubernetes_cluster_name: .*/kubernetes_cluster_name: $EKS_CLUSTER/" inventories/production/hosts.yml
    sed -i "s/database_endpoint: .*/database_endpoint: $RDS_ENDPOINT/" inventories/production/hosts.yml
    
    print_success "Inventory updated with Terraform outputs!"
}

# Test connection to hosts
test_connection() {
    print_status "Testing connection to hosts..."
    
    if ansible all -m ping --ask-pass; then
        print_success "Connection test successful!"
    else
        print_warning "Connection test failed. Trying with SSH key..."
        if [ -f ~/.ssh/islamic-app-key.pem ]; then
            ansible all -m ping --private-key ~/.ssh/islamic-app-key.pem
        else
            print_error "SSH key not found. Please ensure islamic-app-key.pem is in ~/.ssh/"
            exit 1
        fi
    fi
}

# Run specific playbook
run_playbook() {
    local playbook=$1
    print_status "Running playbook: $playbook"
    
    ansible-playbook $playbook --private-key ~/.ssh/islamic-app-key.pem -v
    
    if [ $? -eq 0 ]; then
        print_success "Playbook $playbook completed successfully!"
    else
        print_error "Playbook $playbook failed!"
        exit 1
    fi
}

# Configure infrastructure
configure_infrastructure() {
    print_status "Configuring infrastructure with Ansible..."
    
    # Run main site playbook
    run_playbook "site.yml"
    
    print_success "Infrastructure configuration completed!"
}

# Deploy applications
deploy_applications() {
    print_status "Deploying applications..."
    
    # Create deployment playbook
    cat > deploy-apps.yml << 'EOF'
---
- name: Deploy Islamic App to Kubernetes
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Apply Kubernetes manifests
      kubernetes.core.k8s:
        state: present
        src: "{{ item }}"
      loop:
        - ../k8s/00-namespace.yaml
        - ../k8s/01-secrets-configmap.yaml
        - ../k8s/02-persistent-storage.yaml
        - ../k8s/03-postgres.yaml
        - ../k8s/04-backend.yaml
        - ../k8s/05-frontend.yaml
        - ../k8s/06-nginx.yaml
        - ../k8s/07-ingress.yaml
        - ../k8s/08-hpa.yaml
      tags: k8s_deploy

    - name: Apply ArgoCD applications
      kubernetes.core.k8s:
        state: present
        src: "{{ item }}"
      loop:
        - ../argocd/project.yaml
        - ../argocd/application.yaml
        - ../argocd/application-staging.yaml
      tags: argocd_deploy
EOF
    
    run_playbook "deploy-apps.yml"
    
    print_success "Applications deployed successfully!"
}

# Main function
main() {
    echo "🤖 Islamic App - Ansible Configuration Management"
    echo "==============================================="
    echo
    
    check_prerequisites
    echo
    
    update_inventory
    echo
    
    test_connection
    echo
    
    configure_infrastructure
    echo
    
    deploy_applications
    echo
    
    print_success "🎉 Configuration management completed successfully!"
    print_status "Infrastructure is now fully configured and applications are deployed!"
    
    # Display useful information
    echo
    echo "📋 Next Steps:"
    echo "1. Access Jenkins: $(jq -r '.jenkins_url.value' ../terraform/terraform-outputs.json)"
    echo "2. Access ArgoCD: Get LoadBalancer IP with 'kubectl get svc -n argocd'"
    echo "3. Access Grafana: Get LoadBalancer IP with 'kubectl get svc -n monitoring'"
    echo "4. Check application status: kubectl get pods -n islamic-app"
}

# Handle script arguments
case "${1:-}" in
    "check")
        check_prerequisites
        ;;
    "inventory")
        update_inventory
        ;;
    "test")
        test_connection
        ;;
    "configure")
        configure_infrastructure
        ;;
    "deploy")
        deploy_applications
        ;;
    "site")
        run_playbook "site.yml"
        ;;
    *)
        main
        ;;
esac
