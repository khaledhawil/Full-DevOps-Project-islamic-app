# Helm Documentation Index

This directory contains comprehensive documentation for deploying the Islamic App using Helm charts.

## Documentation Files

### Primary Documentation
| File | Description | Use Case |
|------|-------------|----------|
| [`COMPREHENSIVE_HELM_DOCUMENTATION.md`](./COMPREHENSIVE_HELM_DOCUMENTATION.md) | Complete Helm deployment guide with detailed configurations, troubleshooting, and best practices | Full reference for all deployment scenarios |
| [`MULTI_ENVIRONMENT_DEPLOY_GUIDE.md`](./MULTI_ENVIRONMENT_DEPLOY_GUIDE.md) | Step-by-step guide for deploying to different environments (Kind, AWS, GCP, Azure) | Quick deployment instructions |
| [`islamic-app/README.md`](./islamic-app/README.md) | Helm chart-specific documentation with quick start and configuration reference | Chart usage and customization |
| [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md) | Quick reference card with common commands and configuration patterns | Quick command lookup |
| [`TROUBLESHOOTING_CHECKLIST.md`](./TROUBLESHOOTING_CHECKLIST.md) | Systematic troubleshooting checklist for common deployment issues | Problem diagnosis and resolution |

### Quick Start Guide

1. **For Local Development (Kind)**:
   ```bash
   ./helm-deploy.sh -e kind
   ```

2. **For Cloud Deployment**:
   ```bash
   # AWS EKS
   ./helm-deploy.sh -e aws -d your-domain.com
   
   # Google GKE
   ./helm-deploy.sh -e gcp -d your-domain.com
   
   # Azure AKS
   ./helm-deploy.sh -e azure -d your-domain.com
   ```

3. **For Custom Configuration**:
   ```bash
   ./helm-deploy.sh -v custom-values.yaml
   ```

## Chart Structure

```
islamic-app/
├── Chart.yaml                 # Chart metadata
├── README.md                  # Chart documentation
├── values.yaml               # Default configuration
├── values-*.yaml             # Environment-specific configs
└── templates/                # Kubernetes resource templates
    ├── _helpers.tpl          # Template helpers
    ├── configmap.yaml        # Configuration
    ├── deployment-*.yaml     # Application deployments
    ├── ingress.yaml          # Ingress configuration
    ├── secrets.yaml          # Secret management
    ├── service-*.yaml        # Service definitions
    ├── hpa.yaml              # Horizontal Pod Autoscaler
    └── postgres-*.yaml       # Database resources
```

## Environment-Specific Values Files

| File | Target Environment | Key Features |
|------|-------------------|--------------|
| `values-kind.yaml` | Local Kind cluster | Port forwarding, local storage, development settings |
| `values-aws.yaml` | AWS EKS | ALB ingress, EBS storage, production-ready |
| `values-gcp.yaml` | Google GKE | GCE ingress, GCP storage, managed certificates |
| `values-azure.yaml` | Azure AKS | Azure ingress, Azure storage, AKS optimizations |
| `values-generic.yaml` | Generic cloud | Standard ingress, generic storage classes |
| `values-dev.yaml` | Development | Lower resources, debug settings |
| `values-prod.yaml` | Production | High availability, security hardening |

## Key Features

### Application Components
- **Frontend**: React-based web application
- **Backend**: Flask API server with Islamic services
- **Database**: PostgreSQL with persistent storage
- **Ingress**: NGINX-based routing with SSL/TLS support

### Deployment Features
- Multi-environment support (local, cloud)
- Horizontal Pod Autoscaling (HPA)
- Persistent storage for database
- Health checks and monitoring
- Configurable resource limits
- SSL/TLS termination
- Environment-specific optimizations

### Security Features
- Non-root container execution
- Resource quotas and limits
- Network policies (optional)
- Secret management
- RBAC configuration
- Security contexts

## Common Use Cases

### 1. Local Development
```bash
# Start local Kind cluster
kind create cluster --name islamic-app

# Deploy application
./helm-deploy.sh -e kind

# Access application
echo "127.0.0.1 islamic-app.local" | sudo tee -a /etc/hosts
open http://islamic-app.local
```

### 2. Production Deployment
```bash
# Deploy to production with custom domain
./helm-deploy.sh -e aws -d islamic-app.example.com

# Monitor deployment
kubectl get pods -n islamic-app
kubectl get ingress -n islamic-app
```

### 3. Custom Configuration
```bash
# Create custom values file
cp values.yaml custom-values.yaml
# Edit custom-values.yaml with your settings

# Deploy with custom configuration
helm install islamic-app ./islamic-app -f custom-values.yaml
```

### 4. Scaling and Updates
```bash
# Scale backend replicas
kubectl scale deployment islamic-app-backend --replicas=5 -n islamic-app

# Update to new image version
helm upgrade islamic-app ./islamic-app --set image.backend.tag=new-version
```

## Troubleshooting Quick Reference

### Common Issues
1. **Pods not starting**: Check resource limits and image availability
2. **Database connection errors**: Verify PostgreSQL service and credentials
3. **Ingress not working**: Ensure ingress controller is installed
4. **SSL certificate issues**: Check cert-manager and certificate configuration

### Debug Commands
```bash
# Check all resources
kubectl get all -n islamic-app

# View pod logs
kubectl logs -f deployment/islamic-app-backend -n islamic-app

# Describe problematic resources
kubectl describe pod <pod-name> -n islamic-app

# Test internal connectivity
kubectl exec -it deployment/islamic-app-backend -n islamic-app -- curl localhost:5000/health
```

## Getting Help

1. **Start with**: [`COMPREHENSIVE_HELM_DOCUMENTATION.md`](./COMPREHENSIVE_HELM_DOCUMENTATION.md) for complete reference
2. **Quick deployment**: [`MULTI_ENVIRONMENT_DEPLOY_GUIDE.md`](./MULTI_ENVIRONMENT_DEPLOY_GUIDE.md) for step-by-step instructions
3. **Chart customization**: [`islamic-app/README.md`](./islamic-app/README.md) for chart-specific details
4. **Common commands**: [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md) for quick command lookup
5. **Troubleshooting**: [`TROUBLESHOOTING_CHECKLIST.md`](./TROUBLESHOOTING_CHECKLIST.md) for systematic problem diagnosis
6. **Advanced troubleshooting**: Check troubleshooting sections in the comprehensive documentation

## Contributing

When modifying the Helm chart:
1. Update relevant documentation
2. Test with `helm lint` and `helm template`
3. Validate on multiple environments
4. Update version numbers in `Chart.yaml`

## Support

For additional support:
- Review the troubleshooting sections
- Check Kubernetes and Helm official documentation
- Validate cluster prerequisites and requirements
- Ensure proper RBAC permissions and storage provisioners
