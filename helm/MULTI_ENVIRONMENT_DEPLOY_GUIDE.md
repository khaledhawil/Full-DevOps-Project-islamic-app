# Multi-Environment Kubernetes Deployment Guide

This guide explains how to deploy the Islamic App on different Kubernetes environments using Helm.

## Quick Start

### For Kind (Local Development)
```bash
# Deploy to Kind cluster
./helm-deploy.sh -e kind

# Access via: http://islamic-app.local (add to /etc/hosts)
echo "127.0.0.1 islamic-app.local" | sudo tee -a /etc/hosts
```

### For AWS EKS
```bash
# Deploy to AWS EKS
./helm-deploy.sh -e aws -d your-app.com

# Make sure you have:
# - AWS Load Balancer Controller installed
# - Route53 domain configured
# - ACM certificate created
```

### For Google GKE
```bash
# Deploy to Google GKE
./helm-deploy.sh -e gcp -d your-app.com

# Make sure you have:
# - GCE ingress controller
# - Reserved static IP
# - Managed SSL certificate
```

### For Azure AKS
```bash
# Deploy to Azure AKS
./helm-deploy.sh -e azure -d your-app.com

# Make sure you have:
# - NGINX ingress controller installed
# - Azure DNS zone configured
# - Cert-manager for TLS
```

### For Generic Cloud/On-Premise
```bash
# Deploy to any Kubernetes cluster
./helm-deploy.sh -e generic -d your-app.com
```

## Environment Configurations

### 1. Kind Cluster (Local Development)

**Prerequisites:**
```bash
# Install Kind
go install sigs.k8s.io/kind@v0.20.0

# Create cluster
kind create cluster --name islamic-app

# Install nginx ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for ingress to be ready
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=90s
```

**Deploy:**
```bash
./helm-deploy.sh -e kind
echo "127.0.0.1 islamic-app.local" | sudo tee -a /etc/hosts
```

**Access:** http://islamic-app.local

### 2. AWS EKS

**Prerequisites:**
```bash
# Install AWS Load Balancer Controller
helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=your-cluster-name \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

# Create ACM certificate for your domain
aws acm request-certificate \
  --domain-name islamic-app.example.com \
  --validation-method DNS
```

**Deploy:**
```bash
# Update values-aws.yaml with your certificate ARN and domain
./helm-deploy.sh -e aws -d islamic-app.example.com
```

### 3. Google GKE

**Prerequisites:**
```bash
# Reserve static IP
gcloud compute addresses create islamic-app-ip --global

# Create managed SSL certificate
kubectl apply -f - <<EOF
apiVersion: networking.gke.io/v1
kind: ManagedCertificate
metadata:
  name: islamic-app-ssl-cert
spec:
  domains:
    - islamic-app.example.com
EOF
```

**Deploy:**
```bash
./helm-deploy.sh -e gcp -d islamic-app.example.com
```

### 4. Azure AKS

**Prerequisites:**
```bash
# Install NGINX ingress controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --create-namespace \
  --namespace ingress-nginx

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

**Deploy:**
```bash
./helm-deploy.sh -e azure -d islamic-app.example.com
```

## Customization

### Custom Values File
```bash
# Create custom values
cat > my-values.yaml <<EOF
replicaCount:
  backend: 3
  frontend: 5

app:
  config:
    corsOrigins: "https://my-domain.com"

resources:
  backend:
    limits:
      memory: "2Gi"
EOF

# Deploy with custom values
./helm-deploy.sh -v my-values.yaml
```

### Environment Variables Override
```bash
# Override specific values
./helm-deploy.sh -e aws \
  --set replicaCount.backend=5 \
  --set app.config.flaskEnv=staging
```

## Production Checklist

### Security
- [ ] Change default passwords in values file
- [ ] Use external secret management (AWS Secrets Manager, Azure Key Vault, etc.)
- [ ] Enable TLS/SSL certificates
- [ ] Configure proper RBAC
- [ ] Set up network policies

### Monitoring
- [ ] Install monitoring stack (Prometheus, Grafana)
- [ ] Set up logging (ELK/EFK stack)
- [ ] Configure alerting
- [ ] Set up health checks

### Backup
- [ ] Configure database backups
- [ ] Set up persistent volume snapshots
- [ ] Document disaster recovery procedures

### Performance
- [ ] Configure HPA (Horizontal Pod Autoscaler)
- [ ] Set up VPA (Vertical Pod Autoscaler) if needed
- [ ] Optimize resource requests and limits
- [ ] Configure node affinity/anti-affinity

## Troubleshooting

### Common Issues

1. **Ingress not working**
   ```bash
   # Check ingress controller
   kubectl get pods -n ingress-nginx
   
   # Check ingress resource
   kubectl describe ingress -n islamic-app
   ```

2. **Pods not starting**
   ```bash
   # Check pod status
   kubectl get pods -n islamic-app
   
   # Check pod logs
   kubectl logs -f deployment/islamic-app-backend -n islamic-app
   ```

3. **Database connection issues**
   ```bash
   # Check PostgreSQL pod
   kubectl logs -f deployment/islamic-app-postgresql -n islamic-app
   
   # Test connection
   kubectl exec -n islamic-app deployment/islamic-app-backend -- nc -zv islamic-app-postgresql 5432
   ```

### Getting Help
```bash
# Check deployment status
./helm-deploy.sh --status

# View all resources
kubectl get all -n islamic-app

# Check events
kubectl get events -n islamic-app --sort-by='.lastTimestamp'
```

## Cleanup

```bash
# Uninstall application
./helm-deploy.sh --uninstall

# Delete namespace (if needed)
kubectl delete namespace islamic-app
```

## Examples

### Development on Kind
```bash
./helm-deploy.sh -e kind
```

### Staging on AWS
```bash
./helm-deploy.sh -e aws -d staging.islamic-app.com
```

### Production on GCP
```bash
./helm-deploy.sh -e gcp -d islamic-app.com -v prod-values.yaml
```

### Custom deployment
```bash
./helm-deploy.sh \
  -v custom-values.yaml \
  --set image.backend.tag=v2.0.0 \
  --set ingress.hosts[0].host=my-app.com
```
