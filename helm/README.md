# Helm Charts for Islamic App

This directory contains Helm charts and deployment guides for the Islamic App project.

## Contents

- `islamic-app/` - Main Helm chart for the Islamic App
- `MULTI_ENVIRONMENT_DEPLOY_GUIDE.md` - Comprehensive guide for deploying to different environments (Kind, AWS EKS, GKE, AKS)

## Quick Deployment

### Local Development (Kind)
```bash
# Deploy to Kind cluster
./helm-deploy.sh -e kind

# Access via: http://islamic-app.local (add to /etc/hosts)
echo "127.0.0.1 islamic-app.local" | sudo tee -a /etc/hosts
```

### Cloud Environments
```bash
# AWS EKS
./helm-deploy.sh -e aws -d your-domain.com

# Google GKE  
./helm-deploy.sh -e gcp -d your-domain.com

# Azure AKS
./helm-deploy.sh -e azure -d your-domain.com
```

## Prerequisites

- Helm 3.x installed
- kubectl configured for your target cluster
- Docker images built and pushed to registry

## Chart Structure

The `islamic-app` chart includes:
- Frontend (React application)
- Backend (Flask API)
- PostgreSQL database
- Nginx reverse proxy
- Ingress configuration
- Persistent storage
- ConfigMaps and Secrets

## Environment-Specific Configurations

Different environments require specific configurations:

- **Kind**: Uses NodePort services and local ingress
- **AWS**: Integrates with ALB, Route53, and ACM
- **GCP**: Uses GCE ingress and managed certificates  
- **Azure**: Requires NGINX ingress and cert-manager

For detailed environment setup instructions, see [MULTI_ENVIRONMENT_DEPLOY_GUIDE.md](MULTI_ENVIRONMENT_DEPLOY_GUIDE.md).

## Troubleshooting

Common issues and solutions:

1. **Chart installation fails**: Check if all required CRDs are installed
2. **Ingress not working**: Verify ingress controller is running
3. **Database connection issues**: Check ConfigMap and Secret configurations
4. **Images not pulling**: Ensure image registry credentials are correct

## Customization

Override default values by creating a custom `values.yaml`:

```bash
helm install islamic-app ./islamic-app -f custom-values.yaml
```

## Monitoring

The chart includes optional monitoring components:
- Prometheus metrics endpoints
- Health check endpoints
- Liveness and readiness probes
