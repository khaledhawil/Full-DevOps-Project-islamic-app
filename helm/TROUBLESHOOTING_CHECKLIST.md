# Helm Deployment Troubleshooting Checklist

## Pre-Deployment Checklist

### Prerequisites Verification
- [ ] Kubernetes cluster is running and accessible
- [ ] kubectl is configured and can access the cluster
- [ ] Helm 3.x is installed and working
- [ ] Ingress controller is installed (NGINX recommended)
- [ ] Storage provisioner is available in the cluster
- [ ] Required RBAC permissions are granted

### Cluster Readiness
```bash
# Verify cluster connectivity
kubectl cluster-info

# Check node status
kubectl get nodes

# Verify ingress controller
kubectl get pods -n ingress-nginx

# Check storage classes
kubectl get storageclass

# Verify RBAC
kubectl auth can-i create deployments --namespace islamic-app
```

## Deployment Issues

### Helm Chart Problems

#### Chart Validation Errors
- [ ] Run `helm lint ./helm/islamic-app`
- [ ] Check Chart.yaml syntax
- [ ] Verify template syntax with `helm template islamic-app ./helm/islamic-app`
- [ ] Validate values.yaml structure

#### Template Rendering Issues
```bash
# Debug template rendering
helm template islamic-app ./helm/islamic-app --debug

# Check specific template
helm template islamic-app ./helm/islamic-app --show-only templates/deployment-backend.yaml

# Validate with custom values
helm template islamic-app ./helm/islamic-app -f values-kind.yaml --debug
```

#### Release Installation Failures
- [ ] Check namespace exists or use `--create-namespace`
- [ ] Verify release name is unique
- [ ] Check for sufficient cluster resources
- [ ] Validate image availability

```bash
# Check release status
helm status islamic-app -n islamic-app

# Get release history
helm history islamic-app -n islamic-app

# Debug installation
helm install islamic-app ./helm/islamic-app --dry-run --debug -n islamic-app
```

### Pod Startup Issues

#### Pod Status Problems
```bash
# Check pod status
kubectl get pods -n islamic-app

# Common statuses to investigate:
# - Pending: Resource constraints or scheduling issues
# - CrashLoopBackOff: Application startup failures
# - ImagePullBackOff: Image pull failures
# - Error: Pod execution failures
```

#### Backend Pod Issues
- [ ] Verify database connectivity
- [ ] Check environment variables
- [ ] Validate image tag exists
- [ ] Review resource limits
- [ ] Check application logs

```bash
# Backend pod diagnostics
kubectl logs -f deployment/islamic-app-backend -n islamic-app
kubectl describe pod -l app.kubernetes.io/component=backend -n islamic-app

# Test database connection
kubectl exec -n islamic-app deployment/islamic-app-backend -- \
  python -c "import psycopg2, os; conn = psycopg2.connect(os.environ['DATABASE_URL']); print('Connected'); conn.close()"
```

#### Frontend Pod Issues
- [ ] Check image availability
- [ ] Verify port configuration
- [ ] Review nginx configuration
- [ ] Check build artifacts

```bash
# Frontend pod diagnostics
kubectl logs -f deployment/islamic-app-frontend -n islamic-app
kubectl describe pod -l app.kubernetes.io/component=frontend -n islamic-app

# Test frontend service
kubectl exec -n islamic-app deployment/islamic-app-frontend -- curl localhost:3000
```

#### Database Pod Issues
- [ ] Check persistent volume claims
- [ ] Verify storage class
- [ ] Review PostgreSQL logs
- [ ] Validate initialization scripts

```bash
# Database pod diagnostics
kubectl logs -f deployment/postgres -n islamic-app
kubectl describe pod -l app.kubernetes.io/component=database -n islamic-app

# Check PVC status
kubectl get pvc -n islamic-app
kubectl describe pvc postgres-pvc -n islamic-app
```

### Network and Connectivity Issues

#### Service Discovery Problems
- [ ] Verify service definitions
- [ ] Check service endpoints
- [ ] Test internal connectivity
- [ ] Validate port configurations

```bash
# Service diagnostics
kubectl get svc -n islamic-app
kubectl describe svc islamic-app-backend -n islamic-app

# Test service connectivity
kubectl exec -n islamic-app deployment/islamic-app-frontend -- curl islamic-app-backend:5000/health
```

#### Ingress Issues
- [ ] Verify ingress controller is running
- [ ] Check ingress resource configuration
- [ ] Validate DNS resolution
- [ ] Test external connectivity

```bash
# Ingress diagnostics
kubectl get ingress -n islamic-app
kubectl describe ingress -n islamic-app

# Check ingress controller
kubectl get pods -n ingress-nginx
kubectl logs -f deployment/ingress-nginx-controller -n ingress-nginx

# Test ingress
curl -H "Host: islamic-app.local" http://<cluster-ip>
```

## Application-Specific Issues

### Authentication and Database Issues

#### Registration/Login Failures
- [ ] Verify database connectivity from backend
- [ ] Check database schema initialization
- [ ] Validate user table structure
- [ ] Review authentication endpoints

```bash
# Database connectivity test
kubectl exec -n islamic-app deployment/islamic-app-backend -- \
  psql $DATABASE_URL -c "SELECT version();"

# Check user table
kubectl exec -n islamic-app deployment/islamic-app-backend -- \
  psql $DATABASE_URL -c "\\dt" -c "SELECT * FROM users LIMIT 1;"

# Test authentication endpoint
kubectl exec -n islamic-app deployment/islamic-app-backend -- \
  curl -X POST localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123"}'
```

#### Database Migration Issues
- [ ] Check migration scripts execution
- [ ] Verify database schema version
- [ ] Review migration logs
- [ ] Validate table structures

```bash
# Check database tables
kubectl exec -n islamic-app deployment/postgres -- \
  psql -U postgres -d islamic_app -c "\\dt"

# Run manual migration if needed
kubectl exec -n islamic-app deployment/postgres -- \
  psql -U postgres -d islamic_app -f /path/to/migration.sql
```

### Performance Issues

#### Resource Constraints
- [ ] Check CPU and memory usage
- [ ] Review resource limits and requests
- [ ] Monitor pod restarts
- [ ] Validate HPA configuration

```bash
# Resource usage
kubectl top pods -n islamic-app
kubectl top nodes

# HPA status
kubectl get hpa -n islamic-app
kubectl describe hpa -n islamic-app

# Check resource limits
kubectl describe pod -l app=islamic-app -n islamic-app | grep -A 5 "Limits:"
```

#### Scaling Issues
- [ ] Verify HPA is functioning
- [ ] Check metrics server
- [ ] Review scaling policies
- [ ] Monitor load distribution

```bash
# Metrics server
kubectl get pods -n kube-system | grep metrics-server

# Manual scaling test
kubectl scale deployment islamic-app-backend --replicas=3 -n islamic-app
```

## Environment-Specific Issues

### Kind (Local) Issues
- [ ] Verify Kind cluster is running
- [ ] Check port forwarding setup
- [ ] Validate local storage
- [ ] Test hostfile configuration

```bash
# Kind cluster status
kind get clusters
kubectl cluster-info --context kind-islamic-app

# Port forwarding
kubectl port-forward svc/islamic-app-frontend 3000:3000 -n islamic-app &
```

### Cloud Provider Issues

#### AWS EKS
- [ ] Verify AWS Load Balancer Controller
- [ ] Check IAM permissions
- [ ] Validate security groups
- [ ] Review ACM certificate

```bash
# ALB controller status
kubectl get pods -n kube-system | grep aws-load-balancer

# Check service annotations
kubectl get svc -n islamic-app -o yaml | grep annotation
```

#### Google GKE
- [ ] Verify GCE ingress controller
- [ ] Check managed certificates
- [ ] Validate firewall rules
- [ ] Review static IP configuration

```bash
# Check managed certificate
kubectl get managedcertificate -n islamic-app

# Verify static IP
gcloud compute addresses list
```

#### Azure AKS
- [ ] Verify NGINX ingress controller
- [ ] Check Azure Load Balancer
- [ ] Validate network security groups
- [ ] Review Azure DNS configuration

## Recovery Procedures

### Rollback Procedures
```bash
# Helm rollback
helm rollback islamic-app -n islamic-app

# Rollback to specific revision
helm rollback islamic-app 1 -n islamic-app

# Check rollback status
helm history islamic-app -n islamic-app
```

### Clean Reinstall
```bash
# Complete uninstall
helm uninstall islamic-app -n islamic-app
kubectl delete namespace islamic-app

# Wait for cleanup
kubectl get namespace islamic-app

# Fresh installation
./helm-deploy.sh -e <environment>
```

### Data Recovery
```bash
# Backup database before recovery
kubectl exec -n islamic-app deployment/postgres -- \
  pg_dump -U postgres islamic_app > backup.sql

# Restore from backup
kubectl exec -i -n islamic-app deployment/postgres -- \
  psql -U postgres islamic_app < backup.sql
```

## Validation Steps

### Post-Deployment Validation
```bash
# Check all resources are running
kubectl get all -n islamic-app

# Verify pod readiness
kubectl wait --for=condition=ready pod --all -n islamic-app --timeout=300s

# Test application endpoints
curl -f http://islamic-app.local/api/health
curl -f http://islamic-app.local

# Check ingress accessibility
curl -I -H "Host: islamic-app.local" http://<cluster-ip>
```

### Functional Testing
- [ ] Access frontend through ingress
- [ ] Test user registration
- [ ] Verify user login
- [ ] Check API endpoints
- [ ] Validate database persistence

## Prevention Strategies

### Best Practices
1. Always run `helm lint` before deployment
2. Use `--dry-run` for testing changes
3. Monitor resource usage regularly
4. Keep backups of critical data
5. Test in staging before production
6. Document custom configurations
7. Use version tags for images
8. Implement proper monitoring

### Monitoring Setup
```bash
# Basic monitoring with kubectl
watch kubectl get pods -n islamic-app

# Resource monitoring
kubectl top pods -n islamic-app --watch

# Log monitoring
kubectl logs -f deployment/islamic-app-backend -n islamic-app
```

This checklist helps systematically diagnose and resolve common issues with the Islamic App Helm deployment.
