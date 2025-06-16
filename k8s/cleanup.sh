#!/bin/bash

echo "🧹 Cleaning up Islamic App Kubernetes Deployment"
echo "================================================"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

echo "Deleting all resources in islamic-app namespace..."

# Delete all resources in the namespace
kubectl delete all --all -n islamic-app 2>/dev/null || true

# Delete persistent volume claims
kubectl delete pvc --all -n islamic-app 2>/dev/null || true

# Delete persistent volumes
kubectl delete pv postgres-pv 2>/dev/null || true

# Delete configmaps and secrets
kubectl delete configmaps --all -n islamic-app 2>/dev/null || true
kubectl delete secrets --all -n islamic-app 2>/dev/null || true

# Delete ingress
kubectl delete ingress --all -n islamic-app 2>/dev/null || true

# Delete HPA
kubectl delete hpa --all -n islamic-app 2>/dev/null || true

# Finally delete the namespace
kubectl delete namespace islamic-app 2>/dev/null || true

# Clean up local storage
echo "Cleaning up local storage..."
sudo rm -rf /tmp/k8s-postgres-data 2>/dev/null || true

echo ""
echo "✅ Cleanup completed!"
echo ""
echo "🔍 Verify cleanup:"
echo "   kubectl get namespaces | grep islamic-app"
echo "   kubectl get pv | grep postgres"
echo ""
echo "🚀 To redeploy: ./deploy.sh"
