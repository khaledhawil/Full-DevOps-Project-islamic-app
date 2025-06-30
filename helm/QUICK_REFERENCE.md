# Helm Quick Reference Card

## Installation Commands

### Environment-Specific Deployments
```bash
# Local Kind cluster
./helm-deploy.sh -e kind

# AWS EKS
./helm-deploy.sh -e aws -d your-domain.com

# Google GKE  
./helm-deploy.sh -e gcp -d your-domain.com

# Azure AKS
./helm-deploy.sh -e azure -d your-domain.com

# Generic cloud
./helm-deploy.sh -e generic -d your-domain.com
```

### Manual Helm Commands
```bash
# Install with default values
helm install islamic-app ./helm/islamic-app --namespace islamic-app --create-namespace

# Install with environment-specific values
helm install islamic-app ./helm/islamic-app -f ./helm/islamic-app/values-kind.yaml --namespace islamic-app --create-namespace

# Install with custom values
helm install islamic-app ./helm/islamic-app -f custom-values.yaml --namespace islamic-app --create-namespace

# Dry run installation
helm install islamic-app ./helm/islamic-app --dry-run --debug --namespace islamic-app
```

## Management Commands

### Upgrade
```bash
# Upgrade to new version
helm upgrade islamic-app ./helm/islamic-app --namespace islamic-app

# Upgrade with new values
helm upgrade islamic-app ./helm/islamic-app -f new-values.yaml --namespace islamic-app

# Force upgrade
helm upgrade islamic-app ./helm/islamic-app --force --namespace islamic-app
```

### Status and Information
```bash
# Check release status
helm status islamic-app --namespace islamic-app

# List all releases
helm list --namespace islamic-app

# Get release values
helm get values islamic-app --namespace islamic-app

# Get release manifest
helm get manifest islamic-app --namespace islamic-app
```

### Uninstall
```bash
# Using deployment script
./helm-deploy.sh --uninstall

# Manual uninstall
helm uninstall islamic-app --namespace islamic-app

# Complete cleanup
helm uninstall islamic-app --namespace islamic-app
kubectl delete namespace islamic-app
```

## Kubernetes Commands

### Pod Management
```bash
# Get all pods
kubectl get pods -n islamic-app

# Watch pod status
kubectl get pods -n islamic-app -w

# Get pod logs
kubectl logs -f deployment/islamic-app-backend -n islamic-app
kubectl logs -f deployment/islamic-app-frontend -n islamic-app
kubectl logs -f deployment/postgres -n islamic-app

# Describe pod
kubectl describe pod <pod-name> -n islamic-app

# Execute commands in pod
kubectl exec -it deployment/islamic-app-backend -n islamic-app -- bash
```

### Service and Ingress
```bash
# Get services
kubectl get svc -n islamic-app

# Get ingress
kubectl get ingress -n islamic-app

# Describe ingress
kubectl describe ingress -n islamic-app

# Port forward for local access
kubectl port-forward svc/islamic-app-frontend 3000:3000 -n islamic-app
kubectl port-forward svc/islamic-app-backend 5000:5000 -n islamic-app
```

### Storage and Persistence
```bash
# Get persistent volumes
kubectl get pv

# Get persistent volume claims
kubectl get pvc -n islamic-app

# Check storage classes
kubectl get storageclass
```

### Scaling and HPA
```bash
# Manual scaling
kubectl scale deployment islamic-app-backend --replicas=3 -n islamic-app
kubectl scale deployment islamic-app-frontend --replicas=2 -n islamic-app

# Check HPA status
kubectl get hpa -n islamic-app

# Describe HPA
kubectl describe hpa -n islamic-app
```

## Troubleshooting Commands

### Pod Issues
```bash
# Check pod events
kubectl get events -n islamic-app --sort-by='.lastTimestamp'

# Check pod resource usage
kubectl top pods -n islamic-app

# Check pod description for issues
kubectl describe pod -l app.kubernetes.io/component=backend -n islamic-app
```

### Database Connectivity
```bash
# Test database connection from backend
kubectl exec -n islamic-app deployment/islamic-app-backend -- \
  python -c "
import psycopg2
import os
try:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    print('Database connection successful')
    conn.close()
except Exception as e:
    print(f'Database connection failed: {e}')
"

# Test PostgreSQL service connectivity
kubectl exec -n islamic-app deployment/islamic-app-backend -- nc -zv postgres 5432
```

### Ingress Debugging
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress controller logs
kubectl logs -f deployment/ingress-nginx-controller -n ingress-nginx

# Test ingress with curl
curl -H "Host: islamic-app.local" http://<cluster-ip>
```

### Certificate Issues
```bash
# Check certificates (if using cert-manager)
kubectl get certificates -n islamic-app

# Describe certificate
kubectl describe certificate islamic-app-tls -n islamic-app

# Check cert-manager logs
kubectl logs -f deployment/cert-manager -n cert-manager
```

## Configuration Override Examples

### Resource Limits
```yaml
# Custom values for higher resources
resources:
  backend:
    limits:
      cpu: 1000m
      memory: 1Gi
    requests:
      cpu: 500m
      memory: 512Mi
  frontend:
    limits:
      cpu: 500m
      memory: 512Mi
```

### Replica Counts
```yaml
# Scale for production
replicaCount:
  backend: 3
  frontend: 2

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

### Custom Domain
```yaml
# Production domain configuration
ingress:
  hosts:
    - host: islamic-app.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: islamic-app-tls
      hosts:
        - islamic-app.example.com
```

### Environment Variables
```yaml
# Application configuration
app:
  config:
    flaskEnv: production
    nodeEnv: production
  env:
    CUSTOM_VAR: "custom-value"
    DEBUG: "false"
```

## Quick Validation Commands

```bash
# Validate chart syntax
helm lint ./helm/islamic-app

# Generate templates without installing
helm template islamic-app ./helm/islamic-app

# Check if all pods are ready
kubectl wait --for=condition=ready pod --all -n islamic-app --timeout=300s

# Test application health
curl -f http://islamic-app.local/api/health || echo "Health check failed"

# Check if ingress is working
curl -I -H "Host: islamic-app.local" http://<cluster-ip>
```

## Common Value Override Patterns

### Command Line Overrides
```bash
# Set replica count
helm install islamic-app ./helm/islamic-app --set replicaCount.backend=3

# Set image tag
helm install islamic-app ./helm/islamic-app --set image.backend.tag=latest

# Set domain
helm install islamic-app ./helm/islamic-app --set ingress.hosts[0].host=my-domain.com

# Multiple overrides
helm install islamic-app ./helm/islamic-app \
  --set replicaCount.backend=3 \
  --set image.backend.tag=v1.2.0 \
  --set ingress.hosts[0].host=my-domain.com
```

### Environment-Specific Patterns
```bash
# Development with debug
helm install islamic-app ./helm/islamic-app \
  -f values-dev.yaml \
  --set app.config.flaskEnv=development

# Production with scaling
helm install islamic-app ./helm/islamic-app \
  -f values-prod.yaml \
  --set autoscaling.maxReplicas=20

# Staging with custom image
helm install islamic-app ./helm/islamic-app \
  -f values-generic.yaml \
  --set image.backend.tag=staging-latest
```

This quick reference provides the most commonly used commands for deploying and managing the Islamic App with Helm.
