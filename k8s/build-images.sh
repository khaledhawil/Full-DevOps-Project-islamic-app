#!/bin/bash

set -e

echo "🔨 Building Docker Images for Islamic App"
echo "========================================="

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "📁 Project root: $PROJECT_ROOT"

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

# Build backend image
echo ""
echo "🏗️  Building backend image..."
cd "$PROJECT_ROOT/backend"
docker build -t islamic-app-backend:latest . --no-cache
echo "✅ Backend image built: islamic-app-backend:latest"

# Build frontend image
echo ""
echo "🏗️  Building frontend image..."
cd "$PROJECT_ROOT/frontend"

# Make sure we have package.json and install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

docker build -t islamic-app-frontend:latest . --no-cache
echo "✅ Frontend image built: islamic-app-frontend:latest"

echo ""
echo "🎉 All Docker images built successfully!"
echo ""
echo "📋 Built images:"
docker images | grep islamic-app

echo ""
echo "🚀 Ready to deploy! Run: ./deploy.sh"
