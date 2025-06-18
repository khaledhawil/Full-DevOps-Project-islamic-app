# Kubernetes Documentation

## Overview
Complete Kubernetes deployment configuration for the Islamic App with microservices architecture, auto-scaling, and production-ready setup.

## Directory Structure
```
k8s/
├── 00-namespace.yaml           # Namespace definition
├── 01-secrets-configmap.yaml   # Secrets and ConfigMaps
├── 02-persistent-storage.yaml  # PersistentVolumes and Claims
├── 03-postgres.yaml           # PostgreSQL database
├── 04-backend.yaml            # Backend API service
├── 05-frontend.yaml           # Frontend React app
├── 06-nginx.yaml              # Nginx reverse proxy
├── 07-ingress.yaml            # Ingress controller
├── 08-hpa.yaml                # Horizontal Pod Autoscaler
├── build-images.sh            # Docker image build script
├── cleanup.sh                 # Cleanup script
├── deploy-only.sh             # Deploy without building
├── deploy.sh                  # Full deployment script
├── setup.sh                   # Initial cluster setup
└── README.md                  # Detailed deployment guide
```

## Kubernetes Manifests

### 00-namespace.yaml
Creates the `islamic-app` namespace for resource isolation.
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: islamic-app
  labels:
    app: islamic-app
    environment: production
```

### 01-secrets-configmap.yaml
Contains sensitive configuration data and application settings.

**Secrets:**
- Database credentials (username, password)
- JWT secret keys
- API keys for external services

**ConfigMaps:**
- Database connection strings
- Application configuration
- Environment-specific settings

### 02-persistent-storage.yaml
Defines storage for stateful components.

**PersistentVolumes:**
- PostgreSQL data storage (10Gi)
- Application logs storage (5Gi)

**StorageClass:**
- Dynamic provisioning configuration
- Backup and retention policies

### 03-postgres.yaml
PostgreSQL database deployment with high availability.

**Deployment Specification:**
- Image: `postgres:15-alpine`
- CPU: 500m request, 1000m limit
- Memory: 512Mi request, 1Gi limit
- Persistent storage: 10Gi
- Environment variables from secrets

**Service Configuration:**
- ClusterIP service on port 5432
- Internal DNS: `postgres.islamic-app.svc.cluster.local`

**Health Checks:**
- Readiness probe: `pg_isready`
- Liveness probe: Database connection test

### 04-backend.yaml
Flask backend API deployment with auto-scaling capability.

**Deployment Specification:**
- Image: `khaledhawil/islamic-app_backend:latest`
- Replicas: 2 (minimum for HA)
- CPU: 250m request, 500m limit
- Memory: 256Mi request, 512Mi limit

**Service Configuration:**
- ClusterIP service on port 5000
- Internal API endpoint
- Load balancing across pods

**Environment Variables:**
- Database connection from ConfigMap
- JWT secrets from Secret
- Flask environment configuration

### 05-frontend.yaml
React frontend deployment with content delivery optimization.

**Deployment Specification:**
- Image: `khaledhawil/islamic-app_frontend:latest`
- Replicas: 3 (for load distribution)
- CPU: 100m request, 250m limit
- Memory: 128Mi request, 256Mi limit

**Service Configuration:**
- ClusterIP service on port 3000
- Static content serving
- Connection to backend API

### 06-nginx.yaml
Nginx reverse proxy for routing and load balancing.

**Deployment Specification:**
- Image: `nginx:alpine`
- Custom configuration via ConfigMap
- SSL termination support
- Request routing logic

**Service Configuration:**
- LoadBalancer service on port 80/443
- External traffic entry point
- Health check endpoint

### 07-ingress.yaml
Ingress controller for external access and SSL termination.

**Ingress Features:**
- Domain-based routing
- SSL/TLS termination
- Path-based routing (/api, /static)
- Rate limiting configuration

**Annotations:**
- Nginx ingress class
- SSL redirect
- CORS configuration
- Security headers

### 08-hpa.yaml
Horizontal Pod Autoscaler for dynamic scaling.

**Scaling Configuration:**
- Frontend: 2-10 replicas
- Backend: 2-8 replicas
- CPU threshold: 70%
- Memory threshold: 80%

**Metrics:**
- CPU utilization
- Memory utilization
- Custom application metrics

## Deployment Scripts

### setup.sh
Initial cluster setup and preparation.
```bash
#!/bin/bash
# Create namespace
kubectl apply -f 00-namespace.yaml

# Setup RBAC and service accounts
kubectl create serviceaccount islamic-app -n islamic-app

# Install ingress controller if needed
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Verify cluster readiness
kubectl cluster-info
```

### build-images.sh
Docker image building script.
```bash
#!/bin/bash
echo "Building Docker images..."

# Build frontend
cd ../frontend
docker build -t khaledhawil/islamic-app_frontend:latest .
docker push khaledhawil/islamic-app_frontend:latest

# Build backend
cd ../backend
docker build -t khaledhawil/islamic-app_backend:latest .
docker push khaledhawil/islamic-app_backend:latest

echo "Images built and pushed successfully"
```

### deploy.sh
Complete deployment pipeline.
```bash
#!/bin/bash
set -e

echo "Starting Islamic App deployment..."

# Build images
./build-images.sh

# Deploy to Kubernetes
./deploy-only.sh

echo "Deployment completed successfully"
```

### deploy-only.sh
Kubernetes-only deployment.
```bash
#!/bin/bash
set -e

echo "Deploying to Kubernetes..."

# Apply manifests in order
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets-configmap.yaml
kubectl apply -f 02-persistent-storage.yaml

# Wait for storage to be ready
kubectl wait --for=condition=Bound pvc/postgres-pvc -n islamic-app --timeout=60s

# Deploy database
kubectl apply -f 03-postgres.yaml
kubectl wait --for=condition=Ready pod -l app=postgres -n islamic-app --timeout=300s

# Deploy application services
kubectl apply -f 04-backend.yaml
kubectl apply -f 05-frontend.yaml
kubectl apply -f 06-nginx.yaml

# Wait for deployments
kubectl wait --for=condition=Available deployment/backend -n islamic-app --timeout=300s
kubectl wait --for=condition=Available deployment/frontend -n islamic-app --timeout=300s
kubectl wait --for=condition=Available deployment/nginx -n islamic-app --timeout=300s

# Apply networking
kubectl apply -f 07-ingress.yaml
kubectl apply -f 08-hpa.yaml

# Show deployment status
kubectl get all -n islamic-app
```

### cleanup.sh
Complete environment cleanup.
```bash
#!/bin/bash
echo "Cleaning up Islamic App deployment..."

# Delete all resources
kubectl delete -f 08-hpa.yaml --ignore-not-found=true
kubectl delete -f 07-ingress.yaml --ignore-not-found=true
kubectl delete -f 06-nginx.yaml --ignore-not-found=true
kubectl delete -f 05-frontend.yaml --ignore-not-found=true
kubectl delete -f 04-backend.yaml --ignore-not-found=true
kubectl delete -f 03-postgres.yaml --ignore-not-found=true
kubectl delete -f 02-persistent-storage.yaml --ignore-not-found=true
kubectl delete -f 01-secrets-configmap.yaml --ignore-not-found=true

# Delete namespace (this will delete everything)
kubectl delete namespace islamic-app --ignore-not-found=true

echo "Cleanup completed"
```

## Resource Requirements

### Minimum Cluster Specifications
- **Nodes**: 3 worker nodes
- **CPU**: 4 vCPUs total
- **Memory**: 8GB total
- **Storage**: 50GB available

### Production Specifications
- **Nodes**: 5+ worker nodes
- **CPU**: 8+ vCPUs total
- **Memory**: 16GB+ total
- **Storage**: 200GB+ available

## Monitoring and Observability

### Health Checks
- Readiness probes for all services
- Liveness probes for critical components
- Startup probes for slow-starting services

### Metrics Collection
- Resource utilization metrics
- Application performance metrics
- Custom business metrics

### Logging
- Centralized log aggregation
- Structured logging format
- Log retention policies

## Security Configuration

### Network Policies
- Ingress traffic restrictions
- Inter-service communication rules
- Database access controls

### RBAC
- Service account permissions
- Role-based access control
- Principle of least privilege

### Secrets Management
- Kubernetes secrets for sensitive data
- Encryption at rest
- Secret rotation policies

## Backup and Disaster Recovery

### Database Backups
- Automated PostgreSQL backups
- Point-in-time recovery
- Cross-region replication

### Application Backups
- Configuration backups
- Persistent volume snapshots
- Application state preservation

## Usage Commands

### Deployment
```bash
# Full deployment
./deploy.sh

# Kubernetes only
./deploy-only.sh

# Build images only
./build-images.sh
```

### Monitoring
```bash
# Check deployment status
kubectl get all -n islamic-app

# View pod logs
kubectl logs -f deployment/backend -n islamic-app
kubectl logs -f deployment/frontend -n islamic-app

# Check resource usage
kubectl top pods -n islamic-app
kubectl top nodes
```

### Scaling
```bash
# Manual scaling
kubectl scale deployment frontend --replicas=5 -n islamic-app
kubectl scale deployment backend --replicas=3 -n islamic-app

# Check HPA status
kubectl get hpa -n islamic-app
kubectl describe hpa frontend-hpa -n islamic-app
```

### Troubleshooting
```bash
# Check pod status
kubectl describe pod <pod-name> -n islamic-app

# Check service endpoints
kubectl get endpoints -n islamic-app

# Check ingress status
kubectl describe ingress islamic-app-ingress -n islamic-app

# Check persistent volumes
kubectl get pv,pvc -n islamic-app
```

## Troubleshooting Guide

### Common Issues

1. **Pods not starting**
   - Check image availability
   - Verify resource limits
   - Check secrets and configmaps

2. **Database connection failures**
   - Verify service DNS resolution
   - Check network policies
   - Validate credentials

3. **Ingress not working**
   - Check ingress controller status
   - Verify DNS configuration
   - Check SSL certificates

4. **Auto-scaling not working**
   - Verify metrics server installation
   - Check HPA configuration
   - Monitor resource utilization

### Debug Commands
```bash
# Pod debugging
kubectl exec -it <pod-name> -n islamic-app -- /bin/sh

# Network debugging
kubectl run debug --image=nicolaka/netshoot -it --rm -n islamic-app

# DNS debugging
kubectl run dns-debug --image=busybox -it --rm -n islamic-app -- nslookup postgres
```
