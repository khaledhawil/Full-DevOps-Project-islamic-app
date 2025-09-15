# Islamic App Helm Chart

This Helm chart deploys the Islamic App, a comprehensive Islamic application with prayer times, Quran, Hadith, Tasbeh, and more features.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- PV provisioner support in the underlying infrastructure (for PostgreSQL persistence)

## Installing the Chart

To install the chart with the release name `islamic-app`:

```bash
# Using the deployment script (recommended)
./helm-deploy.sh

# Or manually with helm
helm install islamic-app ./helm/islamic-app --namespace islamic-app --create-namespace
```

## Uninstalling the Chart

To uninstall/delete the `islamic-app` deployment:

```bash
# Using the deployment script
./helm-deploy.sh --uninstall

# Or manually with helm
helm uninstall islamic-app --namespace islamic-app
kubectl delete namespace islamic-app
```

## Configuration

The following table lists the configurable parameters of the Islamic App chart and their default values.

### Global Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `nameOverride` | String to partially override islamic-app.fullname | `""` |
| `fullnameOverride` | String to fully override islamic-app.fullname | `""` |
| `namespace.create` | Create namespace | `true` |
| `namespace.name` | Namespace name | `islamic-app` |

### Image Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `image.backend.repository` | Backend image repository | `khaledhawil/islamic-app_backend` |
| `image.backend.tag` | Backend image tag | `36-18b4564` |
| `image.backend.pullPolicy` | Backend image pull policy | `IfNotPresent` |
| `image.frontend.repository` | Frontend image repository | `khaledhawil/islamic-app_frontend` |
| `image.frontend.tag` | Frontend image tag | `36-18b4564` |
| `image.frontend.pullPolicy` | Frontend image pull policy | `IfNotPresent` |
| `image.postgres.repository` | PostgreSQL image repository | `postgres` |
| `image.postgres.tag` | PostgreSQL image tag | `15-alpine` |
| `image.postgres.pullPolicy` | PostgreSQL image pull policy | `IfNotPresent` |

### Replica Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount.backend` | Number of backend replicas | `1` |
| `replicaCount.frontend` | Number of frontend replicas | `1` |

### Service Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `service.backend.type` | Backend service type | `ClusterIP` |
| `service.backend.port` | Backend service port | `5000` |
| `service.frontend.type` | Frontend service type | `ClusterIP` |
| `service.frontend.port` | Frontend service port | `3000` |
| `service.postgres.type` | PostgreSQL service type | `ClusterIP` |
| `service.postgres.port` | PostgreSQL service port | `5432` |

### Ingress Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class name | `""` |
| `ingress.annotations` | Ingress annotations | `nginx.ingress.kubernetes.io/rewrite-target: /` |
| `ingress.hosts[0].host` | Hostname for the ingress | `islamic-app.local` |
| `ingress.hosts[0].paths` | Paths configuration | See values.yaml |
| `ingress.tls` | TLS configuration | `[]` |

### Resources Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `resources.backend.limits.cpu` | Backend CPU limit | `500m` |
| `resources.backend.limits.memory` | Backend memory limit | `512Mi` |
| `resources.backend.requests.cpu` | Backend CPU request | `250m` |
| `resources.backend.requests.memory` | Backend memory request | `256Mi` |
| `resources.frontend.limits.cpu` | Frontend CPU limit | `500m` |
| `resources.frontend.limits.memory` | Frontend memory limit | `512Mi` |
| `resources.frontend.requests.cpu` | Frontend CPU request | `250m` |
| `resources.frontend.requests.memory` | Frontend memory request | `256Mi` |

### Autoscaling Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `autoscaling.enabled` | Enable HPA | `true` |
| `autoscaling.minReplicas` | Minimum number of replicas | `1` |
| `autoscaling.maxReplicas` | Maximum number of replicas | `5` |
| `autoscaling.targetCPUUtilizationPercentage` | Target CPU utilization | `80` |
| `autoscaling.targetMemoryUtilizationPercentage` | Target memory utilization | `80` |

### PostgreSQL Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `postgresql.enabled` | Deploy PostgreSQL | `true` |
| `postgresql.auth.postgresUser` | PostgreSQL username | `islamic_user` |
| `postgresql.auth.postgresPassword` | PostgreSQL password | `islamic_pass123` |
| `postgresql.auth.postgresDatabase` | PostgreSQL database name | `islamic_app` |

### Persistence Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `persistence.enabled` | Enable persistence | `true` |
| `persistence.storageClass` | Storage class | `""` |
| `persistence.accessMode` | Access mode | `ReadWriteOnce` |
| `persistence.size` | Storage size | `5Gi` |

### Application Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `app.config.flaskEnv` | Flask environment | `production` |
| `app.config.corsOrigins` | CORS origins | See values.yaml |
| `app.config.reactAppApiUrl` | React API URL | `/api` |
| `app.config.nodeEnv` | Node environment | `production` |
| `app.secrets.secretKey` | Flask secret key | `your-super-secret-key-change-in-production` |
| `app.secrets.jwtSecretKey` | JWT secret key | `your-jwt-secret-key-change-in-production` |

## Custom Values File

You can create a custom values file to override the default configuration:

```yaml
# custom-values.yaml
replicaCount:
  backend: 2
  frontend: 3

image:
  backend:
    tag: "latest"
  frontend:
    tag: "latest"

ingress:
  hosts:
    - host: my-islamic-app.example.com
      paths:
        - path: /
          pathType: Prefix
          service: frontend
        - path: /api
          pathType: Prefix
          service: backend

app:
  secrets:
    secretKey: "my-super-secret-production-key"
    jwtSecretKey: "my-jwt-secret-production-key"
```

Then deploy with:

```bash
./helm-deploy.sh -v custom-values.yaml
```

## Development Environment

For development, you can use port-forwarding to access the application:

```bash
# Forward frontend
kubectl port-forward -n islamic-app svc/islamic-app-frontend 3000:3000

# Forward backend
kubectl port-forward -n islamic-app svc/islamic-app-backend 5000:5000

# Forward PostgreSQL
kubectl port-forward -n islamic-app svc/islamic-app-postgresql 5432:5432
```

## Monitoring

Check the status of your deployment:

```bash
# Using the deployment script
./helm-deploy.sh --status

# Or manually
kubectl get pods -n islamic-app
kubectl get services -n islamic-app
kubectl get ingress -n islamic-app
```

## Troubleshooting

### Common Issues

1. **Pods stuck in Pending state**: Check if you have sufficient resources and PV provisioner
2. **Database connection issues**: Verify PostgreSQL is running and credentials are correct
3. **Ingress not working**: Ensure you have an ingress controller installed

### Debug Commands

```bash
# Check pod logs
kubectl logs -n islamic-app deployment/islamic-app-backend
kubectl logs -n islamic-app deployment/islamic-app-frontend
kubectl logs -n islamic-app deployment/islamic-app-postgresql

# Describe resources
kubectl describe pod -n islamic-app
kubectl describe service -n islamic-app
kubectl describe ingress -n islamic-app

# Check events
kubectl get events -n islamic-app --sort-by='.lastTimestamp'
```

## Security Considerations

1. **Change default passwords**: Update `postgresql.auth.postgresPassword` and application secrets
2. **Use TLS**: Configure TLS certificates for production
3. **RBAC**: Implement proper RBAC policies
4. **Network Policies**: Implement network policies to restrict traffic

## Backup and Recovery

### Database Backup

```bash
# Create a backup
kubectl exec -n islamic-app deployment/islamic-app-postgresql -- pg_dump -U islamic_user islamic_app > backup.sql

# Restore from backup
kubectl exec -i -n islamic-app deployment/islamic-app-postgresql -- psql -U islamic_user islamic_app < backup.sql
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `helm lint ./helm/islamic-app`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
