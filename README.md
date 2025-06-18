# Islamic App - Fullstack with DevOps 

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://jenkins.yourdomain.com)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://hub.docker.com/u/khaledhawil)
[![Kubernetes](https://img.shields.io/badge/kubernetes-deployed-blue)](https://k8s.io)
[![ArgoCD](https://img.shields.io/badge/gitops-argocd-orange)](https://argoproj.github.io/cd/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> **A production-ready Islamic application demonstrating enterprise-level DevOps practices with full CI/CD automation, containerization, and GitOps deployment.**

This comprehensive Islamic application serves the Muslim community with essential digital tools for daily Islamic practices while showcasing modern DevOps methodologies including Infrastructure as Code, continuous integration, automated security scanning, and GitOps-based deployments.

## 🎯 Project Overview

The Islamic App is a full-stack web application that combines traditional Islamic resources with cutting-edge technology to provide an accessible platform for worship, learning, and spiritual growth. Built with modern architecture principles and enterprise DevOps practices, this project serves as both a functional application and a demonstration of professional software development and deployment practices.

### Key Objectives
- **Digital Islamic Tools**: Prayer times, Quran reader, Hadith collections, digital Tasbeh
- **DevOps Excellence**: Complete CI/CD pipeline with automated testing and deployment
- **Scalability**: Kubernetes-native architecture with auto-scaling capabilities
- **Security**: Integrated security scanning and best practices
- **Maintainability**: Comprehensive documentation and monitoring

## 📚 Documentation Hub

This project includes extensive documentation for all components:

| Component | Documentation | Description |
|-----------|---------------|-------------|
| **Overview** | [`DEVOPS_GUIDE.md`](DEVOPS_GUIDE.md) | Complete DevOps architecture and workflows |
| **File Reference** | [`FILE_INDEX.md`](FILE_INDEX.md) | Comprehensive file-by-file documentation |
| **Frontend** | [`frontend/BUILD.md`](frontend/BUILD.md) | React TypeScript build instructions |
| **Backend** | [`backend/BUILD.md`](backend/BUILD.md) | Flask API build and deployment |
| **Database** | [`database/DATABASE.md`](database/DATABASE.md) | PostgreSQL setup and management |
| **Docker** | [`docker-compose.md`](docker-compose.md) | Container orchestration guide |
| **Jenkins** | [`Jenkinsfile.md`](Jenkinsfile.md) | CI/CD pipeline documentation |
| **Kubernetes** | [`k8s/k8s-documentation.md`](k8s/k8s-documentation.md) | Container orchestration |
| **ArgoCD** | [`argocd/argocd-documentation.md`](argocd/argocd-documentation.md) | GitOps deployment |
| **Nginx** | [`nginx/nginx-documentation.md`](nginx/nginx-documentation.md) | Load balancer configuration |
| **Scripts** | [`k8s/SCRIPTS.md`](k8s/SCRIPTS.md) | Deployment automation scripts |

## ✨ Application Features

### 🕌 Islamic Features
- **📿 Digital Tasbeh Counter**: Advanced counter with achievement system and progress tracking
- **📖 Quran Reader**: Complete Quran with Arabic text, translations, and search functionality
- **🎵 Quran Audio**: High-quality recitations with multiple reciters and playback controls
- **📚 Hadith Collection**: Searchable database with authentic hadiths from major collections
- **🕐 Prayer Times**: Location-based prayer time calculations with notifications
- **🤲 Azkar and Duas**: Collection of Islamic supplications and daily remembrances
- **👤 User Profiles**: Personal settings, preferences, and spiritual progress tracking
- **🌙 Islamic Calendar**: Hijri calendar integration with important Islamic dates

### 🎨 User Experience
- **🌗 Theme Support**: Dark/light mode with user preferences
- **📱 Responsive Design**: Mobile-first approach with cross-device compatibility
- **🔐 Secure Authentication**: JWT-based authentication with user management
- **⚡ Performance**: Optimized loading with lazy loading and caching
- **🌍 Internationalization**: Multi-language support for global Muslim community
- **♿ Accessibility**: WCAG compliant design for inclusive user experience

### 🔧 DevOps Infrastructure
- **🐳 Containerization**: Docker containers for all services with multi-stage builds
- **☸️ Orchestration**: Kubernetes deployment with auto-scaling and self-healing
- **🔄 CI/CD Pipeline**: Jenkins automated build, test, and deployment
- **📦 GitOps**: ArgoCD for continuous delivery and configuration management
- **⚖️ Load Balancing**: Nginx reverse proxy with SSL termination
- **🛢️ Database**: PostgreSQL with persistent storage and automated backups
- **🔍 Security Scanning**: Trivy vulnerability assessment in CI/CD pipeline
- **📊 Monitoring**: Application health checks and performance monitoring
- **📢 Notifications**: Discord webhook integration for build status updates

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser] --> B[React Frontend]
    end
    
    subgraph "Load Balancer"
        B --> C[Nginx Ingress]
    end
    
    subgraph "Application Layer"
        C --> D[Flask Backend API]
    end
    
    subgraph "Data Layer"
        D --> E[PostgreSQL Database]
    end
    
    subgraph "DevOps Pipeline"
        F[Git Repository] --> G[Jenkins CI/CD]
        G --> H[Docker Registry]
        H --> I[ArgoCD GitOps]
        I --> J[Kubernetes Cluster]
    end
    
    subgraph "External APIs"
        D --> K[Prayer Times API]
        D --> L[Quran API]
        D --> M[Hadith API]
    end
```

## 🛠️ Technology Stack
### 💻 Frontend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | Modern UI framework with hooks and concurrent features |
| **TypeScript** | 4.9.5 | Type-safe development with enhanced IDE support |
| **Material-UI** | 5.13.0 | Production-ready React components and design system |
| **React Router** | 6.18.0 | Declarative routing for single-page applications |
| **Zustand** | 4.4.6 | Lightweight state management without boilerplate |
| **Axios** | 1.5.2 | Promise-based HTTP client with interceptors |
| **Date-fns** | 2.30.0 | Modern JavaScript date utility library |

### 🔧 Backend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| **Flask** | 2.2+ | Lightweight and flexible Python web framework |
| **SQLAlchemy** | Latest | Python SQL toolkit and Object-Relational Mapping |
| **Flask-JWT-Extended** | Latest | JWT token authentication for Flask applications |
| **PostgreSQL** | 15 | Advanced open-source relational database |
| **Gunicorn** | Latest | Python WSGI HTTP Server for production |
| **Flask-CORS** | Latest | Cross-Origin Resource Sharing support |
| **Marshmallow** | Latest | Object serialization and validation |

### 🚀 DevOps & Infrastructure
| Tool | Purpose | Environment |
|------|---------|-------------|
| **Docker** | Containerization platform | All environments |
| **Docker Compose** | Multi-container orchestration | Development |
| **Kubernetes** | Container orchestration at scale | Production |
| **Jenkins** | Continuous Integration/Continuous Deployment | CI/CD Pipeline |
| **ArgoCD** | GitOps continuous delivery | Production |
| **Nginx** | Reverse proxy and load balancer | Production |
| **Trivy** | Vulnerability scanner for containers | Security |
| **PostgreSQL** | Primary database with persistence | All environments |

### 🔗 External Integrations
- **Islamic Prayer Times API**: Accurate prayer time calculations based on location
- **Quran API**: Complete Quran text with multiple translations
- **Hadith APIs**: Authentic hadith collections from major sources
- **Discord Webhooks**: Real-time build notifications and alerts

## 📂 Project Structure

```
islamic-app/
├── 📁 frontend/                     # React TypeScript Application
│   ├── 📁 src/
│   │   ├── 📁 components/          # Reusable UI components
│   │   ├── 📁 pages/               # Main application pages
│   │   ├── 📁 contexts/            # React context providers
│   │   ├── 📁 hooks/               # Custom React hooks
│   │   ├── 📁 services/            # API service layer
│   │   ├── 📁 stores/              # Zustand state management
│   │   └── 📁 utils/               # Utility functions
│   ├── 📄 BUILD.md                 # Frontend build documentation
│   ├── 📄 Dockerfile               # Frontend container definition
│   └── 📄 package.json             # Dependencies and scripts
├── 📁 backend/                      # Flask Python API
│   ├── 📁 models/                  # SQLAlchemy database models
│   ├── 📁 routes/                  # API endpoint handlers
│   ├── 📁 schemas/                 # Data validation schemas
│   ├── 📁 utils/                   # Backend utility functions
│   ├── 📄 BUILD.md                 # Backend build documentation
│   ├── 📄 app.py                   # Flask application entry point
│   ├── 📄 Dockerfile               # Backend container definition
│   └── 📄 requirements.txt         # Python dependencies
├── 📁 database/                     # Database Management
│   ├── 📄 DATABASE.md              # Database documentation
│   ├── 📄 init.sql                 # Initial schema creation
│   ├── 📄 migrate.sh               # Migration script
│   └── 📁 migrations/              # Version-controlled migrations
├── 📁 k8s/                         # Kubernetes Manifests
│   ├── 📄 k8s-documentation.md     # Kubernetes deployment guide
│   ├── 📄 SCRIPTS.md               # Deployment scripts documentation
│   ├── 📄 *.yaml                   # Kubernetes resource definitions
│   ├── 📄 build-images.sh          # Docker image build script
│   ├── 📄 deploy.sh                # Complete deployment automation
│   ├── 📄 deploy-only.sh           # Deploy without building
│   ├── 📄 setup.sh                 # Initial cluster setup
│   └── 📄 cleanup.sh               # Resource cleanup
├── 📁 argocd/                      # GitOps Configuration
│   ├── 📄 argocd-documentation.md  # ArgoCD setup and usage
│   ├── 📄 application.yaml         # Production application definition
│   ├── 📄 application-staging.yaml # Staging application definition
│   ├── 📄 project.yaml             # ArgoCD project configuration
│   └── 📄 deploy.sh                # ArgoCD deployment script
├── 📁 nginx/                       # Load Balancer Configuration
│   ├── 📄 nginx-documentation.md   # Nginx configuration guide
│   └── 📄 nginx.conf               # Nginx server configuration
├── 📄 docker-compose.yml           # Development environment
├── 📄 docker-compose.md            # Docker Compose documentation
├── 📄 Jenkinsfile                  # CI/CD Pipeline definition
├── 📄 Jenkinsfile.md               # Jenkins pipeline documentation
├── 📄 DEVOPS_GUIDE.md              # Master DevOps documentation
├── 📄 FILE_INDEX.md                # Complete file reference
└── 📄 README.md                    # This file
```

## 🚀 Quick Start Guide

### 📋 Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Node.js** | 16+ | Frontend development and build tools |
| **Python** | 3.8+ | Backend API development |
| **PostgreSQL** | 12+ | Database server |
| **Docker** | 20+ | Containerization |
| **Docker Compose** | 2.0+ | Multi-container orchestration |
| **kubectl** | Latest | Kubernetes CLI |
| **Git** | Latest | Version control |

**Optional for Production:**
- Kubernetes cluster (local: minikube/kind, cloud: EKS/GKE/AKS)
- Jenkins server for CI/CD
- ArgoCD for GitOps deployment

### ⚡ One-Command Setup

```bash
# Complete development environment
git clone <repository-url>
cd Full-DevOps-Project-islamic-app
docker-compose up -d
```

**🎉 Access your application:**
- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **Database**: localhost:5432

### 🔧 Manual Development Setup

<details>
<summary><strong>📱 Frontend Development</strong></summary>

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server with hot reload
npm start

# Build for production
npm run build

# Run tests
npm test
```

**Environment Configuration:**
```bash
# Create .env file in frontend/
echo "REACT_APP_API_URL=http://localhost:5000" > .env
echo "REACT_APP_ENVIRONMENT=development" >> .env
```
</details>

<details>
<summary><strong>🔧 Backend Development</strong></summary>

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://islamic_user:islamic_pass123@localhost:5432/islamic_app"
export SECRET_KEY="your-secret-key"
export JWT_SECRET_KEY="your-jwt-secret"

# Start development server
python app.py
```

**Production Deployment:**
```bash
# Use Gunicorn for production
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
```
</details>

<details>
<summary><strong>🗄️ Database Setup</strong></summary>

```bash
# Start PostgreSQL with Docker
docker run -d --name islamic-db \
  -e POSTGRES_DB=islamic_app \
  -e POSTGRES_USER=islamic_user \
  -e POSTGRES_PASSWORD=islamic_pass123 \
  -p 5432:5432 postgres:15-alpine

# Initialize database schema
psql -h localhost -U islamic_user -d islamic_app -f database/init.sql

# Run migrations
cd database && chmod +x migrate.sh && ./migrate.sh
```
</details>

## 🚢 Deployment Options

### 🐳 Docker Compose (Recommended for Development)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3

# Stop services
docker-compose down

# Clean rebuild
docker-compose down -v && docker-compose up --build -d
```

**Services included:**
- PostgreSQL database with persistent volume
- Flask backend API with auto-reload
- React frontend with hot reload
- Nginx load balancer
- Health checks and monitoring

### ☸️ Kubernetes (Production Ready)

```bash
# Quick deployment
cd k8s
./setup.sh && ./deploy.sh

# Manual step-by-step
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets-configmap.yaml
kubectl apply -f 02-persistent-storage.yaml
kubectl apply -f 03-postgres.yaml
kubectl apply -f 04-backend.yaml
kubectl apply -f 05-frontend.yaml
kubectl apply -f 06-nginx.yaml
kubectl apply -f 07-ingress.yaml
kubectl apply -f 08-hpa.yaml

# Verify deployment
kubectl get pods -n islamic-app
kubectl get services -n islamic-app
kubectl get ingress -n islamic-app
```

**Production Features:**
- Horizontal Pod Autoscaling (HPA)
- Persistent Volume Claims for database
- Ingress with SSL termination
- Resource limits and requests
- Health checks and readiness probes
- Rolling updates with zero downtime

### 🔄 GitOps with ArgoCD

```bash
# Deploy ArgoCD applications
cd argocd
./deploy.sh

# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Sync applications
argocd app sync islamic-app-prod
argocd app sync islamic-app-staging
```

**GitOps Benefits:**
- Declarative configuration management
- Automated drift detection and correction
- Git-based audit trail
- Multi-environment support
- Rollback capabilities

## 🔄 CI/CD Pipeline

### 🏗️ Jenkins Pipeline Features

The Jenkins pipeline (`Jenkinsfile`) provides enterprise-grade CI/CD automation:

**Pipeline Stages:**
1. **🔍 Checkout & Change Detection**: Smart detection of frontend/backend changes
2. **🔨 Build**: Multi-architecture Docker image builds
3. **🛡️ Security Scan**: Trivy vulnerability assessment
4. **📤 Push**: Registry upload with semantic versioning
5. **🚀 Deploy**: Automated Kubernetes deployment
6. **📢 Notify**: Discord webhook notifications

**Key Features:**
- **Smart Building**: Only builds changed components
- **Security First**: Mandatory vulnerability scanning
- **Multi-Environment**: Separate pipelines for staging/production
- **Rollback Support**: Automated rollback on failure
- **Resource Optimization**: Parallel builds and caching

```bash
# Manual pipeline trigger
# Webhook URL: https://jenkins.yourdomain.com/github-webhook/

# Build specific components
curl -X POST "https://jenkins.yourdomain.com/job/islamic-app/buildWithParameters" \
  -d "BUILD_TYPE=frontend-only"
```

### 📊 Pipeline Monitoring

**Build Status Dashboard:**
- Build success/failure rates
- Build duration trends
- Security scan results
- Deployment status across environments

## 🔌 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/auth/register` | User registration | `{username, email, password}` |
| `POST` | `/api/auth/login` | User authentication | `{email, password}` |
| `POST` | `/api/auth/logout` | Session termination | `{refresh_token}` |
| `GET` | `/api/auth/profile` | Get user profile | Headers: `Authorization: Bearer <token>` |
| `PUT` | `/api/auth/profile` | Update profile | `{username, preferences}` |

### 📿 Tasbeh Counter API

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/tasbeh/phrases` | Get user's tasbeh counts | `user_id` |
| `POST` | `/api/tasbeh/increment` | Increment phrase count | `{phrase, count}` |
| `PUT` | `/api/tasbeh/reset` | Reset specific phrase | `{phrase}` |
| `DELETE` | `/api/tasbeh/phrase/{id}` | Remove phrase | `phrase_id` |

### 👤 User Management API

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/api/user/preferences` | Get user preferences | - |
| `PUT` | `/api/user/preferences` | Update preferences | `{theme, language, notifications}` |
| `GET` | `/api/user/reading-stats` | Get Quran reading stats | `?surah=1&ayah=1` |
| `POST` | `/api/user/achievements` | Track achievements | `{type, description, points}` |
| `GET` | `/api/user/location` | Get user location | - |
| `PUT` | `/api/user/location` | Update location | `{latitude, longitude, city}` |

### 🕐 Prayer Times API

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/prayer-times` | Get prayer times | `?lat=40.7128&lng=-74.0060&date=2024-01-01` |
| `POST` | `/api/prayer-times/location` | Update user location | `{latitude, longitude, timezone}` |
| `GET` | `/api/prayer-times/settings` | Get notification settings | - |
| `PUT` | `/api/prayer-times/settings` | Update notifications | `{enabled, offset_minutes}` |

### 📖 Islamic Content API

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/quran/surah/{id}` | Get specific Surah | `surah_id, translation?` |
| `GET` | `/api/quran/ayah/{surah}/{ayah}` | Get specific Ayah | `surah_id, ayah_id` |
| `GET` | `/api/quran/search` | Search Quran text | `?q=search_term&lang=en` |
| `GET` | `/api/hadith/collections` | Get hadith collections | - |
| `GET` | `/api/hadith/search` | Search hadiths | `?q=search_term&collection=bukhari` |
| `GET` | `/api/azkar/categories` | Get Azkar categories | - |
| `GET` | `/api/azkar/{category}` | Get Azkar by category | `category_name` |

### 📊 Health & Monitoring

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/health` | Application health check | `{status: "healthy", timestamp}` |
| `GET` | `/api/health/detailed` | Detailed health status | `{database, external_apis, cache}` |
| `GET` | `/metrics` | Prometheus metrics | Metrics in Prometheus format |

## 🔒 Security Features

### 🛡️ Application Security
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Password Hashing**: bcrypt with configurable rounds
- **CORS Configuration**: Secure cross-origin resource sharing
- **Input Validation**: Marshmallow schema validation for all endpoints
- **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries
- **Rate Limiting**: API endpoint rate limiting to prevent abuse

### 🔍 Container Security
- **Multi-stage Builds**: Minimal production images
- **Non-root Users**: Containers run as non-privileged users
- **Vulnerability Scanning**: Trivy integration in CI/CD pipeline
- **Security Updates**: Automated base image updates
- **Secrets Management**: Kubernetes secrets for sensitive data
- **Network Policies**: Kubernetes network segmentation

### 🔐 Infrastructure Security
- **TLS Encryption**: End-to-end encryption with Let's Encrypt
- **RBAC**: Role-based access control in Kubernetes
- **Pod Security Standards**: Kubernetes security policies
- **Network Segmentation**: Isolated namespaces and network policies
- **Audit Logging**: Comprehensive security event logging
- **Backup Encryption**: Encrypted database backups

## 📊 Monitoring & Observability

### 📈 Application Monitoring
- **Health Checks**: Multi-level health endpoints for comprehensive status monitoring
- **Performance Metrics**: Response times, throughput, and error rates
- **Resource Usage**: CPU, memory, and disk utilization tracking
- **User Analytics**: Feature usage and user behavior insights
- **Error Tracking**: Centralized error logging and alerting

### 🔍 Infrastructure Monitoring
- **Kubernetes Metrics**: Pod, node, and cluster-level monitoring
- **Container Insights**: Resource usage and performance per container
- **Database Monitoring**: Query performance and connection pooling
- **Network Monitoring**: Traffic patterns and latency analysis
- **Storage Monitoring**: Persistent volume usage and performance

### 📊 Alerting & Notifications
- **Discord Integration**: Real-time build and deployment notifications
- **Slack Integration**: Monitoring alerts and incident management
- **Email Notifications**: Critical system alerts and reports
- **PagerDuty Integration**: On-call management for production issues
- **Custom Webhooks**: Integration with external monitoring systems

## 🚀 Performance Optimization

### ⚡ Frontend Optimization
- **Code Splitting**: Dynamic imports for reduced initial bundle size
- **Lazy Loading**: On-demand component loading for better performance
- **Service Workers**: Offline support and caching strategies
- **Image Optimization**: WebP format with fallbacks and lazy loading
- **Bundle Analysis**: Webpack bundle analyzer for size optimization
- **CDN Integration**: Static asset delivery through global CDN

### 🔧 Backend Optimization
- **Database Connection Pooling**: Efficient database connection management
- **Query Optimization**: Indexed queries and N+1 query prevention
- **Caching Strategies**: Redis caching for frequently accessed data
- **API Response Compression**: Gzip compression for reduced payload
- **Async Processing**: Background tasks for heavy operations
- **Load Balancing**: Multiple backend instances with health checks

### 🏗️ Infrastructure Optimization
- **Horizontal Pod Autoscaling**: Automatic scaling based on metrics
- **Resource Optimization**: Right-sized containers with resource limits
- **Database Tuning**: PostgreSQL configuration optimization
- **Network Optimization**: Service mesh for traffic management
- **Storage Optimization**: Persistent volume performance tuning

## 🧪 Testing Strategy

### 🔍 Frontend Testing
```bash
# Unit tests with Jest and React Testing Library
npm test

# Integration tests
npm run test:integration

# E2E tests with Cypress
npm run test:e2e

# Coverage reports
npm run test:coverage
```

### 🧪 Backend Testing
```bash
# Unit tests with pytest
pytest tests/unit/

# Integration tests
pytest tests/integration/

# API tests
pytest tests/api/

# Load testing with locust
locust -f tests/load/locustfile.py
```

### 🚀 Deployment Testing
- **Smoke Tests**: Basic functionality validation after deployment
- **Health Checks**: Automated endpoint testing
- **Performance Tests**: Load testing in staging environment
- **Security Tests**: Vulnerability scanning and penetration testing
- **Rollback Tests**: Deployment rollback verification

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🛠️ Development Workflow

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/islamic-app.git
   cd islamic-app
   ```

2. **Set Up Development Environment**
   ```bash
   # Complete setup with one command
   docker-compose up -d
   
   # Or manual setup (see Quick Start Guide above)
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   git checkout -b bugfix/issue-description
   git checkout -b docs/documentation-update
   ```

4. **Make Changes and Test**
   ```bash
   # Run tests
   npm test                    # Frontend tests
   pytest                      # Backend tests
   
   # Lint code
   npm run lint               # Frontend linting
   flake8 backend/            # Backend linting
   
   # Build and test locally
   docker-compose up --build
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add new prayer notification feature"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Use clear, descriptive titles
   - Include screenshots for UI changes
   - Reference related issues
   - Ensure all checks pass

### 📝 Contribution Guidelines

#### Code Standards
- **Frontend**: TypeScript strict mode, ESLint + Prettier configuration
- **Backend**: PEP 8 compliance, type hints, comprehensive docstrings
- **Testing**: Maintain >80% code coverage
- **Documentation**: Update relevant docs for new features

#### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
- `feat(auth): add two-factor authentication`
- `fix(api): resolve prayer times calculation error`
- `docs(k8s): update deployment instructions`

#### Pull Request Process
1. ✅ All CI/CD checks must pass
2. 👀 Code review by at least one maintainer
3. 📝 Updated documentation if applicable
4. 🧪 Tests for new functionality
5. 📊 Performance impact assessment

### 🐛 Bug Reports

When reporting bugs, please include:
- **Environment**: OS, browser, Node.js/Python versions
- **Steps to Reproduce**: Clear, numbered steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Logs**: Relevant error messages or logs

### 💡 Feature Requests

For new features, please provide:
- **Use Case**: Why is this feature needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other ways to solve the problem
- **Implementation**: Any technical considerations

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### License Summary
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

## 🆘 Support & Community

### 📞 Getting Help

1. **📚 Documentation**: Check the comprehensive docs in this repository
2. **🐛 Issues**: Create a GitHub issue for bugs or feature requests
3. **💬 Discussions**: Use GitHub Discussions for questions and ideas
4. **📧 Email**: Contact maintainers for security issues

### 🔗 Useful Links

| Resource | Description | Link |
|----------|-------------|------|
| **Live Demo** | Production application | [https://islamic-app.yourdomain.com](https://islamic-app.yourdomain.com) |
| **API Docs** | Swagger/OpenAPI documentation | [https://api.islamic-app.yourdomain.com/docs](https://api.islamic-app.yourdomain.com/docs) |
| **Status Page** | Service uptime and incidents | [https://status.islamic-app.yourdomain.com](https://status.islamic-app.yourdomain.com) |
| **Monitoring** | Grafana dashboards | [https://monitoring.islamic-app.yourdomain.com](https://monitoring.islamic-app.yourdomain.com) |

### 🏷️ Badges & Metrics

![GitHub Issues](https://img.shields.io/github/issues/your-org/islamic-app)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/your-org/islamic-app)
![GitHub Contributors](https://img.shields.io/github/contributors/your-org/islamic-app)
![GitHub Last Commit](https://img.shields.io/github/last-commit/your-org/islamic-app)
![GitHub Repo Size](https://img.shields.io/github/repo-size/your-org/islamic-app)
![Code Quality](https://img.shields.io/codeclimate/maintainability/your-org/islamic-app)
![Test Coverage](https://img.shields.io/codecov/c/github/your-org/islamic-app)

---

## 📋 Quick Reference

### 🚀 Essential Commands

```bash
# Development
docker-compose up -d              # Start development environment
npm start                         # Frontend development server
python app.py                     # Backend development server

# Building
npm run build                     # Build frontend for production
docker build -t islamic-app .     # Build Docker images
./k8s/build-images.sh            # Build all images for Kubernetes

# Deployment
./k8s/deploy.sh                  # Deploy to Kubernetes
./argocd/deploy.sh               # Setup GitOps deployment
docker-compose up --build -d     # Deploy with Docker Compose

# Maintenance
kubectl get pods -n islamic-app   # Check Kubernetes status
docker-compose logs -f            # View application logs
./k8s/cleanup.sh                 # Clean up resources
```

### 📚 Documentation Navigation

- 🏠 **Start Here**: [README.md](README.md) (this file)
- 🎯 **Master Guide**: [DEVOPS_GUIDE.md](DEVOPS_GUIDE.md)
- 📁 **File Reference**: [FILE_INDEX.md](FILE_INDEX.md)
- 🏗️ **Build Guides**: [frontend/BUILD.md](frontend/BUILD.md), [backend/BUILD.md](backend/BUILD.md)
- 🐳 **Containers**: [docker-compose.md](docker-compose.md)
- ☸️ **Kubernetes**: [k8s/k8s-documentation.md](k8s/k8s-documentation.md)
- 🔄 **CI/CD**: [Jenkinsfile.md](Jenkinsfile.md)
- 📦 **GitOps**: [argocd/argocd-documentation.md](argocd/argocd-documentation.md)

---

**🌟 Star this repository if you find it helpful!**

**Built with ❤️ for the Muslim community by developers passionate about Islamic technology and DevOps excellence.**