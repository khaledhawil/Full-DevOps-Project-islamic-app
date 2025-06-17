# ArgoCD Configuration for Islamic App

This directory contains ArgoCD configuration files for the Islamic App project.

## Applications

### Production Application (`application.yaml`)
- **Name**: islamic-app
- **Namespace**: islamic-app
- **Source**: master branch
- **Sync Policy**: Automated with self-healing enabled
- **Prune**: Enabled to remove resources not in Git

### Staging Application (`application-staging.yaml`)
- **Name**: islamic-app-staging
- **Namespace**: islamic-app-staging
- **Source**: develop branch
- **Sync Policy**: Automated with self-healing enabled

### Project Configuration (`project.yaml`)
- **Name**: islamic-app-project
- **Description**: Islamic App Project for Prayer Times, Quran, and Islamic Content
- **Roles**: Admin and Developer access levels

## Deployment Instructions

### Prerequisites
- ArgoCD installed and running in your cluster
- kubectl configured to access your cluster
- Access to the GitHub repository

### Deploy ArgoCD Applications

1. **Apply the Project first:**
   ```bash
   kubectl apply -f argocd/project.yaml
   ```

2. **Deploy Production Application:**
   ```bash
   kubectl apply -f argocd/application.yaml
   ```

3. **Deploy Staging Application (optional):**
   ```bash
   kubectl apply -f argocd/application-staging.yaml
   ```

### Verify Deployment

```bash
# Check ArgoCD applications
kubectl get applications -n argocd

# Check application status
kubectl describe application islamic-app -n argocd

# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Then open: https://localhost:8080

### Application Features

- **Automated Sync**: Applications automatically sync with Git repository changes
- **Self-Healing**: Automatically corrects any drift from desired state
- **Pruning**: Removes resources that are no longer in Git
- **Retry Logic**: Automatic retry on failed sync operations
- **Namespace Creation**: Automatically creates target namespaces
- **Security**: Project-based RBAC with admin and developer roles

## Monitoring

The applications include:
- Health checks for all components
- Resource status monitoring
- Sync status tracking
- History of deployments with rollback capability

## Troubleshooting

If applications fail to sync:

1. Check application status:
   ```bash
   kubectl describe app islamic-app -n argocd
   ```

2. Check ArgoCD server logs:
   ```bash
   kubectl logs -l app.kubernetes.io/name=argocd-server -n argocd
   ```

3. Manually sync application:
   ```bash
   # Using ArgoCD CLI
   argocd app sync islamic-app
   
   # Or via kubectl
   kubectl patch app islamic-app -n argocd --type merge --patch '{"operation":{"initiatedBy":{"automated":false},"sync":{"syncStrategy":{}}}}'
   ```

## Security Notes

- Applications are configured with proper RBAC
- Only whitelisted repositories can be used
- Namespace isolation between production and staging
- Resource access is limited to necessary permissions
