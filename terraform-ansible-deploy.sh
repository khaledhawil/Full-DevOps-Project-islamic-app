#!/bin/bash

# Islamic App Infrastructure Deployment Script
# This script deploys infrastructure using Terraform and configures it using Ansible

set -e

echo "🚀 Starting Islamic App Infrastructure Deployment..."

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
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install it first."
        exit 1
    fi
    
    # Check Ansible
    if ! command -v ansible &> /dev/null; then
        print_error "Ansible is not installed. Please install it first."
        exit 1
    fi
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    print_success "All dependencies are installed!"
}

# Deploy infrastructure with Terraform
deploy_terraform() {
    print_status "Deploying infrastructure with Terraform..."
    
    cd terraform
    
    # Initialize Terraform
    print_status "Initializing Terraform..."
    terraform init
    
    # Plan deployment
    print_status "Planning Terraform deployment..."
    terraform plan -out=tfplan
    
    # Apply deployment
    print_status "Applying Terraform deployment..."
    terraform apply tfplan
    
    # Clean up plan file
    rm -f tfplan
    
    print_success "Infrastructure deployed successfully!"
    cd ..
}

# Configure servers with Ansible
configure_ansible() {
    print_status "Configuring servers with Ansible..."
    
    cd ansible
    
    # Check if inventory file exists
    if [ ! -f "inventories/production/hosts.yml" ]; then
        print_error "Ansible inventory file not found. Terraform should have generated it."
        exit 1
    fi
    
    # Install required Ansible collections
    print_status "Installing required Ansible collections..."
    ansible-galaxy collection install kubernetes.core
    ansible-galaxy collection install community.docker
    
    # Run Ansible playbook
    print_status "Running Ansible playbook..."
    ansible-playbook -i inventories/production/hosts.yml site.yml
    
    print_success "Server configuration completed!"
    cd ..
}

# Generate SSH key if it doesn't exist
setup_ssh_key() {
    print_status "Setting up SSH key..."
    
    if [ ! -f ~/.ssh/islamic-app-key.pem ]; then
        print_status "Creating AWS key pair..."
        aws ec2 create-key-pair --key-name islamic-app-key --query 'KeyMaterial' --output text > ~/.ssh/islamic-app-key.pem
        chmod 400 ~/.ssh/islamic-app-key.pem
        print_success "SSH key created successfully!"
    else
        print_warning "SSH key already exists. Skipping creation."
    fi
}

# Main deployment function
main() {
    echo "============================================"
    echo "🕌 Islamic App Infrastructure Deployment 🕌"
    echo "============================================"
    echo
    
    check_dependencies
    setup_ssh_key
    deploy_terraform
    
    # Wait a bit for EC2 to be fully ready
    print_status "Waiting for EC2 instance to be fully ready..."
    sleep 60
    
    configure_ansible
    
    echo
    echo "============================================"
    print_success "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉"
    echo "============================================"
    echo
    
    # Display access information
    cd terraform
    terraform output next_steps
    cd ..
}

# Run main function
main
