# Kubernetes Scripts Documentation

## Overview
This directory contains essential Kubernetes management scripts for building, deploying, and maintaining the Islamic App in a Kubernetes environment.

## Script Files

### 1. build-images.sh
**Purpose**: Build Docker images for all application components
**Usage**: `./build-images.sh`

#### Features
- Builds both frontend and backend Docker images
- Uses latest tags for development
- Validates Docker availability
- No-cache builds for clean images
- Cross-platform compatibility

#### Script Flow
```bash
# 1. Validate environment
- Check Docker installation
- Set project root directory
- Verify build contexts

# 2. Build backend image
cd backend/
docker build -t islamic-app-backend:latest . --no-cache

# 3. Build frontend image
cd frontend/
docker build -t islamic-app-frontend:latest . --no-cache

# 4. Verify images
docker images | grep islamic-app
```

#### Usage Examples
```bash
# Basic build
./k8s/build-images.sh

# Build with custom tags
BACKEND_TAG=v1.2.0 FRONTEND_TAG=v1.2.0 ./k8s/build-images.sh

# Build and push to registry
./k8s/build-images.sh && docker push islamic-app-backend:latest
```

### 2. deploy.sh
**Purpose**: Complete deployment script with image building and Kubernetes deployment
**Usage**: `./deploy.sh [environment]`

#### Features
- Builds Docker images
- Pushes to container registry
- Applies Kubernetes manifests
- Validates deployment status
- Environment-specific configurations

#### Script Flow
```bash
# 1. Build phase
./build-images.sh

# 2. Tag and push images
docker tag islamic-app-backend:latest $REGISTRY/islamic-app-backend:$TAG
docker push $REGISTRY/islamic-app-backend:$TAG

# 3. Update Kubernetes manifests
kubectl apply -f k8s/

# 4. Wait for deployment
kubectl rollout status deployment/backend -n islamic-app
kubectl rollout status deployment/frontend -n islamic-app
```

#### Environment Variables
```bash
export DOCKER_REGISTRY="khaledhawil"
export IMAGE_TAG="latest"
export NAMESPACE="islamic-app"
export ENVIRONMENT="production"
```

### 3. deploy-only.sh
**Purpose**: Deploy to Kubernetes without rebuilding images
**Usage**: `./deploy-only.sh`

#### Features
- Skips image building phase
- Uses existing images from registry
- Fast deployment for configuration changes
- Manifest validation
- Rollback on failure

#### Use Cases
- Configuration updates
- Scaling adjustments
- Quick fixes
- Environment promotion

#### Script Flow
```bash
# 1. Validate cluster access
kubectl cluster-info

# 2. Apply manifests in order
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets-configmap.yaml
kubectl apply -f 02-persistent-storage.yaml
kubectl apply -f 03-postgres.yaml
kubectl apply -f 04-backend.yaml
kubectl apply -f 05-frontend.yaml
kubectl apply -f 06-nginx.yaml
kubectl apply -f 07-ingress.yaml
kubectl apply -f 08-hpa.yaml

# 3. Verify deployment
kubectl get pods -n islamic-app
```

### 4. setup.sh
**Purpose**: Initial cluster setup and preparation
**Usage**: `./setup.sh`

#### Features
- Creates namespace
- Sets up RBAC permissions
- Installs required operators
- Configures ingress controllers
- Initializes monitoring

#### Setup Tasks
```bash
# 1. Cluster preparation
kubectl create namespace islamic-app

# 2. Install dependencies
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# 3. Setup monitoring
kubectl apply -f https://github.com/prometheus-operator/prometheus-operator/releases/download/v0.68.0/bundle.yaml

# 4. Configure storage classes
kubectl apply -f storage-class.yaml
```

### 5. cleanup.sh
**Purpose**: Clean up Kubernetes resources and development artifacts
**Usage**: `./cleanup.sh [--force]`

#### Features
- Removes Kubernetes resources
- Cleans up Docker images
- Removes persistent data (with confirmation)
- Namespace cleanup
- Registry cleanup

#### Cleanup Levels
```bash
# 1. Basic cleanup (default)
kubectl delete -f k8s/ --ignore-not-found=true

# 2. Force cleanup (--force flag)
kubectl delete namespace islamic-app --force --grace-period=0

# 3. Docker cleanup
docker system prune -a
docker volume prune
```

#### Safety Features
- Confirmation prompts for destructive operations
- Backup creation before cleanup
- Selective cleanup options
- Rollback capabilities

## Script Usage Patterns

### Development Workflow
```bash
# 1. Initial setup
./k8s/setup.sh

# 2. Build and deploy
./k8s/deploy.sh development

# 3. Iterate on changes
./k8s/build-images.sh
./k8s/deploy-only.sh

# 4. Cleanup when done
./k8s/cleanup.sh
```

### Production Workflow
```bash
# 1. Build with version tags
IMAGE_TAG=v1.2.0 ./k8s/build-images.sh

# 2. Tag for production
docker tag islamic-app-backend:latest islamic-app-backend:v1.2.0
docker tag islamic-app-frontend:latest islamic-app-frontend:v1.2.0

# 3. Push to production registry
docker push $PROD_REGISTRY/islamic-app-backend:v1.2.0
docker push $PROD_REGISTRY/islamic-app-frontend:v1.2.0

# 4. Deploy to production
ENVIRONMENT=production ./k8s/deploy.sh
```

### CI/CD Integration
```bash
# Jenkins pipeline usage
stage('Build Images') {
    sh './k8s/build-images.sh'
}

stage('Deploy to Staging') {
    sh 'ENVIRONMENT=staging ./k8s/deploy.sh'
}

stage('Deploy to Production') {
    sh 'ENVIRONMENT=production ./k8s/deploy-only.sh'
}
```

## Environment Configuration

### Development Environment
```bash
export NAMESPACE="islamic-app-dev"
export DOCKER_REGISTRY="localhost:5000"
export IMAGE_TAG="dev-$(git rev-parse --short HEAD)"
export REPLICAS=1
export RESOURCES_ENABLED=false
```

### Staging Environment
```bash
export NAMESPACE="islamic-app-staging"
export DOCKER_REGISTRY="khaledhawil"
export IMAGE_TAG="staging-$(date +%Y%m%d)"
export REPLICAS=2
export RESOURCES_ENABLED=true
```

### Production Environment
```bash
export NAMESPACE="islamic-app-prod"
export DOCKER_REGISTRY="khaledhawil"
export IMAGE_TAG="v$(cat VERSION)"
export REPLICAS=3
export RESOURCES_ENABLED=true
export MONITORING_ENABLED=true
```

## Script Customization

### Adding Custom Hooks
```bash
# pre-deploy hook
if [[ -f ./scripts/pre-deploy.sh ]]; then
    echo "Running pre-deploy hooks..."
    ./scripts/pre-deploy.sh
fi

# post-deploy hook
if [[ -f ./scripts/post-deploy.sh ]]; then
    echo "Running post-deploy hooks..."
    ./scripts/post-deploy.sh
fi
```

### Environment-Specific Overrides
```bash
# Load environment-specific configuration
if [[ -f ./config/${ENVIRONMENT}.env ]]; then
    source ./config/${ENVIRONMENT}.env
fi

# Apply environment-specific manifests
if [[ -d ./k8s/${ENVIRONMENT} ]]; then
    kubectl apply -f ./k8s/${ENVIRONMENT}/
fi
```

## Error Handling and Recovery

### Common Script Errors

#### Docker Build Failures
```bash
# Check Docker daemon
systemctl status docker

# Check disk space
df -h

# Clean up build cache
docker builder prune
```

#### Kubernetes Deployment Failures
```bash
# Check cluster connectivity
kubectl cluster-info

# Check resource availability
kubectl describe nodes

# Check pod status
kubectl get pods -n islamic-app -o wide
kubectl logs -f <pod-name> -n islamic-app
```

#### Image Push Failures
```bash
# Check registry authentication
docker login

# Check network connectivity
curl -I https://index.docker.io/

# Verify image exists
docker images | grep islamic-app
```

### Recovery Procedures
```bash
# Rollback deployment
kubectl rollout undo deployment/backend -n islamic-app
kubectl rollout undo deployment/frontend -n islamic-app

# Emergency cleanup
kubectl delete namespace islamic-app
./k8s/setup.sh
./k8s/deploy.sh
```

## Monitoring and Validation

### Deployment Validation
```bash
# Check pod status
kubectl get pods -n islamic-app

# Verify services
kubectl get services -n islamic-app

# Check ingress
kubectl get ingress -n islamic-app

# Test application endpoints
curl -f http://your-domain.com/health
```

### Performance Monitoring
```bash
# Resource usage
kubectl top pods -n islamic-app
kubectl top nodes

# Scaling status
kubectl get hpa -n islamic-app

# Logs monitoring
kubectl logs -f deployment/backend -n islamic-app
```

## Security Considerations

### Image Security
- Scan images with Trivy before deployment
- Use minimal base images
- Regular security updates
- Vulnerability monitoring

### Cluster Security
- RBAC permissions
- Network policies
- Pod security standards
- Secret management

### Access Control
- Limited script permissions
- Audit logging
- Multi-factor authentication
- Role-based access

## Best Practices

### Script Development
- Use set -e for error handling
- Validate prerequisites
- Provide clear output messages
- Include help documentation

### Deployment Practices
- Blue-green deployments
- Canary releases
- Health check validation
- Rollback procedures

### Maintenance
- Regular script updates
- Documentation maintenance
- Performance optimization
- Security reviews
