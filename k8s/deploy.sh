#!/bin/bash

set -e

echo "🚀 Building and Deploying Islamic App to Local Kubernetes Cluster"
echo "================================================================="

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "📁 Project root: $PROJECT_ROOT"

# Build Docker images
echo ""
echo "🔨 Building Docker images..."

echo ""
echo "📁 Creating local storage directory..."
sudo mkdir -p /tmp/k8s-postgres-data
sudo chmod 777 /tmp/k8s-postgres-data

# Deploy to Kubernetes
echo ""
echo "☸️  Deploying to Kubernetes..."
cd "$PROJECT_ROOT/k8s"

# Apply all Kubernetes manifests in order
echo "Applying namespace..."
kubectl apply -f 00-namespace.yaml

echo "Applying secrets and configmaps..."
kubectl apply -f 01-secrets-configmap.yaml

echo "Applying persistent storage..."
kubectl apply -f 02-persistent-storage.yaml

echo "Waiting for persistent volume to be available..."
kubectl wait --for=condition=Available pv/postgres-pv --timeout=60s

echo "Deploying PostgreSQL..."
kubectl apply -f 03-postgres.yaml

echo "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n islamic-app --timeout=300s

echo "Deploying backend..."
kubectl apply -f 04-backend.yaml

echo "Waiting for backend to be ready..."
kubectl wait --for=condition=ready pod -l app=islamic-app-backend -n islamic-app --timeout=300s

echo "Deploying frontend..."
kubectl apply -f 05-frontend.yaml

echo "Waiting for frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=islamic-app-frontend -n islamic-app --timeout=300s

echo "Deploying nginx..."
kubectl apply -f 06-nginx.yaml

echo "Waiting for nginx to be ready..."
kubectl wait --for=condition=ready pod -l app=nginx -n islamic-app --timeout=300s

echo "Applying ingress..."
kubectl apply -f 07-ingress.yaml

echo "Applying HPA (optional)..."
kubectl apply -f 08-hpa.yaml

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   - Main app: http://localhost:8090"
echo "   - API health: http://localhost:8090/api/health"
echo ""
echo "📊 Check deployment status:"
echo "   kubectl get pods -n islamic-app"
echo "   kubectl get services -n islamic-app"
echo "   kubectl logs -f deployment/islamic-app-backend -n islamic-app"
echo ""
echo "🧹 To clean up deployment:"
echo "   ./cleanup.sh"
echo ""

# Show current status
echo "Current pod status:"
kubectl get pods -n islamic-app

echo ""
echo "Current service status:"
kubectl get services -n islamic-app
