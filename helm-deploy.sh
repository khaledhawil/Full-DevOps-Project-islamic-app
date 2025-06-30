#!/bin/bash

# Helm deployment script for Islamic App
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CHART_PATH="./helm/islamic-app"
RELEASE_NAME="islamic-app"
NAMESPACE="islamic-app"
ENVIRONMENT=""
CUSTOM_DOMAIN=""
VALUES_FILE=""

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if helm is installed
check_helm() {
    if ! command -v helm &> /dev/null; then
        print_error "Helm is not installed. Please install Helm first."
        exit 1
    fi
    print_status "Helm is installed: $(helm version --short)"
}

# Function to validate chart
validate_chart() {
    print_status "Validating Helm chart..."
    helm lint "$CHART_PATH"
    if [ $? -eq 0 ]; then
        print_status "Chart validation passed"
    else
        print_error "Chart validation failed"
        exit 1
    fi
}

# Function to create namespace
create_namespace() {
    print_status "Checking namespace..."
    
    # Check if namespace exists
    if kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
        print_warning "Namespace $NAMESPACE already exists. Checking if it's managed by Helm..."
        
        # Check if namespace has proper Helm labels
        HELM_MANAGED=$(kubectl get namespace "$NAMESPACE" -o jsonpath='{.metadata.labels.app\.kubernetes\.io/managed-by}' 2>/dev/null || echo "")
        
        if [ "$HELM_MANAGED" != "Helm" ]; then
            print_warning "Namespace exists but not managed by Helm. Deleting and recreating..."
            kubectl delete namespace "$NAMESPACE" --ignore-not-found
            print_status "Namespace deleted. Helm will create it with proper labels."
        else
            print_status "Namespace is properly managed by Helm."
        fi
    else
        print_status "Namespace $NAMESPACE will be created by Helm."
    fi
}

# Function to deploy the chart
deploy_chart() {
    print_status "Deploying Islamic App with Helm..."
    
    # Determine values file based on environment
    local helm_args=()
    
    if [ -n "$ENVIRONMENT" ]; then
        ENV_VALUES_FILE="$CHART_PATH/values-$ENVIRONMENT.yaml"
        if [ -f "$ENV_VALUES_FILE" ]; then
            print_status "Using environment-specific values: $ENV_VALUES_FILE"
            helm_args+=("-f" "$ENV_VALUES_FILE")
        else
            print_warning "Environment values file not found: $ENV_VALUES_FILE"
        fi
    fi
    
    if [ -n "$VALUES_FILE" ]; then
        if [ -f "$VALUES_FILE" ]; then
            print_status "Using custom values file: $VALUES_FILE"
            helm_args+=("-f" "$VALUES_FILE")
        else
            print_error "Custom values file not found: $VALUES_FILE"
            exit 1
        fi
    fi
    
    if [ -n "$CUSTOM_DOMAIN" ]; then
        print_status "Using custom domain: $CUSTOM_DOMAIN"
        helm_args+=("--set" "environment.domain=$CUSTOM_DOMAIN")
        helm_args+=("--set" "ingress.hosts[0].host=$CUSTOM_DOMAIN")
    fi
    
    helm upgrade --install "$RELEASE_NAME" "$CHART_PATH" \
        --namespace "$NAMESPACE" \
        --create-namespace \
        --wait \
        --timeout 300s \
        "${helm_args[@]}" \
        "$@"
    
    if [ $? -eq 0 ]; then
        print_status "Deployment successful!"
    else
        print_error "Deployment failed!"
        exit 1
    fi
}

# Function to check deployment status
check_status() {
    print_status "Checking deployment status..."
    kubectl get pods -n "$NAMESPACE"
    echo ""
    kubectl get services -n "$NAMESPACE"
    echo ""
    kubectl get ingress -n "$NAMESPACE"
}

# Function to get application URL
get_app_url() {
    print_status "Getting application URL..."
    INGRESS_IP=$(kubectl get ingress -n "$NAMESPACE" -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "localhost")
    if [ "$INGRESS_IP" = "localhost" ] || [ -z "$INGRESS_IP" ]; then
        INGRESS_IP=$(kubectl get ingress -n "$NAMESPACE" -o jsonpath='{.items[0].spec.rules[0].host}' 2>/dev/null || echo "islamic-app.local")
    fi
    echo ""
    print_status "Application should be available at: http://$INGRESS_IP"
    print_warning "Make sure to add '$INGRESS_IP islamic-app.local' to your /etc/hosts file if using local development"
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -e, --environment ENV   Environment to deploy (kind, aws, gcp, azure, generic)"
    echo "  -v, --values FILE       Specify custom values file"
    echo "  -d, --domain DOMAIN     Override domain name"
    echo "  --dry-run              Perform a dry run deployment"
    echo "  --uninstall            Uninstall the application"
    echo "  --upgrade              Upgrade existing installation"
    echo "  --status               Check deployment status"
    echo ""
    echo "Environments:"
    echo "  kind      - Local Kind cluster (development)"
    echo "  aws       - Amazon EKS cluster"
    echo "  gcp       - Google GKE cluster"
    echo "  azure     - Azure AKS cluster"
    echo "  generic   - Generic Kubernetes cluster"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Deploy with default values"
    echo "  $0 -e kind                           # Deploy to Kind cluster"
    echo "  $0 -e aws -d my-app.com             # Deploy to AWS with custom domain"
    echo "  $0 -v custom-values.yaml            # Deploy with custom values"
    echo "  $0 --dry-run                        # Dry run deployment"
    echo "  $0 --uninstall                      # Uninstall application"
}

# Function to uninstall
uninstall_app() {
    print_warning "Uninstalling Islamic App..."
    helm uninstall "$RELEASE_NAME" -n "$NAMESPACE"
    kubectl delete namespace "$NAMESPACE" --ignore-not-found
    print_status "Application uninstalled successfully"
}

# Main script
main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -v|--values)
                VALUES_FILE="$2"
                shift 2
                ;;
            -d|--domain)
                CUSTOM_DOMAIN="$2"
                shift 2
                ;;
            --uninstall)
                uninstall_app
                exit 0
                ;;
            --status)
                check_status
                exit 0
                ;;
            --dry-run)
                check_helm
                validate_chart
                print_status "Performing dry run..."
                
                local helm_args=()
                if [ -n "$ENVIRONMENT" ]; then
                    ENV_VALUES_FILE="$CHART_PATH/values-$ENVIRONMENT.yaml"
                    if [ -f "$ENV_VALUES_FILE" ]; then
                        helm_args+=("-f" "$ENV_VALUES_FILE")
                    fi
                fi
                if [ -n "$VALUES_FILE" ]; then
                    helm_args+=("-f" "$VALUES_FILE")
                fi
                if [ -n "$CUSTOM_DOMAIN" ]; then
                    helm_args+=("--set" "environment.domain=$CUSTOM_DOMAIN")
                fi
                
                helm upgrade --install "$RELEASE_NAME" "$CHART_PATH" \
                    --namespace "$NAMESPACE" \
                    --create-namespace \
                    --dry-run \
                    "${helm_args[@]}"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    check_helm
    validate_chart
    create_namespace
    deploy_chart
    check_status
    get_app_url
}

# Run main function with all arguments
main "$@"
