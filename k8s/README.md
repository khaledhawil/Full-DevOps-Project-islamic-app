# Islamic App Kubernetes Deployment

This directory contains Kubernetes manifests and deployment scripts for the Islamic App.

## Quick Start

### Prerequisites
- Docker installed and running
- Kubernetes cluster running (Docker Desktop, minikube, etc.)
- kubectl configured to connect to your cluster

### Deploy the Application

1. **Build and Deploy Everything (Recommended for first deployment):**
   ```bash
   ./deploy.sh
   ```

2. **Build Docker Images Only:**
   ```bash
   ./build-images.sh
   ```

3. **Deploy to Kubernetes Only (if images already built):**
   ```bash
   ./deploy-only.sh
   ```

4. **Clean Up Deployment:**
   ```bash
   ./cleanup.sh
   ```

## Access the Application

Once deployed, the application will be available at:
- **Main Application:** http://localhost:8090
- **API Health Check:** http://localhost:8090/api/health

## Kubernetes Files Overview

| File | Description |
|------|-------------|
| `00-namespace.yaml` | Creates the islamic-app namespace |
| `01-secrets-configmap.yaml` | Secrets and configuration |
| `02-persistent-storage.yaml` | Persistent volume for PostgreSQL |
| `03-postgres.yaml` | PostgreSQL database deployment |
| `04-backend.yaml` | Flask backend API deployment |
| `05-frontend.yaml` | React frontend deployment |
| `06-nginx.yaml` | Nginx reverse proxy |
| `07-ingress.yaml` | Ingress configuration |
| `08-hpa.yaml` | Horizontal Pod Autoscaler |

## Architecture

```
Internet/localhost:8090
         ↓
    Nginx LoadBalancer
         ↓
   ┌─────────────────┐
   │                 │
   ▼                 ▼
Frontend:3000    Backend:5000
   │                 │
   └─────────────────┼───→ PostgreSQL:5432
                     │
                     └───→ External APIs
```

## Environment Variables

The deployment uses the following configuration:

### Database
- **Database:** islamic_app
- **User:** islamic_user  
- **Password:** islamic_pass123 (change in production)

### Backend
- **Port:** 5000
- **Environment:** production
- **CORS:** Configured for frontend

### Frontend
- **Port:** 3000
- **API URL:** http://localhost:8090/api

## Troubleshooting

### Check Pod Status
```bash
kubectl get pods -n islamic-app
```

### Check Service Status
```bash
kubectl get services -n islamic-app
```

### View Logs
```bash
# Backend logs
kubectl logs -f deployment/islamic-app-backend -n islamic-app

# Frontend logs
kubectl logs -f deployment/islamic-app-frontend -n islamic-app

# PostgreSQL logs
kubectl logs -f deployment/postgres -n islamic-app

# Nginx logs
kubectl logs -f deployment/nginx -n islamic-app
```

### Port Forward for Direct Access
```bash
# Backend API directly
kubectl port-forward service/islamic-app-backend 5000:5000 -n islamic-app

# Frontend directly
kubectl port-forward service/islamic-app-frontend 3000:3000 -n islamic-app

# PostgreSQL directly
kubectl port-forward service/postgres 5432:5432 -n islamic-app
```

### Restart Deployments
```bash
kubectl rollout restart deployment/islamic-app-backend -n islamic-app
kubectl rollout restart deployment/islamic-app-frontend -n islamic-app
```

### Scale Deployments
```bash
kubectl scale deployment islamic-app-backend --replicas=3 -n islamic-app
kubectl scale deployment islamic-app-frontend --replicas=2 -n islamic-app
```

## Local Storage

PostgreSQL data is stored in `/tmp/k8s-postgres-data` on your local machine. This directory is automatically created during deployment.

## Security Notes

⚠️ **Important:** This configuration is for local development only. For production:

1. Change all default passwords
2. Use proper secrets management
3. Configure TLS/SSL
4. Set up proper ingress with authentication
5. Configure network policies
6. Use non-root containers
7. Set resource limits appropriately

## Monitoring

The deployment includes:
- Health checks for all services
- Resource limits and requests
- Horizontal Pod Autoscaler (HPA)
- Readiness and liveness probes

Monitor with:
```bash
# Watch pods
kubectl get pods -n islamic-app -w

# Check HPA status
kubectl get hpa -n islamic-app

# Top resource usage
kubectl top pods -n islamic-app
```
