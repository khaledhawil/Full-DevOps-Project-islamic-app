# Kubernetes to Helm Migration Guide

This document explains how your Kubernetes YAML files have been converted to a Helm chart and how to use it.

## What is Helm?

Helm is a package manager for Kubernetes that helps you manage complex deployments by:
- **Templating**: Using variables and conditionals in your manifests
- **Packaging**: Bundling related resources together
- **Versioning**: Managing different versions of your application
- **Dependencies**: Managing external dependencies like databases
- **Configuration**: Easy configuration management across environments

## Migration Overview

Your original Kubernetes files have been converted as follows:

| Original K8s File | Helm Template | Description |
|-------------------|---------------|-------------|
| `00-namespace.yaml` | `templates/namespace.yaml` | Namespace creation (optional) |
| `01-secrets-configmap.yaml` | `templates/secrets-configmap.yaml` | Secrets and ConfigMaps with templated values |
| `02-persistent-storage.yaml` | `templates/persistent-storage.yaml` | PV and PVC with configurable sizes |
| `03-postgres.yaml` | `templates/postgresql.yaml` | PostgreSQL deployment with configurable settings |
| `04-backend.yaml` | `templates/backend.yaml` | Backend deployment with templated images and configs |
| `05-frontend.yaml` | `templates/frontend.yaml` | Frontend deployment with templated images and configs |
| `07-ingress.yaml` | `templates/ingress.yaml` | Ingress with configurable hosts and paths |
| `08-hpa.yaml` | `templates/hpa.yaml` | HPA with configurable scaling parameters |

## Key Improvements

### 1. **Configurable Values**
Instead of hardcoded values, everything is now configurable via `values.yaml`:

```yaml
# Before (hardcoded in YAML)
image: khaledhawil/islamic-app_backend:36-18b4564

# After (configurable via values.yaml)
image: "{{ .Values.image.backend.repository }}:{{ .Values.image.backend.tag }}"
```

### 2. **Environment-Specific Configurations**
You can now have different configurations for different environments:

```bash
# Development deployment
helm install islamic-app ./helm/islamic-app -f values-dev.yaml

# Production deployment
helm install islamic-app ./helm/islamic-app -f values-prod.yaml
```

### 3. **Templated Resource Names**
All resources now use consistent naming patterns:

```yaml
# Before
name: islamic-app-backend

# After
name: {{ include "islamic-app.fullname" . }}-backend
```

## Directory Structure

```
helm/islamic-app/
├── Chart.yaml                 # Chart metadata
├── values.yaml               # Default configuration values
├── values-dev.yaml           # Development environment values
├── values-prod.yaml          # Production environment values
├── README.md                 # Chart documentation
├── charts/                   # Chart dependencies (empty for now)
└── templates/
    ├── _helpers.tpl          # Template helpers
    ├── NOTES.txt            # Post-installation notes
    ├── namespace.yaml       # Namespace template
    ├── secrets-configmap.yaml # Secrets and ConfigMaps
    ├── persistent-storage.yaml # Storage templates
    ├── postgresql.yaml      # Database templates
    ├── backend.yaml         # Backend service templates
    ├── frontend.yaml        # Frontend service templates
    ├── ingress.yaml         # Ingress templates
    └── hpa.yaml            # Autoscaling templates
```

## Deployment Options

### Option 1: Using the Deployment Script (Recommended)

```bash
# Deploy with default values
./helm-deploy.sh

# Deploy with custom values
./helm-deploy.sh -v values-dev.yaml

# Dry run to see what would be deployed
./helm-deploy.sh --dry-run

# Check deployment status
./helm-deploy.sh --status

# Uninstall
./helm-deploy.sh --uninstall
```

### Option 2: Direct Helm Commands

```bash
# Install/upgrade
helm upgrade --install islamic-app ./helm/islamic-app \
  --namespace islamic-app \
  --create-namespace

# With custom values
helm upgrade --install islamic-app ./helm/islamic-app \
  --namespace islamic-app \
  --create-namespace \
  -f values-dev.yaml

# Uninstall
helm uninstall islamic-app -n islamic-app
```

## Configuration Examples

### Changing Image Tags

```yaml
# values-custom.yaml
image:
  backend:
    tag: "v2.0.0"
  frontend:
    tag: "v2.0.0"
```

### Scaling the Application

```yaml
# values-custom.yaml
replicaCount:
  backend: 3
  frontend: 5

autoscaling:
  enabled: true
  maxReplicas: 10
```

### Custom Domain Configuration

```yaml
# values-custom.yaml
ingress:
  hosts:
    - host: my-islamic-app.com
      paths:
        - path: /
          pathType: Prefix
          service: frontend
        - path: /api
          pathType: Prefix
          service: backend
  tls:
    - secretName: my-app-tls
      hosts:
        - my-islamic-app.com
```

### Production Security Configuration

```yaml
# values-prod.yaml
app:
  secrets:
    secretKey: "your-super-secure-production-key"
    jwtSecretKey: "your-jwt-production-key"

postgresql:
  auth:
    postgresPassword: "secure-database-password"
```

## Advanced Features

### 1. **Conditional Deployments**
You can enable/disable components:

```yaml
postgresql:
  enabled: false  # Use external database

autoscaling:
  enabled: false  # Disable autoscaling
```

### 2. **Resource Management**
Fine-tune resource allocation:

```yaml
resources:
  backend:
    limits:
      cpu: 1000m
      memory: 1Gi
    requests:
      cpu: 500m
      memory: 512Mi
```

### 3. **Environment Variables**
Easily manage environment-specific configs:

```yaml
app:
  config:
    flaskEnv: production
    corsOrigins: "https://myapp.com"
```

## Best Practices

### 1. **Version Control**
- Keep your `values.yaml` files in version control
- Use different values files for different environments
- Tag your Helm chart versions

### 2. **Security**
- Never store secrets in values files (use external secret management)
- Use specific image tags in production (avoid `latest`)
- Enable TLS for production deployments

### 3. **Testing**
```bash
# Validate your chart
helm lint ./helm/islamic-app

# Test with dry-run
helm install islamic-app ./helm/islamic-app --dry-run

# Template and inspect output
helm template islamic-app ./helm/islamic-app
```

### 4. **Monitoring**
```bash
# Check deployment status
kubectl get pods -n islamic-app

# View logs
kubectl logs -f deployment/islamic-app-backend -n islamic-app

# Check resource usage
kubectl top pods -n islamic-app
```

## Migration Checklist

- [x] ✅ Created Helm chart structure
- [x] ✅ Converted all Kubernetes manifests to templates
- [x] ✅ Added configurable values for all components
- [x] ✅ Created environment-specific values files
- [x] ✅ Added deployment automation script
- [x] ✅ Included comprehensive documentation
- [x] ✅ Added security best practices
- [x] ✅ Implemented proper templating and helpers

## Next Steps

1. **Test the Helm chart** in your development environment
2. **Customize values** for your specific needs
3. **Set up CI/CD** to use Helm for deployments
4. **Implement external secret management** for production
5. **Add monitoring and logging** configurations
6. **Consider using Helm hooks** for database migrations

## Troubleshooting

### Common Issues

1. **Chart validation errors**:
   ```bash
   helm lint ./helm/islamic-app
   ```

2. **Template rendering issues**:
   ```bash
   helm template islamic-app ./helm/islamic-app --debug
   ```

3. **Deployment failures**:
   ```bash
   kubectl describe pods -n islamic-app
   kubectl logs -n islamic-app deployment/islamic-app-backend
   ```

### Getting Help

- Check the Helm documentation: https://helm.sh/docs/
- Review Kubernetes documentation for specific resource issues
- Use `kubectl describe` and `kubectl logs` for debugging

## Conclusion

Your Kubernetes application has been successfully converted to a Helm chart, providing you with:

- **Better maintainability** through templating
- **Environment flexibility** through configurable values
- **Easier deployments** with the deployment script
- **Production readiness** with security best practices
- **Scalability options** through HPA and resource management

The Helm chart approach will make it much easier to manage your Islamic App across different environments and scale it as needed.
