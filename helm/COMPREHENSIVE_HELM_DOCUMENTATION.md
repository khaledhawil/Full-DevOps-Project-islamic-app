# Islamic App Helm Chart - Comprehensive Documentation

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Environment Deployments](#environment-deployments)
6. [Production Setup](#production-setup)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)
9. [Security](#security)
10. [Monitoring](#monitoring)
11. [Backup and Recovery](#backup-and-recovery)
12. [Development](#development)
13. [API Reference](#api-reference)

## Overview

The Islamic App Helm chart deploys a comprehensive Islamic application with the following components:

### Application Components
- **Frontend**: React-based web application serving Islamic content
- **Backend**: Flask API server providing Islamic services (prayer times, Quran, Hadith, Tasbeh)
- **Database**: PostgreSQL database storing user data and preferences
- **Ingress**: NGINX ingress controller for external access

### Features
- Prayer times calculation based on location
- Complete Quran with audio recitation
- Hadith collections from authentic sources
- Digital Tasbeh (dhikr counter)
- Azkar (morning and evening supplications)
- User authentication and personalized preferences
- Multi-language support
- Responsive design for all devices

### Architecture
```
Internet -> Ingress -> Frontend Service -> Frontend Pod
                   -> Backend Service  -> Backend Pod -> PostgreSQL Service -> PostgreSQL Pod
```

## Prerequisites

### General Requirements
- Kubernetes cluster version 1.19+
- Helm version 3.2.0+
- Persistent Volume provisioner
- Ingress controller (NGINX recommended)

### Local Development (Kind)
```bash
# Install Kind
go install sigs.k8s.io/kind@v0.20.0

# Create Kind cluster
kind create cluster --name islamic-app

# Install NGINX ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for ingress controller
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=90s

# Label nodes for ingress
kubectl label nodes --all ingress-ready=true
```

### Cloud Providers

#### AWS EKS
```bash
# Install AWS Load Balancer Controller
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=your-cluster-name

# Create ACM certificate
aws acm request-certificate \
  --domain-name islamic-app.example.com \
  --validation-method DNS
```

#### Google GKE
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

#### Azure AKS
```bash
# Install NGINX ingress controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --create-namespace \
  --namespace ingress-nginx

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

## Installation

### Quick Start

#### Default Installation
```bash
# Clone repository
git clone <repository-url>
cd Full-DevOps-Project-islamic-app

# Make deployment script executable
chmod +x helm-deploy.sh

# Deploy with default values
./helm-deploy.sh
```

#### Environment-Specific Installation
```bash
# Kind cluster (local development)
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

### Manual Helm Installation

#### Basic Installation
```bash
# Install with default values
helm install islamic-app ./helm/islamic-app \
  --namespace islamic-app \
  --create-namespace

# Install with custom values
helm install islamic-app ./helm/islamic-app \
  --namespace islamic-app \
  --create-namespace \
  --values custom-values.yaml

# Install with inline overrides
helm install islamic-app ./helm/islamic-app \
  --namespace islamic-app \
  --create-namespace \
  --set replicaCount.backend=3 \
  --set image.backend.tag=latest
```

#### Upgrade Installation
```bash
# Upgrade existing installation
helm upgrade islamic-app ./helm/islamic-app \
  --namespace islamic-app

# Upgrade with new values
helm upgrade islamic-app ./helm/islamic-app \
  --namespace islamic-app \
  --values new-values.yaml

# Force upgrade
helm upgrade islamic-app ./helm/islamic-app \
  --namespace islamic-app \
  --force
```

### Uninstallation
```bash
# Using deployment script
./helm-deploy.sh --uninstall

# Manual uninstall
helm uninstall islamic-app --namespace islamic-app
kubectl delete namespace islamic-app
```

## Configuration

### Default Values Structure

The chart provides extensive configuration options through values.yaml:

#### Image Configuration
```yaml
image:
  backend:
    repository: khaledhawil/islamic-app_backend
    tag: "36-18b4564"
    pullPolicy: IfNotPresent
  frontend:
    repository: khaledhawil/islamic-app_frontend
    tag: "36-18b4564"
    pullPolicy: IfNotPresent
  postgres:
    repository: postgres
    tag: "15-alpine"
    pullPolicy: IfNotPresent
```

#### Replica Configuration
```yaml
replicaCount:
  backend: 1
  frontend: 1
```

#### Service Configuration
```yaml
service:
  backend:
    type: ClusterIP
    port: 5000
  frontend:
    type: ClusterIP
    port: 3000
  postgres:
    type: ClusterIP
    port: 5432
```

#### Ingress Configuration
```yaml
ingress:
  enabled: true
  className: ""
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
  hosts:
    - host: islamic-app.local
      paths:
        - path: /
          pathType: Prefix
          service: frontend
        - path: /api
          pathType: Prefix
          service: backend
  tls: []
```

#### Resource Limits
```yaml
resources:
  backend:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi
  frontend:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi
```

#### Autoscaling Configuration
```yaml
autoscaling:
  enabled: true
  minReplicas: 1
  maxReplicas: 5
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80
```

#### PostgreSQL Configuration
```yaml
postgresql:
  enabled: true
  auth:
    postgresUser: islamic_user
    postgresPassword: islamic_pass123
    postgresDatabase: islamic_app
  persistence:
    enabled: true
    size: 5Gi
    storageClass: ""
```

#### Application Configuration
```yaml
app:
  config:
    flaskEnv: production
    corsOrigins: "http://localhost:3000,http://localhost:8090"
    reactAppApiUrl: "/api"
    nodeEnv: production
  secrets:
    secretKey: your-super-secret-key-change-in-production
    jwtSecretKey: your-jwt-secret-key-change-in-production
```

#### Persistence Configuration
```yaml
persistence:
  enabled: true
  storageClass: ""
  accessMode: ReadWriteOnce
  size: 5Gi
```

### Configuration Parameters Reference

| Parameter | Description | Default | Required |
|-----------|-------------|---------|----------|
| `nameOverride` | Override chart name | `""` | No |
| `fullnameOverride` | Override full resource names | `""` | No |
| `replicaCount.backend` | Backend replica count | `1` | No |
| `replicaCount.frontend` | Frontend replica count | `1` | No |
| `image.backend.repository` | Backend image repository | `khaledhawil/islamic-app_backend` | Yes |
| `image.backend.tag` | Backend image tag | `36-18b4564` | Yes |
| `image.backend.pullPolicy` | Backend image pull policy | `IfNotPresent` | No |
| `image.frontend.repository` | Frontend image repository | `khaledhawil/islamic-app_frontend` | Yes |
| `image.frontend.tag` | Frontend image tag | `36-18b4564` | Yes |
| `image.frontend.pullPolicy` | Frontend image pull policy | `IfNotPresent` | No |
| `service.backend.type` | Backend service type | `ClusterIP` | No |
| `service.backend.port` | Backend service port | `5000` | No |
| `service.frontend.type` | Frontend service type | `ClusterIP` | No |
| `service.frontend.port` | Frontend service port | `3000` | No |
| `ingress.enabled` | Enable ingress | `true` | No |
| `ingress.className` | Ingress class name | `""` | No |
| `ingress.hosts[0].host` | Primary hostname | `islamic-app.local` | Yes |
| `resources.backend.limits.cpu` | Backend CPU limit | `500m` | No |
| `resources.backend.limits.memory` | Backend memory limit | `512Mi` | No |
| `resources.backend.requests.cpu` | Backend CPU request | `250m` | No |
| `resources.backend.requests.memory` | Backend memory request | `256Mi` | No |
| `autoscaling.enabled` | Enable HPA | `true` | No |
| `autoscaling.minReplicas` | Minimum replicas | `1` | No |
| `autoscaling.maxReplicas` | Maximum replicas | `5` | No |
| `autoscaling.targetCPUUtilizationPercentage` | CPU target | `80` | No |
| `postgresql.enabled` | Deploy PostgreSQL | `true` | No |
| `postgresql.auth.postgresUser` | PostgreSQL username | `islamic_user` | Yes |
| `postgresql.auth.postgresPassword` | PostgreSQL password | `islamic_pass123` | Yes |
| `postgresql.auth.postgresDatabase` | PostgreSQL database | `islamic_app` | Yes |
| `persistence.enabled` | Enable persistence | `true` | No |
| `persistence.size` | Storage size | `5Gi` | No |
| `persistence.storageClass` | Storage class | `""` | No |
| `app.config.flaskEnv` | Flask environment | `production` | No |
| `app.config.corsOrigins` | CORS origins | See values.yaml | No |
| `app.config.reactAppApiUrl` | React API URL | `/api` | No |
| `app.secrets.secretKey` | Flask secret key | Change in production | Yes |
| `app.secrets.jwtSecretKey` | JWT secret key | Change in production | Yes |

## Environment Deployments

### Kind Cluster (Local Development)

#### Configuration (values-kind.yaml)
```yaml
environment:
  type: "kind"
  domain: "islamic-app.local"

service:
  frontend:
    type: NodePort
    nodePort: 30000

ingress:
  className: "nginx"

autoscaling:
  enabled: false

resources:
  backend:
    limits:
      cpu: 200m
      memory: 256Mi
  frontend:
    limits:
      cpu: 200m
      memory: 256Mi

app:
  config:
    flaskEnv: development
    nodeEnv: development
```

#### Deployment
```bash
# Deploy to Kind
./helm-deploy.sh -e kind

# Add to hosts file
echo "127.0.0.1 islamic-app.local" | sudo tee -a /etc/hosts

# Access application
open http://islamic-app.local
```

#### Port Forwarding (Alternative Access)
```bash
# Frontend
kubectl port-forward svc/islamic-app-frontend 3000:3000 -n islamic-app

# Backend
kubectl port-forward svc/postgres 5432:5432 -n islamic-app

# PostgreSQL
kubectl port-forward svc/postgres 5432:5432 -n islamic-app
```

### AWS EKS

#### Prerequisites Setup
```bash
# Install AWS Load Balancer Controller
eksctl utils associate-iam-oidc-provider --region=us-west-2 --cluster=my-cluster --approve

# Create service account
eksctl create iamserviceaccount \
  --cluster=my-cluster \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --attach-policy-arn=arn:aws:iam::111122223333:policy/AWSLoadBalancerControllerIAMPolicy \
  --override-existing-serviceaccounts \
  --approve

# Install controller
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=my-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

#### Configuration (values-aws.yaml)
```yaml
environment:
  type: "aws"
  domain: "islamic-app.example.com"

ingress:
  className: "alb"
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: "arn:aws:acm:region:account:certificate/cert-id"

persistence:
  storageClass: "gp3"
  size: 20Gi

nodeSelector:
  node-type: application
```

#### Deployment
```bash
# Update certificate ARN in values-aws.yaml
# Deploy to AWS
./helm-deploy.sh -e aws -d islamic-app.example.com
```

### Google GKE

#### Prerequisites Setup
```bash
# Reserve static IP
gcloud compute addresses create islamic-app-ip --global

# Get reserved IP
gcloud compute addresses list

# Create managed certificate
cat <<EOF | kubectl apply -f -
apiVersion: networking.gke.io/v1
kind: ManagedCertificate
metadata:
  name: islamic-app-ssl-cert
  namespace: islamic-app
spec:
  domains:
    - islamic-app.example.com
EOF
```

#### Configuration (values-gcp.yaml)
```yaml
environment:
  type: "gcp"
  domain: "islamic-app.example.com"

ingress:
  className: "gce"
  annotations:
    kubernetes.io/ingress.class: "gce"
    kubernetes.io/ingress.global-static-ip-name: "islamic-app-ip"
    ingress.gcp.kubernetes.io/managed-certificates: "islamic-app-ssl-cert"

persistence:
  storageClass: "ssd"
  size: 20Gi

nodeSelector:
  cloud.google.com/gke-nodepool: application-pool
```

#### Deployment
```bash
# Deploy to GCP
./helm-deploy.sh -e gcp -d islamic-app.example.com
```

### Azure AKS

#### Prerequisites Setup
```bash
# Install NGINX ingress controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --create-namespace \
  --namespace ingress-nginx \
  --set controller.service.externalTrafficPolicy=Local

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create cluster issuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

#### Configuration (values-azure.yaml)
```yaml
environment:
  type: "azure"
  domain: "islamic-app.example.com"

ingress:
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"

persistence:
  storageClass: "managed-premium"
  size: 20Gi

nodeSelector:
  agentpool: application
```

#### Deployment
```bash
# Deploy to Azure
./helm-deploy.sh -e azure -d islamic-app.example.com
```

## Production Setup

### Security Configuration

#### External Secret Management

##### AWS Secrets Manager Integration
```yaml
# Create external secret
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
  namespace: islamic-app
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-west-2
      auth:
        secretRef:
          accessKeyID:
            name: awssm-secret
            key: access-key
          secretAccessKey:
            name: awssm-secret
            key: secret-access-key

---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: islamic-app-secrets
  namespace: islamic-app
spec:
  refreshInterval: 15s
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: islamic-app-secrets
    creationPolicy: Owner
  data:
  - secretKey: postgres-password
    remoteRef:
      key: islamic-app/postgres
      property: password
  - secretKey: secret-key
    remoteRef:
      key: islamic-app/flask
      property: secret_key
```

##### Azure Key Vault Integration
```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: azure-keyvault
  namespace: islamic-app
spec:
  provider:
    azurekv:
      vaultUrl: "https://my-keyvault.vault.azure.net/"
      authType: ManagedIdentity
      clientId: "client-id"

---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: islamic-app-secrets
  namespace: islamic-app
spec:
  refreshInterval: 15s
  secretStoreRef:
    name: azure-keyvault
    kind: SecretStore
  target:
    name: islamic-app-secrets
  data:
  - secretKey: postgres-password
    remoteRef:
      key: postgres-password
  - secretKey: secret-key
    remoteRef:
      key: flask-secret-key
```

#### TLS/SSL Configuration

##### Cert-Manager with Let's Encrypt
```yaml
# Cluster issuer
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx

# Ingress with TLS
ingress:
  tls:
    - secretName: islamic-app-tls
      hosts:
        - islamic-app.example.com
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

#### Network Policies
```yaml
# Network policy for backend
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: islamic-app-backend-netpol
  namespace: islamic-app
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/component: backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app.kubernetes.io/component: frontend
    ports:
    - protocol: TCP
      port: 5000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app.kubernetes.io/component: database
    ports:
    - protocol: TCP
      port: 5432
```

#### RBAC Configuration
```yaml
# Service account
apiVersion: v1
kind: ServiceAccount
metadata:
  name: islamic-app
  namespace: islamic-app

# Role
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: islamic-app-role
  namespace: islamic-app
rules:
- apiGroups: [""]
  resources: ["secrets", "configmaps"]
  verbs: ["get", "list"]

# Role binding
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: islamic-app-rolebinding
  namespace: islamic-app
subjects:
- kind: ServiceAccount
  name: islamic-app
  namespace: islamic-app
roleRef:
  kind: Role
  name: islamic-app-role
  apiGroup: rbac.authorization.k8s.io
```

### High Availability Configuration

#### Multi-Zone Deployment
```yaml
# Pod anti-affinity
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app.kubernetes.io/component
            operator: In
            values:
            - backend
        topologyKey: kubernetes.io/hostname

# Zone spreading
topologySpreadConstraints:
- maxSkew: 1
  topologyKey: topology.kubernetes.io/zone
  whenUnsatisfiable: DoNotSchedule
  labelSelector:
    matchLabels:
      app.kubernetes.io/component: backend
```

#### Database High Availability
```yaml
# PostgreSQL cluster (using operator)
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: postgres-cluster
  namespace: islamic-app
spec:
  instances: 3
  postgresql:
    parameters:
      max_connections: "200"
      shared_buffers: "256MB"
      effective_cache_size: "1GB"
  bootstrap:
    initdb:
      database: islamic_app
      owner: islamic_user
      secret:
        name: postgres-credentials
  storage:
    size: 20Gi
    storageClass: fast-ssd
```

### Resource Optimization

#### Production Resource Limits
```yaml
resources:
  backend:
    limits:
      cpu: 2000m
      memory: 2Gi
    requests:
      cpu: 1000m
      memory: 1Gi
  frontend:
    limits:
      cpu: 1000m
      memory: 1Gi
    requests:
      cpu: 500m
      memory: 512Mi
  postgres:
    limits:
      cpu: 2000m
      memory: 4Gi
    requests:
      cpu: 1000m
      memory: 2Gi
```

#### Vertical Pod Autoscaler
```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: islamic-app-backend-vpa
  namespace: islamic-app
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: islamic-app-backend
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: backend
      maxAllowed:
        cpu: 2
        memory: 4Gi
      minAllowed:
        cpu: 100m
        memory: 128Mi
```

## Troubleshooting

### Common Issues and Solutions

#### Pod Startup Issues

##### Backend Pod CrashLoopBackOff
```bash
# Check pod status
kubectl get pods -n islamic-app

# Check pod logs
kubectl logs -f deployment/islamic-app-backend -n islamic-app

# Check pod description
kubectl describe pod -l app.kubernetes.io/component=backend -n islamic-app

# Common causes:
# 1. Database connection failure
# 2. Missing environment variables
# 3. Image pull errors
# 4. Resource constraints
```

##### Database Connection Issues
```bash
# Test database connectivity
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

# Check PostgreSQL logs
kubectl logs -f deployment/postgres -n islamic-app

# Test PostgreSQL service
kubectl exec -n islamic-app deployment/islamic-app-backend -- \
  nc -zv postgres 5432
```

#### Ingress Issues

##### Ingress Not Working
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress resource
kubectl describe ingress -n islamic-app

# Check ingress controller logs
kubectl logs -f deployment/ingress-nginx-controller -n ingress-nginx

# Test ingress connectivity
curl -H "Host: islamic-app.local" http://localhost
```

##### SSL Certificate Issues
```bash
# Check certificate status
kubectl get certificates -n islamic-app

# Check certificate description
kubectl describe certificate islamic-app-tls -n islamic-app

# Check cert-manager logs
kubectl logs -f deployment/cert-manager -n cert-manager

# Manual certificate check
openssl s_client -connect islamic-app.example.com:443 -servername islamic-app.example.com
```

#### Storage Issues

##### Persistent Volume Issues
```bash
# Check PV status
kubectl get pv

# Check PVC status
kubectl get pvc -n islamic-app

# Check storage class
kubectl get storageclass

# Check pod volume mounts
kubectl describe pod -l app.kubernetes.io/component=database -n islamic-app
```

#### Performance Issues

##### High CPU Usage
```bash
# Check resource usage
kubectl top pods -n islamic-app

# Check HPA status
kubectl get hpa -n islamic-app

# Check resource limits
kubectl describe pod -l app.kubernetes.io/component=backend -n islamic-app

# Scale manually if needed
kubectl scale deployment islamic-app-backend --replicas=3 -n islamic-app
```

##### Memory Issues
```bash
# Check memory usage
kubectl top pods -n islamic-app --sort-by=memory

# Check for memory leaks
kubectl exec -n islamic-app deployment/islamic-app-backend -- \
  python -c "
import psutil
process = psutil.Process()
print(f'Memory usage: {process.memory_info().rss / 1024 / 1024:.2f} MB')
"

# Check OOMKilled events
kubectl get events -n islamic-app --field-selector reason=OOMKilling
```

### Debugging Commands

#### General Debugging
```bash
# Get all resources
kubectl get all -n islamic-app

# Check events
kubectl get events -n islamic-app --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods -n islamic-app
kubectl top nodes

# Check cluster info
kubectl cluster-info
kubectl get nodes -o wide
```

#### Application-Specific Debugging
```bash
# Test backend API
kubectl port-forward svc/islamic-app-backend 5000:5000 -n islamic-app &
curl http://localhost:5000/api/health

# Test frontend
kubectl port-forward svc/islamic-app-frontend 3000:3000 -n islamic-app &
curl http://localhost:3000

# Test database
kubectl port-forward svc/postgres 5432:5432 -n islamic-app &
psql -h localhost -U islamic_user -d islamic_app

# Check configuration
kubectl get configmap islamic-app-config -n islamic-app -o yaml
kubectl get secret islamic-app-secrets -n islamic-app -o yaml
```

#### Helm-Specific Debugging
```bash
# Check Helm release
helm list -n islamic-app

# Check Helm release history
helm history islamic-app -n islamic-app

# Get Helm values
helm get values islamic-app -n islamic-app

# Get rendered manifests
helm get manifest islamic-app -n islamic-app

# Validate chart
helm lint ./helm/islamic-app

# Template without installing
helm template islamic-app ./helm/islamic-app --debug
```

## Maintenance

### Regular Maintenance Tasks

#### Daily Tasks
```bash
# Check cluster health
kubectl get nodes
kubectl get pods -A --field-selector=status.phase!=Running

# Check resource usage
kubectl top nodes
kubectl top pods -A --sort-by=cpu

# Check storage usage
kubectl get pv
df -h /var/lib/docker

# Check logs for errors
kubectl logs -f deployment/islamic-app-backend -n islamic-app | grep ERROR
kubectl logs -f deployment/islamic-app-frontend -n islamic-app | grep ERROR
```

#### Weekly Tasks
```bash
# Update Helm dependencies
helm dependency update ./helm/islamic-app

# Check for outdated images
# (Use tools like Snyk, Trivy, or custom scripts)

# Review resource utilization
kubectl describe hpa -n islamic-app
kubectl top pods -n islamic-app --sort-by=memory

# Check certificate expiration
kubectl get certificates -n islamic-app
```

#### Monthly Tasks
```bash
# Backup database
kubectl exec -n islamic-app deployment/postgres -- \
  pg_dump -U islamic_user islamic_app > backup-$(date +%Y%m%d).sql

# Review and rotate secrets
# Update passwords and keys

# Update chart version
# Update Chart.yaml version
# Tag new release

# Performance testing
# Run load tests against the application
```

### Upgrade Procedures

#### Application Upgrades
```bash
# Rolling update with new image
helm upgrade islamic-app ./helm/islamic-app \
  --namespace islamic-app \
  --set image.backend.tag=new-version \
  --set image.frontend.tag=new-version

# Blue-green deployment
helm install islamic-app-green ./helm/islamic-app \
  --namespace islamic-app-green \
  --set image.backend.tag=new-version

# Switch traffic after validation
# Update ingress or load balancer
```

#### Database Migrations
```bash
# Run database migrations
kubectl exec -n islamic-app deployment/islamic-app-backend -- \
  python -c "
from database import db
from flask import current_app
with current_app.app_context():
    db.create_all()
"

# Or using custom migration script
kubectl exec -n islamic-app deployment/islamic-app-backend -- \
  python migrate.py
```

#### Kubernetes Upgrades
```bash
# Before cluster upgrade
# Backup etcd
# Export all manifests
kubectl get all --all-namespaces -o yaml > cluster-backup.yaml

# After cluster upgrade
# Verify all pods are running
kubectl get pods -A

# Verify Helm releases
helm list -A

# Test application functionality
```

### Monitoring and Alerting Setup

#### Prometheus and Grafana
```bash
# Install kube-prometheus-stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# Create ServiceMonitor for Islamic App
cat <<EOF | kubectl apply -f -
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: islamic-app-backend
  namespace: islamic-app
spec:
  selector:
    matchLabels:
      app.kubernetes.io/component: backend
  endpoints:
  - port: http
    path: /metrics
EOF
```

#### Application Metrics
```python
# Add to backend application (app.py)
from prometheus_client import Counter, Histogram, generate_latest
from flask import Response

# Metrics
REQUEST_COUNT = Counter('islamic_app_requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('islamic_app_request_duration_seconds', 'Request latency')

@app.route('/metrics')
def metrics():
    return Response(generate_latest(), mimetype='text/plain')

@app.before_request
def before_request():
    REQUEST_COUNT.labels(method=request.method, endpoint=request.endpoint).inc()
```

#### Alerting Rules
```yaml
# AlertManager rules
groups:
- name: islamic-app
  rules:
  - alert: BackendDown
    expr: up{job="islamic-app-backend"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Islamic App Backend is down"
      description: "Backend has been down for more than 1 minute"

  - alert: HighCPUUsage
    expr: rate(container_cpu_usage_seconds_total{pod=~"islamic-app-.*"}[5m]) > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage detected"
      description: "CPU usage is above 80% for 5 minutes"

  - alert: HighMemoryUsage
    expr: container_memory_usage_bytes{pod=~"islamic-app-.*"} / container_spec_memory_limit_bytes > 0.9
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage detected"
      description: "Memory usage is above 90% for 5 minutes"
```

## Security

### Security Best Practices

#### Container Security
```yaml
# Security context
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  runAsGroup: 1000
  fsGroup: 1000
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
    - ALL

# Pod security context
podSecurityContext:
  fsGroup: 1000
  runAsGroup: 1000
  runAsNonRoot: true
  runAsUser: 1000
```

#### Network Security
```yaml
# Network policy example
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: islamic-app-network-policy
  namespace: islamic-app
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
  - to:
    - podSelector:
        matchLabels:
          app.kubernetes.io/component: database
    ports:
    - protocol: TCP
      port: 5432
```

#### Secret Management
```bash
# Create secrets from external sources
kubectl create secret generic islamic-app-secrets \
  --from-literal=postgres-password=$(openssl rand -base64 32) \
  --from-literal=secret-key=$(openssl rand -base64 32) \
  --from-literal=jwt-secret-key=$(openssl rand -base64 32) \
  --namespace islamic-app

# Encrypt secrets at rest
# Configure etcd encryption in cluster
```

#### Image Security
```bash
# Scan images for vulnerabilities
trivy image khaledhawil/islamic-app_backend:36-18b4564
trivy image khaledhawil/islamic-app_frontend:36-18b4564

# Use specific image tags (not latest)
# Verify image signatures
# Use private registries for production
```

### Compliance and Auditing

#### Pod Security Standards
```yaml
# Pod Security Policy (deprecated) or Pod Security Standards
apiVersion: v1
kind: Namespace
metadata:
  name: islamic-app
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

#### Audit Logging
```yaml
# Kubernetes audit policy
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
- level: Metadata
  namespaces: ["islamic-app"]
  resources:
  - group: ""
    resources: ["secrets", "configmaps"]
  - group: "apps"
    resources: ["deployments", "statefulsets"]
```

## Monitoring

### Metrics Collection

#### Custom Metrics
```python
# Backend metrics (add to Flask app)
from prometheus_client import Counter, Histogram, Gauge
import time

# Define metrics
http_requests_total = Counter('http_requests_total', 'Total HTTP requests', ['method', 'status'])
http_request_duration_seconds = Histogram('http_request_duration_seconds', 'HTTP request duration')
active_users = Gauge('active_users_total', 'Number of active users')
prayer_requests_total = Counter('prayer_requests_total', 'Total prayer time requests')

# Middleware for metrics
@app.before_request
def before_request():
    request.start_time = time.time()

@app.after_request
def after_request(response):
    duration = time.time() - request.start_time
    http_request_duration_seconds.observe(duration)
    http_requests_total.labels(method=request.method, status=response.status_code).inc()
    return response
```

#### Health Check Endpoints
```python
# Enhanced health check
@app.route('/api/health')
def health_check():
    health_status = {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': app.config.get('VERSION', 'unknown'),
        'checks': {}
    }
    
    # Database check
    try:
        db.session.execute('SELECT 1')
        health_status['checks']['database'] = 'healthy'
    except Exception as e:
        health_status['checks']['database'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # External API checks
    try:
        # Check prayer times API
        response = requests.get('http://api.aladhan.com/v1/ping', timeout=5)
        health_status['checks']['prayer_api'] = 'healthy' if response.status_code == 200 else 'unhealthy'
    except Exception as e:
        health_status['checks']['prayer_api'] = f'unhealthy: {str(e)}'
    
    status_code = 200 if health_status['status'] == 'healthy' else 503
    return jsonify(health_status), status_code
```

### Dashboard Configuration

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Islamic App Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{job=\"islamic-app-backend\"}[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=\"islamic-app-backend\"}[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "singlestat",
        "targets": [
          {
            "expr": "active_users_total",
            "legendFormat": "Active Users"
          }
        ]
      }
    ]
  }
}
```

## Backup and Recovery

### Database Backup

#### Automated Backup CronJob
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: islamic-app
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: postgres-backup
            image: postgres:15-alpine
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: islamic-app-secrets
                  key: postgres-password
            command:
            - /bin/bash
            - -c
            - |
              pg_dump -h postgres -U islamic_user islamic_app | \
              gzip > /backup/islamic-app-$(date +%Y%m%d-%H%M%S).sql.gz
              # Upload to cloud storage
              aws s3 cp /backup/islamic-app-$(date +%Y%m%d-%H%M%S).sql.gz s3://my-backup-bucket/
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

#### Manual Backup
```bash
# Create backup
kubectl exec -n islamic-app deployment/postgres -- \
  pg_dump -U islamic_user islamic_app | \
  gzip > islamic-app-backup-$(date +%Y%m%d).sql.gz

# Upload to cloud storage
aws s3 cp islamic-app-backup-$(date +%Y%m%d).sql.gz s3://my-backup-bucket/

# Verify backup
gunzip -c islamic-app-backup-$(date +%Y%m%d).sql.gz | head -20
```

### Disaster Recovery

#### Recovery Procedures
```bash
# 1. Restore from backup
# Download backup from cloud storage
aws s3 cp s3://my-backup-bucket/islamic-app-backup-20240101.sql.gz .

# 2. Scale down application
kubectl scale deployment islamic-app-backend --replicas=0 -n islamic-app

# 3. Restore database
kubectl exec -i -n islamic-app deployment/postgres -- \
  psql -U islamic_user -d islamic_app < <(gunzip -c islamic-app-backup-20240101.sql.gz)

# 4. Scale up application
kubectl scale deployment islamic-app-backend --replicas=2 -n islamic-app

# 5. Verify application
kubectl port-forward svc/islamic-app-frontend 3000:3000 -n islamic-app
```

#### Cross-Region Backup
```bash
# Sync backups to multiple regions
aws s3 sync s3://my-backup-bucket-us-west-2/ s3://my-backup-bucket-us-east-1/ --region us-east-1

# Test restore in different region
# Deploy temporary cluster in different region
# Restore and validate data
```

## Development

### Local Development Setup

#### Development Environment
```bash
# Clone repository
git clone <repository-url>
cd Full-DevOps-Project-islamic-app

# Start local services
docker-compose up -d postgres redis

# Install dependencies
cd backend
pip install -r requirements.txt

cd ../frontend
npm install

# Start development servers
# Backend
cd backend
export DATABASE_URL=postgresql://islamic_user:islamic_pass123@localhost:5432/islamic_app
python app.py

# Frontend
cd frontend
npm start
```

#### Testing with Helm
```bash
# Validate chart
helm lint ./helm/islamic-app

# Dry run
helm install islamic-app ./helm/islamic-app --dry-run --debug

# Deploy to development
./helm-deploy.sh -e kind

# Port forward for testing
kubectl port-forward svc/islamic-app-frontend 3000:3000 -n islamic-app
kubectl port-forward svc/islamic-app-backend 5000:5000 -n islamic-app
```

### Chart Development

#### Template Functions
```yaml
# Custom template functions in _helpers.tpl

{{/*
Database connection string for different environments
*/}}
{{- define "islamic-app.databaseUrl" -}}
{{- if eq .Values.environment.type "aws" -}}
{{- printf "postgresql://%s:%s@%s.%s.rds.amazonaws.com:5432/%s" .Values.postgresql.auth.postgresUser .Values.postgresql.auth.postgresPassword .Values.environment.rdsEndpoint .Values.environment.region .Values.postgresql.auth.postgresDatabase | b64enc -}}
{{- else -}}
{{- printf "postgresql://%s:%s@postgres:5432/%s" .Values.postgresql.auth.postgresUser .Values.postgresql.auth.postgresPassword .Values.postgresql.auth.postgresDatabase | b64enc -}}
{{- end -}}
{{- end -}}

{{/*
Environment-specific image registry
*/}}
{{- define "islamic-app.imageRegistry" -}}
{{- if eq .Values.environment.type "aws" -}}
{{- printf "%s.dkr.ecr.%s.amazonaws.com" .Values.environment.accountId .Values.environment.region -}}
{{- else if eq .Values.environment.type "gcp" -}}
{{- printf "gcr.io/%s" .Values.environment.projectId -}}
{{- else -}}
{{- .Values.image.registry | default "docker.io" -}}
{{- end -}}
{{- end -}}
```

#### Testing Templates
```bash
# Test specific template
helm template islamic-app ./helm/islamic-app \
  --show-only templates/backend.yaml \
  --set environment.type=aws

# Test with different values
helm template islamic-app ./helm/islamic-app \
  --values values-aws.yaml \
  --debug

# Validate generated manifests
helm template islamic-app ./helm/islamic-app | kubectl apply --dry-run=client -f -
```

### CI/CD Integration

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy Islamic App
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Lint Helm Chart
      run: |
        helm lint ./helm/islamic-app
    
    - name: Test Helm Template
      run: |
        helm template islamic-app ./helm/islamic-app --debug
    
    - name: Security Scan
      run: |
        trivy fs ./helm/islamic-app

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-west-2
    
    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --name my-cluster
    
    - name: Deploy to staging
      run: |
        ./helm-deploy.sh -e aws -d staging.islamic-app.com
```

## API Reference

### Helm Chart Values API

#### Global Configuration
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `global.imageRegistry` | string | `""` | Global image registry |
| `global.imagePullSecrets` | array | `[]` | Global image pull secrets |
| `global.storageClass` | string | `""` | Global storage class |

#### Image Configuration
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `image.backend.repository` | string | `khaledhawil/islamic-app_backend` | Backend image repository |
| `image.backend.tag` | string | `36-18b4564` | Backend image tag |
| `image.backend.pullPolicy` | string | `IfNotPresent` | Backend image pull policy |
| `image.frontend.repository` | string | `khaledhawil/islamic-app_frontend` | Frontend image repository |
| `image.frontend.tag` | string | `36-18b4564` | Frontend image tag |
| `image.frontend.pullPolicy` | string | `IfNotPresent` | Frontend image pull policy |

#### Service Configuration
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `service.backend.type` | string | `ClusterIP` | Backend service type |
| `service.backend.port` | integer | `5000` | Backend service port |
| `service.backend.annotations` | object | `{}` | Backend service annotations |
| `service.frontend.type` | string | `ClusterIP` | Frontend service type |
| `service.frontend.port` | integer | `3000` | Frontend service port |
| `service.frontend.nodePort` | integer | `nil` | Frontend NodePort (when type is NodePort) |

#### Ingress Configuration
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `ingress.enabled` | boolean | `true` | Enable ingress |
| `ingress.className` | string | `""` | Ingress class name |
| `ingress.annotations` | object | `{}` | Ingress annotations |
| `ingress.hosts` | array | See values.yaml | Ingress hosts configuration |
| `ingress.tls` | array | `[]` | TLS configuration |

#### Resource Configuration
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `resources.backend.limits.cpu` | string | `500m` | Backend CPU limit |
| `resources.backend.limits.memory` | string | `512Mi` | Backend memory limit |
| `resources.backend.requests.cpu` | string | `250m` | Backend CPU request |
| `resources.backend.requests.memory` | string | `256Mi` | Backend memory request |

#### Autoscaling Configuration
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `autoscaling.enabled` | boolean | `true` | Enable HPA |
| `autoscaling.minReplicas` | integer | `1` | Minimum replicas |
| `autoscaling.maxReplicas` | integer | `5` | Maximum replicas |
| `autoscaling.targetCPUUtilizationPercentage` | integer | `80` | CPU target percentage |
| `autoscaling.targetMemoryUtilizationPercentage` | integer | `80` | Memory target percentage |

### Template Functions Reference

#### Helper Functions
| Function | Description | Usage |
|----------|-------------|-------|
| `islamic-app.name` | Chart name | `{{ include "islamic-app.name" . }}` |
| `islamic-app.fullname` | Full application name | `{{ include "islamic-app.fullname" . }}` |
| `islamic-app.chart` | Chart name and version | `{{ include "islamic-app.chart" . }}` |
| `islamic-app.labels` | Common labels | `{{ include "islamic-app.labels" . }}` |
| `islamic-app.selectorLabels` | Selector labels | `{{ include "islamic-app.selectorLabels" . }}` |
| `islamic-app.backend.labels` | Backend labels | `{{ include "islamic-app.backend.labels" . }}` |
| `islamic-app.frontend.labels` | Frontend labels | `{{ include "islamic-app.frontend.labels" . }}` |
| `islamic-app.postgresql.labels` | PostgreSQL labels | `{{ include "islamic-app.postgresql.labels" . }}` |
| `islamic-app.databaseUrl` | Database connection URL | `{{ include "islamic-app.databaseUrl" . }}` |
| `islamic-app.namespace` | Namespace name | `{{ include "islamic-app.namespace" . }}` |

### Deployment Script API

#### Command Line Options
```bash
Usage: ./helm-deploy.sh [OPTIONS]

Options:
  -h, --help              Show help message
  -e, --environment ENV   Environment (kind, aws, gcp, azure, generic)
  -v, --values FILE       Custom values file
  -d, --domain DOMAIN     Override domain name
  --dry-run              Perform dry run
  --uninstall            Uninstall application
  --status               Check deployment status

Examples:
  ./helm-deploy.sh -e kind
  ./helm-deploy.sh -e aws -d example.com
  ./helm-deploy.sh -v custom.yaml --dry-run
```

#### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `CHART_PATH` | Path to Helm chart | `./helm/islamic-app` |
| `RELEASE_NAME` | Helm release name | `islamic-app` |
| `NAMESPACE` | Kubernetes namespace | `islamic-app` |
| `KUBECONFIG` | Kubernetes config file | `~/.kube/config` |

This comprehensive documentation covers all aspects of the Islamic App Helm chart deployment and management. For additional support or questions, refer to the troubleshooting section or consult the Kubernetes and Helm official documentation.
