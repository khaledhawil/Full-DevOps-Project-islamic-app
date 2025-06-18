#!/bin/bash

# Terraform AWS Infrastructure Deployment Script
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
    
    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install Terraform first."
        exit 1
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
    
    print_success "All prerequisites met!"
}

# Initialize Terraform
init_terraform() {
    print_status "Initializing Terraform..."
    
    # Create S3 bucket for state if it doesn't exist
    BUCKET_NAME="islamic-app-terraform-state"
    REGION="us-west-2"
    
    if ! aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
        print_status "Creating S3 bucket for Terraform state..."
        aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
        aws s3api put-bucket-versioning --bucket "$BUCKET_NAME" --versioning-configuration Status=Enabled
        aws s3api put-bucket-encryption --bucket "$BUCKET_NAME" --server-side-encryption-configuration '{
            "Rules": [
                {
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }
            ]
        }'
    fi
    
    # Create DynamoDB table for state locking
    TABLE_NAME="islamic-app-terraform-locks"
    if ! aws dynamodb describe-table --table-name "$TABLE_NAME" &> /dev/null; then
        print_status "Creating DynamoDB table for Terraform state locking..."
        aws dynamodb create-table \
            --table-name "$TABLE_NAME" \
            --attribute-definitions AttributeName=LockID,AttributeType=S \
            --key-schema AttributeName=LockID,KeyType=HASH \
            --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
            --region "$REGION"
        
        # Wait for table to be active
        aws dynamodb wait table-exists --table-name "$TABLE_NAME" --region "$REGION"
    fi
    
    terraform init
    print_success "Terraform initialized!"
}

# Plan infrastructure
plan_infrastructure() {
    print_status "Planning infrastructure..."
    
    # Check if terraform.tfvars exists
    if [ ! -f "terraform.tfvars" ]; then
        if [ -f "environments/production/terraform.tfvars" ]; then
            cp environments/production/terraform.tfvars .
            print_status "Using production configuration"
        else
            print_error "No terraform.tfvars found. Please create one or copy from environments/"
            exit 1
        fi
    fi
    
    # Prompt for database password if not set
    if ! grep -q "database_password" terraform.tfvars; then
        print_warning "Database password not set in terraform.tfvars"
        read -s -p "Enter database password: " DB_PASSWORD
        echo ""
        echo "database_password = \"$DB_PASSWORD\"" >> terraform.tfvars
    fi
    
    terraform plan -out=tfplan
    print_success "Infrastructure plan created!"
}

# Apply infrastructure
apply_infrastructure() {
    print_status "Applying infrastructure..."
    
    echo "This will create AWS resources that may incur costs."
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        terraform apply tfplan
        print_success "Infrastructure deployed successfully!"
        
        # Display outputs
        print_status "Infrastructure Information:"
        terraform output
        
        # Save outputs to file
        terraform output -json > terraform-outputs.json
        print_status "Outputs saved to terraform-outputs.json"
        
    else
        print_warning "Deployment cancelled."
        exit 0
    fi
}

# Main deployment function
main() {
    echo "🚀 Islamic App - AWS Infrastructure Deployment"
    echo "=============================================="
    echo
    
    check_prerequisites
    echo
    
    init_terraform
    echo
    
    plan_infrastructure
    echo
    
    apply_infrastructure
    echo
    
    print_success "🎉 Deployment completed successfully!"
    print_status "Next steps:"
    echo "1. Configure kubectl: aws eks update-kubeconfig --region us-west-2 --name \$(terraform output -raw eks_cluster_name)"
    echo "2. Access Jenkins: \$(terraform output -raw jenkins_url)"
    echo "3. Deploy applications: cd ../k8s && ./deploy.sh"
    echo "4. Setup ArgoCD: cd ../argocd && ./deploy.sh"
}

# Handle script arguments
case "${1:-}" in
    "init")
        check_prerequisites
        init_terraform
        ;;
    "plan")
        check_prerequisites
        plan_infrastructure
        ;;
    "apply")
        apply_infrastructure
        ;;
    "destroy")
        print_warning "This will destroy all infrastructure!"
        read -p "Are you sure? Type 'yes' to confirm: " CONFIRM
        if [ "$CONFIRM" = "yes" ]; then
            terraform destroy
            print_success "Infrastructure destroyed!"
        else
            print_warning "Destruction cancelled."
        fi
        ;;
    *)
        main
        ;;
esac
