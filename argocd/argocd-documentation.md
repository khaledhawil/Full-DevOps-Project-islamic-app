# ArgoCD GitOps Documentation

## Overview
ArgoCD configuration for GitOps-based continuous delivery of the Islamic App. Provides automated, declarative deployment management with self-healing capabilities.

## Directory Structure
```
argocd/
├── application.yaml           # Production application
├── application-staging.yaml   # Staging application  
├── project.yaml              # ArgoCD project configuration
├── deploy.sh                 # Deployment script
└── README.md                 # Detailed setup guide
```

## ArgoCD Components

### project.yaml
Defines the ArgoCD project with access controls and repository configurations.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: islamic-app-project
  namespace: argocd
spec:
  description: Islamic App Project for Prayer Times, Quran, and Islamic Content
  
  # Source repositories
  sourceRepos:
  - 'https://github.com/your-username/Full-DevOps-Project-islamic-app'
  
  # Destination clusters and namespaces
  destinations:
  - namespace: islamic-app
    server: https://kubernetes.default.svc
  - namespace: islamic-app-staging
    server: https://kubernetes.default.svc
    
  # Cluster resource whitelist
  clusterResourceWhitelist:
  - group: ''
    kind: Namespace
  - group: ''
    kind: PersistentVolume
    
  # Namespace resource whitelist
  namespaceResourceWhitelist:
  - group: ''
    kind: ConfigMap
  - group: ''
    kind: Secret
  - group: ''
    kind: Service
  - group: ''
    kind: PersistentVolumeClaim
  - group: 'apps'
    kind: Deployment
  - group: 'apps'
    kind: ReplicaSet
  - group: 'networking.k8s.io'
    kind: Ingress
  - group: 'autoscaling'
    kind: HorizontalPodAutoscaler
    
  # RBAC roles
  roles:
  - name: admin
    description: Admin privileges for Islamic App
    policies:
    - p, proj:islamic-app-project:admin, applications, *, islamic-app-project/*, allow
    - p, proj:islamic-app-project:admin, clusters, *, *, allow
    - p, proj:islamic-app-project:admin, repositories, *, *, allow
    groups:
    - islamic-app:admin
    
  - name: developer  
    description: Developer access for Islamic App
    policies:
    - p, proj:islamic-app-project:developer, applications, get, islamic-app-project/*, allow
    - p, proj:islamic-app-project:developer, applications, sync, islamic-app-project/*, allow
    groups:
    - islamic-app:developer
```

### application.yaml
Production environment application configuration.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: islamic-app
  namespace: argocd
  labels:
    app: islamic-app
    environment: production
  annotations:
    argocd.argoproj.io/sync-wave: "1"
    
spec:
  project: islamic-app-project
  
  # Source configuration
  source:
    repoURL: https://github.com/your-username/Full-DevOps-Project-islamic-app
    targetRevision: master
    path: k8s
    
    # Kustomize configuration (if using kustomization)
    kustomize:
      namePrefix: prod-
      commonLabels:
        environment: production
        app: islamic-app
        
  # Destination configuration
  destination:
    server: https://kubernetes.default.svc
    namespace: islamic-app
    
  # Sync policy
  syncPolicy:
    automated:
      prune: true          # Delete resources not in Git
      selfHeal: true       # Correct drift automatically
      allowEmpty: false    # Don't sync if no resources
      
    syncOptions:
    - CreateNamespace=true    # Create namespace if it doesn't exist
    - PrunePropagationPolicy=foreground
    - PruneLast=true         # Prune resources after sync
    
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
        
  # Health check configuration
  revisionHistoryLimit: 10
  
  # Ignore differences
  ignoreDifferences:
  - group: apps
    kind: Deployment
    jsonPointers:
    - /spec/replicas          # Ignore replica differences (for HPA)
    
  # Notification configuration
  annotations:
    notifications.argoproj.io/subscribe.on-sync-succeeded.discord: webhook-url
    notifications.argoproj.io/subscribe.on-sync-failed.discord: webhook-url
    notifications.argoproj.io/subscribe.on-health-degraded.discord: webhook-url
```

### application-staging.yaml
Staging environment application configuration.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: islamic-app-staging
  namespace: argocd
  labels:
    app: islamic-app
    environment: staging
    
spec:
  project: islamic-app-project
  
  # Source configuration
  source:
    repoURL: https://github.com/your-username/Full-DevOps-Project-islamic-app
    targetRevision: develop    # Different branch for staging
    path: k8s
    
    kustomize:
      namePrefix: staging-
      commonLabels:
        environment: staging
        app: islamic-app
        
  # Destination configuration
  destination:
    server: https://kubernetes.default.svc
    namespace: islamic-app-staging
    
  # Sync policy
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      
    syncOptions:
    - CreateNamespace=true
    
  # Health check
  revisionHistoryLimit: 5
```

### deploy.sh
ArgoCD deployment automation script.

```bash
#!/bin/bash
set -e

echo "Deploying ArgoCD applications for Islamic App..."

# Check if ArgoCD is installed
if ! kubectl get namespace argocd >/dev/null 2>&1; then
    echo "Installing ArgoCD..."
    kubectl create namespace argocd
    kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
    
    echo "Waiting for ArgoCD to be ready..."
    kubectl wait --for=condition=available --timeout=600s deployment/argocd-server -n argocd
fi

# Create the project
echo "Creating ArgoCD project..."
kubectl apply -f project.yaml

# Wait for project to be created
sleep 5

# Create applications
echo "Creating production application..."
kubectl apply -f application.yaml

echo "Creating staging application..."
kubectl apply -f application-staging.yaml

# Wait for applications to be created
echo "Waiting for applications to sync..."
sleep 10

# Check application status
echo "Application status:"
kubectl get applications -n argocd

# Get ArgoCD admin password
echo "ArgoCD admin password:"
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
echo ""

# Port forward to access ArgoCD UI
echo "To access ArgoCD UI, run:"
echo "kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "Then visit: https://localhost:8080"

echo "ArgoCD deployment completed successfully!"
```

## GitOps Workflow

### Development Process
1. **Developer pushes code** to feature branch
2. **Jenkins CI** runs tests and builds images
3. **Developer creates PR** to develop branch
4. **Staging deployment** automatically syncs from develop branch
5. **QA testing** performed in staging environment
6. **PR merged** to master branch after approval
7. **Production deployment** automatically syncs from master branch

### Deployment Flow
```
Git Repository (Source of Truth)
         ↓
    ArgoCD Monitors
         ↓
   Detects Changes
         ↓
  Pulls Manifests
         ↓
   Applies to K8s
         ↓
    Monitors Health
         ↓
   Self-Heals if Needed
```

## ArgoCD Features Used

### Automated Sync
- **Prune**: Removes resources not in Git
- **Self-Heal**: Corrects configuration drift
- **Retry Logic**: Handles temporary failures

### Multi-Environment Support
- **Production**: Master branch → islamic-app namespace
- **Staging**: Develop branch → islamic-app-staging namespace
- **Resource Isolation**: Separate namespaces and configurations

### Health Monitoring
- **Application Health**: Monitors resource status
- **Sync Status**: Tracks deployment progress
- **Resource Status**: Individual component health

### Security
- **RBAC**: Role-based access control
- **Project Isolation**: Restricted resource access
- **Audit Trail**: Complete deployment history

## Monitoring and Observability

### ArgoCD Metrics
- Sync success/failure rates
- Application health status
- Resource drift detection
- Deployment frequency

### Notifications
- Discord webhooks for deployment events
- Slack integration available
- Email notifications configurable
- Custom webhook support

### Dashboards
- ArgoCD Web UI for application management
- Grafana dashboards for metrics visualization
- Prometheus metrics collection
- Custom alerting rules

## Configuration Management

### Kustomize Integration
```yaml
# kustomization.yaml for environment-specific configs
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: islamic-app

resources:
- ../base

namePrefix: prod-

commonLabels:
  environment: production
  managed-by: argocd

configMapGenerator:
- name: app-config
  literals:
  - DATABASE_URL=postgresql://prod-db:5432/islamic_app
  - ENVIRONMENT=production

secretGenerator:
- name: app-secrets
  literals:
  - JWT_SECRET=production-secret-key
```

### Helm Integration
```yaml
# If using Helm charts
source:
  repoURL: https://github.com/your-username/islamic-app-helm
  targetRevision: v1.0.0
  chart: islamic-app
  helm:
    valueFiles:
    - values-production.yaml
    parameters:
    - name: image.tag
      value: v1.2.3
    - name: replicaCount
      value: "3"
```

## Troubleshooting

### Common Issues

1. **Application OutOfSync**
   ```bash
   # Check differences
   argocd app diff islamic-app
   
   # Manual sync
   argocd app sync islamic-app
   ```

2. **Health Check Failures**
   ```bash
   # Check resource status
   kubectl get pods -n islamic-app
   kubectl describe pod <pod-name> -n islamic-app
   ```

3. **Permission Issues**
   ```bash
   # Check RBAC
   kubectl auth can-i create deployment --as=system:serviceaccount:argocd:argocd-application-controller -n islamic-app
   ```

### Debug Commands

```bash
# ArgoCD CLI commands
argocd app list
argocd app get islamic-app
argocd app history islamic-app
argocd app rollback islamic-app <revision>

# Kubernetes commands
kubectl get applications -n argocd
kubectl describe application islamic-app -n argocd
kubectl logs -f deployment/argocd-application-controller -n argocd
```

### Recovery Procedures

```bash
# Reset application to Git state
argocd app sync islamic-app --force

# Refresh application
argocd app refresh islamic-app

# Delete and recreate application
kubectl delete application islamic-app -n argocd
kubectl apply -f application.yaml
```

## Best Practices

### Repository Structure
- Keep manifests in Git repository
- Use separate branches for environments
- Implement proper Git workflow
- Tag releases for production deployments

### Security
- Use RBAC for access control
- Implement secrets management
- Regular security audits
- Principle of least privilege

### Monitoring
- Set up proper alerts
- Monitor application health
- Track deployment metrics
- Implement logging aggregation

### Backup and Recovery
- Regular Git repository backups
- ArgoCD configuration backups
- Disaster recovery procedures
- Testing recovery processes
