#!/bin/bash

echo "🚀 Quick Deploy Islamic App (images only)"
echo "========================================="

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT/k8s"

echo "☸️  Deploying to Kubernetes..."

# Apply all manifests
kubectl apply -f .

echo ""
echo "⏳ Waiting for pods to be ready..."

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
kubectl wait --for=condition=ready pod -l app=postgres -n islamic-app --timeout=300s

# Wait for backend
echo "Waiting for backend..."
kubectl wait --for=condition=ready pod -l app=islamic-app-backend -n islamic-app --timeout=300s

# Wait for frontend
echo "Waiting for frontend..."
kubectl wait --for=condition=ready pod -l app=islamic-app-frontend -n islamic-app --timeout=300s

# Wait for nginx
echo "Waiting for nginx..."
kubectl wait --for=condition=ready pod -l app=nginx -n islamic-app --timeout=300s

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🌐 Application available at: http://localhost:8090"
echo ""

# Show status
kubectl get pods -n islamic-app
