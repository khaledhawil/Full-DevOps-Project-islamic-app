#!/bin/bash

# SonarQube and Jenkins Integration Setup Script
# This script helps set up SonarQube integration with Jenkins

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Get Jenkins IP from Terraform output
get_jenkins_ip() {
    if [ -f "terraform/terraform.tfstate" ]; then
        JENKINS_IP=$(cd terraform && terraform output -raw jenkins_public_ip)
        echo "Jenkins IP: $JENKINS_IP"
    else
        print_error "Terraform state not found. Please run terraform apply first."
        exit 1
    fi
}

# Setup SonarQube
setup_sonarqube() {
    print_status "Setting up SonarQube integration..."
    
    echo "=============================================="
    echo "🔧 SonarQube Setup Instructions"
    echo "=============================================="
    echo
    echo "1. 🌐 Access SonarQube:"
    echo "   URL: http://${JENKINS_IP}:9000"
    echo "   Default login: admin/admin"
    echo
    echo "2. 🔑 Change admin password:"
    echo "   - Login with admin/admin"
    echo "   - Go to Administration > Security > Users"
    echo "   - Change password to: Islamic@123"
    echo
    echo "3. 🎯 Create project:"
    echo "   - Go to Projects > Create Project"
    echo "   - Project key: islamic-app"
    echo "   - Display name: Islamic App"
    echo
    echo "4. 🔐 Generate token for Jenkins:"
    echo "   - Go to My Account > Security"
    echo "   - Generate token with name: jenkins-token"
    echo "   - Copy the token for Jenkins configuration"
    echo
    echo "5. ⚙️ Configure Jenkins:"
    echo "   - Go to Jenkins: http://${JENKINS_IP}:8080"
    echo "   - Manage Jenkins > Configure System"
    echo "   - Add SonarQube server:"
    echo "     * Name: SonarQube"
    echo "     * Server URL: http://localhost:9000"
    echo "     * Server authentication token: [paste token here]"
    echo
    echo "6. 🔧 Install SonarQube Scanner plugin in Jenkins:"
    echo "   - Manage Jenkins > Manage Plugins"
    echo "   - Available > Search 'SonarQube Scanner'"
    echo "   - Install without restart"
    echo
    echo "7. 📋 Add credentials in Jenkins:"
    echo "   - Manage Jenkins > Manage Credentials"
    echo "   - Add credential:"
    echo "     * Kind: Secret text"
    echo "     * Secret: [paste SonarQube token]"
    echo "     * ID: sonarqube-token"
    echo
    echo "=============================================="
    print_success "SonarQube setup instructions provided!"
    echo "=============================================="
}

# Automated SonarQube configuration
auto_configure_sonarqube() {
    print_status "Attempting automatic SonarQube configuration..."
    
    # Wait for SonarQube to be ready
    print_status "Waiting for SonarQube to be ready..."
    for i in {1..30}; do
        if curl -s "http://${JENKINS_IP}:9000/api/system/status" | grep -q "UP"; then
            print_success "SonarQube is ready!"
            break
        fi
        echo "Waiting... ($i/30)"
        sleep 10
    done
    
    # Configure SonarQube
    print_status "Configuring SonarQube..."
    
    # Change admin password
    curl -u admin:admin -X POST "http://${JENKINS_IP}:9000/api/users/change_password" \
        -d "login=admin&password=Islamic@123&previousPassword=admin" || true
    
    # Create project
    curl -u admin:Islamic@123 -X POST "http://${JENKINS_IP}:9000/api/projects/create" \
        -d "project=islamic-app&name=Islamic App" || true
    
    # Generate token
    TOKEN_RESPONSE=$(curl -u admin:Islamic@123 -X POST "http://${JENKINS_IP}:9000/api/user_tokens/generate" \
        -d "name=jenkins-token" 2>/dev/null || echo "{}")
    
    if echo "$TOKEN_RESPONSE" | grep -q "token"; then
        TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.token' 2>/dev/null || echo "")
        if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
            print_success "SonarQube token generated: $TOKEN"
            echo "$TOKEN" > sonarqube-token.txt
            print_warning "Token saved to sonarqube-token.txt - Use this in Jenkins credentials!"
        fi
    fi
}

# Test SonarQube connection
test_sonarqube() {
    print_status "Testing SonarQube connection..."
    
    if curl -s "http://${JENKINS_IP}:9000/api/system/status" | grep -q "UP"; then
        print_success "✅ SonarQube is accessible and running!"
    else
        print_error "❌ Cannot connect to SonarQube"
        return 1
    fi
}

# Main function
main() {
    echo "=============================================="
    echo "🔧 SonarQube Integration Setup"
    echo "=============================================="
    echo
    
    get_jenkins_ip
    
    case "${1:-manual}" in
        "auto")
            auto_configure_sonarqube
            ;;
        "test")
            test_sonarqube
            ;;
        *)
            setup_sonarqube
            ;;
    esac
    
    echo
    print_status "Next steps:"
    echo "1. Complete the SonarQube setup using the instructions above"
    echo "2. Run your Jenkins pipeline - it will now include code quality analysis!"
    echo "3. Check SonarQube dashboard for analysis results"
}

# Run main function
main "$@"
