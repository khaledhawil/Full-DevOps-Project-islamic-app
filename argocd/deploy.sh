#!/bin/bash

# ArgoCD Application Deployment Script for Islamic App
# This script deploys the Islamic App using ArgoCD

set -e

echo "🚀 Deploying Islamic App with ArgoCD..."

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

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed or not in PATH"
    exit 1
fi

# Check if ArgoCD namespace exists
print_status "Checking ArgoCD installation..."
if ! kubectl get namespace argocd &> /dev/null; then
    print_error "ArgoCD namespace not found. Please install ArgoCD first."
    echo "Install ArgoCD with:"
    echo "kubectl create namespace argocd"
    echo "kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml"
    exit 1
fi

print_success "ArgoCD namespace found"

# Deploy the AppProject first
print_status "Deploying Islamic App Project..."
kubectl apply -f argocd/project.yaml

# Wait a moment for the project to be created
sleep 2

# Deploy the main application
print_status "Deploying Islamic App (Production)..."
kubectl apply -f argocd/application.yaml

# Optional: Deploy staging application
read -p "Do you want to deploy the staging application? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Deploying Islamic App (Staging)..."
    kubectl apply -f argocd/application-staging.yaml
fi

print_success "ArgoCD Applications deployed successfully!"

# Check application status
print_status "Checking application status..."
sleep 5

echo ""
echo "📊 Application Status:"
kubectl get applications -n argocd

echo ""
echo "🔗 To access ArgoCD UI:"
echo "kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "Then open: https://localhost:8080"

echo ""
echo "🔑 Get ArgoCD admin password:"
echo "kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"

echo ""
print_success "Deployment completed! 🎉"
echo ""
echo "📝 Next steps:"
echo "1. Access ArgoCD UI using the port-forward command above"
echo "2. Login with username 'admin' and the password from the command above"
echo "3. Monitor your applications in the ArgoCD dashboard"
echo "4. Applications will automatically sync with your Git repository"
