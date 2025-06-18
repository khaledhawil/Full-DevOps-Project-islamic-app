# Jenkins Pipeline Documentation

## Overview
Complete Jenkins CI/CD pipeline for the Islamic App project with automated building, testing, security scanning, and deployment to Kubernetes.

## Pipeline Configuration

### Environment Variables
```groovy
DOCKER_REGISTRY = 'khaledhawil'
PROJECT_NAME = 'islamic-app'
FRONTEND_IMAGE = "${DOCKER_REGISTRY}/${PROJECT_NAME}_frontend"
BACKEND_IMAGE = "${DOCKER_REGISTRY}/${PROJECT_NAME}_backend"
DISCORD_WEBHOOK = credentials('discord')
DOCKER_CREDENTIALS = credentials('dockerhub')
GIT_CREDENTIALS = credentials('github')
TRIVY_VERSION = '0.48.0'
```

### Build Parameters
- **BUILD_TYPE**: Choice parameter
  - `auto`: Automatic change detection
  - `frontend-only`: Build only frontend
  - `backend-only`: Build only backend
  - `both`: Build both services

### Pipeline Options
- **Build Discarder**: Keep 10 builds, 7 days retention
- **Skip Default Checkout**: Manual SCM control
- **Disable Concurrent Builds**: Prevent API conflicts

## Pipeline Stages

### 1. Checkout Stage
```groovy
stage('Checkout') {
    steps {
        script {
            checkout scm
            env.GIT_COMMIT = sh(
                script: 'git rev-parse HEAD',
                returnStdout: true
            ).trim()
            env.BUILD_TAG = "${BUILD_NUMBER}-${GIT_COMMIT[0..6]}"
        }
    }
}
```
**Purpose**: Retrieve source code and set build identifiers

### 2. Change Detection Stage
```groovy
stage('Detect Changes') {
    when { 
        expression { params.BUILD_TYPE == 'auto' }
    }
    steps {
        script {
            // Git diff logic for frontend/backend changes
            def frontendChanged = checkChanges('frontend/')
            def backendChanged = checkChanges('backend/')
            
            env.BUILD_FRONTEND = frontendChanged.toString()
            env.BUILD_BACKEND = backendChanged.toString()
        }
    }
}
```
**Purpose**: Determine which components changed to optimize builds

### 3. Build Frontend Stage
```groovy
stage('Build Frontend') {
    when {
        anyOf {
            expression { params.BUILD_TYPE == 'frontend-only' }
            expression { params.BUILD_TYPE == 'both' }
            expression { env.BUILD_FRONTEND == 'true' }
        }
    }
    steps {
        script {
            dir('frontend') {
                sh """
                docker build \
                    --build-arg BUILD_DATE=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                    --build-arg VCS_REF=${GIT_COMMIT} \
                    -t ${FRONTEND_IMAGE}:${BUILD_TAG} \
                    -t ${FRONTEND_IMAGE}:latest .
                """
            }
        }
    }
}
```
**Purpose**: Build optimized frontend Docker image

### 4. Build Backend Stage
```groovy
stage('Build Backend') {
    when {
        anyOf {
            expression { params.BUILD_TYPE == 'backend-only' }
            expression { params.BUILD_TYPE == 'both' }
            expression { env.BUILD_BACKEND == 'true' }
        }
    }
    steps {
        script {
            dir('backend') {
                sh """
                docker build \
                    --build-arg BUILD_DATE=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                    --build-arg VCS_REF=${GIT_COMMIT} \
                    -t ${BACKEND_IMAGE}:${BUILD_TAG} \
                    -t ${BACKEND_IMAGE}:latest .
                """
            }
        }
    }
}
```
**Purpose**: Build optimized backend Docker image

### 5. Security Scanning Stage
```groovy
stage('Security Scan') {
    parallel {
        stage('Scan Frontend') {
            when { expression { env.BUILD_FRONTEND == 'true' } }
            steps {
                script {
                    sh """
                    trivy image --exit-code 0 --severity HIGH,CRITICAL \
                        --format json --output frontend-scan.json \
                        ${FRONTEND_IMAGE}:${BUILD_TAG}
                    """
                    
                    archiveArtifacts artifacts: 'frontend-scan.json'
                }
            }
        }
        stage('Scan Backend') {
            when { expression { env.BUILD_BACKEND == 'true' } }
            steps {
                script {
                    sh """
                    trivy image --exit-code 0 --severity HIGH,CRITICAL \
                        --format json --output backend-scan.json \
                        ${BACKEND_IMAGE}:${BUILD_TAG}
                    """
                    
                    archiveArtifacts artifacts: 'backend-scan.json'
                }
            }
        }
    }
}
```
**Purpose**: Security vulnerability scanning with Trivy

### 6. Push Images Stage
```groovy
stage('Push Images') {
    steps {
        script {
            docker.withRegistry('', 'dockerhub') {
                if (env.BUILD_FRONTEND == 'true') {
                    sh "docker push ${FRONTEND_IMAGE}:${BUILD_TAG}"
                    sh "docker push ${FRONTEND_IMAGE}:latest"
                }
                if (env.BUILD_BACKEND == 'true') {
                    sh "docker push ${BACKEND_IMAGE}:${BUILD_TAG}"
                    sh "docker push ${BACKEND_IMAGE}:latest"
                }
            }
        }
    }
}
```
**Purpose**: Push built images to Docker registry

### 7. Deploy to Kubernetes Stage
```groovy
stage('Deploy to Kubernetes') {
    steps {
        script {
            withKubeConfig([credentialsId: 'kubeconfig']) {
                // Update image tags in Kubernetes manifests
                sh """
                cd k8s
                sed -i 's|image: .*frontend.*|image: ${FRONTEND_IMAGE}:${BUILD_TAG}|g' 05-frontend.yaml
                sed -i 's|image: .*backend.*|image: ${BACKEND_IMAGE}:${BUILD_TAG}|g' 04-backend.yaml
                
                kubectl apply -f .
                kubectl rollout status deployment/frontend -n islamic-app
                kubectl rollout status deployment/backend -n islamic-app
                """
            }
        }
    }
}
```
**Purpose**: Deploy updated images to Kubernetes cluster

### 8. Notification Stage
```groovy
stage('Notify') {
    always {
        script {
            def status = currentBuild.result ?: 'SUCCESS'
            def color = status == 'SUCCESS' ? '3066993' : '15158332'
            
            def payload = [
                embeds: [[
                    title: "Islamic App Build ${status}",
                    description: "Build #${BUILD_NUMBER}",
                    color: color.toInteger(),
                    fields: [
                        [name: "Branch", value: env.BRANCH_NAME, inline: true],
                        [name: "Commit", value: env.GIT_COMMIT[0..6], inline: true],
                        [name: "Duration", value: "${currentBuild.durationString}", inline: true]
                    ]
                ]]
            ]
            
            httpRequest(
                httpMode: 'POST',
                url: env.DISCORD_WEBHOOK,
                contentType: 'APPLICATION_JSON',
                requestBody: groovy.json.JsonBuilder(payload).toString()
            )
        }
    }
}
```
**Purpose**: Send build notifications to Discord

## Required Jenkins Plugins
- Docker Pipeline
- Kubernetes CLI
- HTTP Request
- Pipeline Stage View
- Build Timeout
- Timestamper
- Workspace Cleanup

## Required Credentials
- `dockerhub`: Docker Hub login credentials
- `github`: GitHub access token
- `discord`: Discord webhook URL
- `kubeconfig`: Kubernetes cluster configuration

## Pipeline Optimization Features

### Change Detection
- Compares current commit with previous successful build
- Only builds changed components
- Reduces build time and resource usage

### Parallel Execution
- Security scanning runs in parallel
- Frontend and backend builds can run simultaneously
- Improves overall pipeline performance

### Build Caching
- Docker layer caching
- Dependency caching for npm and pip
- Reduces subsequent build times

### Error Handling
- Graceful failure handling
- Automatic cleanup on failure
- Detailed error reporting

## Monitoring and Maintenance

### Build Metrics
- Build duration tracking
- Success/failure rates
- Resource utilization

### Cleanup
- Automatic artifact cleanup
- Old image removal
- Workspace cleanup after builds

### Scaling
- Support for multiple build agents
- Queue management
- Resource allocation

## Usage Examples

### Trigger Specific Build
```bash
# Frontend only
curl -X POST "http://jenkins-url/job/islamic-app/buildWithParameters?BUILD_TYPE=frontend-only"

# Backend only  
curl -X POST "http://jenkins-url/job/islamic-app/buildWithParameters?BUILD_TYPE=backend-only"

# Both components
curl -X POST "http://jenkins-url/job/islamic-app/buildWithParameters?BUILD_TYPE=both"
```

### Manual Deployment
```bash
# Deploy specific version
kubectl set image deployment/frontend frontend=${FRONTEND_IMAGE}:${BUILD_TAG} -n islamic-app
kubectl set image deployment/backend backend=${BACKEND_IMAGE}:${BUILD_TAG} -n islamic-app
```

## Troubleshooting

### Common Issues
1. **Docker build failures**: Check Dockerfile syntax and base images
2. **Registry push failures**: Verify credentials and network connectivity  
3. **Kubernetes deployment failures**: Check cluster connectivity and permissions
4. **Security scan failures**: Review vulnerability reports and update dependencies

### Debug Commands
```bash
# Check pipeline logs
kubectl logs -f jenkins-pod -n jenkins

# Verify images
docker images | grep islamic-app

# Check deployments
kubectl get deployments -n islamic-app
kubectl describe deployment frontend -n islamic-app
```
