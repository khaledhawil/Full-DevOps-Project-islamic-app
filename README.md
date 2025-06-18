# Islamic App - Full-Stack DevOps Project

A comprehensive Islamic application providing digital tools for Muslim worship and learning, featuring prayer times, Quran reading, Hadith collections, digital Tasbeh counter, and Azkar. This project demonstrates modern full-stack development with complete DevOps pipeline implementation using Jenkins, Docker, Kubernetes, and ArgoCD.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## Project Overview

This Islamic application serves the Muslim community with essential digital tools for daily Islamic practices. It combines traditional Islamic resources with modern web technologies to provide an accessible platform for worship, learning, and spiritual growth.

The project showcases enterprise-level DevOps practices including containerization, orchestration, continuous integration, and GitOps deployment strategies.

## Features

### Frontend Application (React TypeScript)
- **Home Dashboard**: Welcome page with navigation to all features
- **Digital Tasbeh Counter**: Advanced counter with achievement system and progress tracking
- **Quran Reader**: Complete Quran with Arabic text and translation support
- **Quran Audio**: Audio recitation with playback controls
- **Hadith Collection**: Searchable database with authentic hadiths from major collections (Bukhari, Muslim, etc.)
- **Prayer Times**: Location-based prayer time calculations
- **Azkar and Duas**: Collection of Islamic supplications and remembrances
- **User Authentication**: Secure registration and login system
- **User Profile**: Personal settings and preferences management
- **Dark/Light Theme**: Theme switching with user preferences
- **Responsive Design**: Mobile-first approach with cross-device compatibility

### Backend API (Flask Python)
- **User Management**: Registration, authentication, and profile management
- **Tasbeh Tracking**: Personal counter data with achievements
- **Prayer Times Integration**: Real-time prayer time calculations
- **Quran API Integration**: Verse retrieval and audio resources
- **User Preferences**: Customizable settings storage
- **JWT Authentication**: Secure token-based authentication
- **Database Models**: Comprehensive data modeling for all features

### DevOps Infrastructure
- **Containerization**: Docker containers for all services
- **Orchestration**: Kubernetes deployment with auto-scaling
- **CI/CD Pipeline**: Jenkins automated build and deployment
- **GitOps**: ArgoCD for continuous delivery
- **Load Balancing**: Nginx reverse proxy configuration
- **Database**: PostgreSQL with persistent storage
- **Monitoring**: Health checks and application monitoring

## Technology Stack

### Frontend
- **React 18.2.0**: Modern React with hooks and functional components
- **TypeScript 4.9.5**: Type-safe development
- **React Router DOM 6.18.0**: Client-side routing
- **Zustand 4.4.6**: Lightweight state management
- **Axios 1.5.2**: HTTP client for API communication
- **Material-UI 5.13.0**: UI components and icons
- **Date-fns 2.30.0**: Date manipulation library

### Backend
- **Flask**: Python web framework
- **Flask-JWT-Extended**: JWT authentication
- **Flask-SQLAlchemy**: Database ORM
- **Flask-CORS**: Cross-origin resource sharing
- **Flask-Migrate**: Database migrations
- **PostgreSQL**: Primary database
- **Gunicorn**: WSGI HTTP server

### DevOps Tools
- **Docker & Docker Compose**: Containerization
- **Kubernetes**: Container orchestration
- **Jenkins**: Continuous integration and deployment
- **ArgoCD**: GitOps continuous delivery
- **Nginx**: Reverse proxy and load balancer
- **Trivy**: Security vulnerability scanning
- **Discord Webhooks**: Build notifications

### External Integrations
- **Islamic Prayer Times API**: Accurate prayer time calculations
- **Quran API**: Verse retrieval and translations
- **Hadith APIs**: Authentic hadith collections

## Project Structure

```
Full-DevOps-Project-islamic-app/
├── frontend/                    # React TypeScript application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── AudioWidget.tsx
│   │   │   ├── DarkModeToggle.tsx
│   │   │   └── Navbar.tsx
│   │   ├── contexts/           # React contexts for global state
│   │   │   ├── AudioContext.tsx
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ThemeContext.tsx
│   │   │   └── UserDataContext.tsx
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useUserPreferences.ts
│   │   │   └── useUserSpecificData.ts
│   │   ├── pages/              # Main application pages
│   │   │   ├── Azkar.tsx
│   │   │   ├── Hadith.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── PrayerTimes.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Quran.tsx
│   │   │   ├── QuranAudio.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Tasbeh.tsx
│   │   ├── services/           # API service layer
│   │   │   ├── api.ts
│   │   │   └── userService.ts
│   │   ├── stores/             # Zustand state stores
│   │   │   └── authStore.ts
│   │   └── utils/              # Utility functions
│   │       └── userStorage.ts
│   ├── public/                 # Static assets
│   ├── Dockerfile
│   └── package.json
├── backend/                     # Flask Python API
│   ├── models/                 # Database models
│   │   ├── user.py
│   │   ├── tasbeh_count.py
│   │   ├── user_achievement.py
│   │   ├── user_location.py
│   │   ├── user_phrase.py
│   │   ├── user_preference.py
│   │   └── user_reading_stats.py
│   ├── routes/                 # API endpoints
│   │   ├── auth.py
│   │   ├── prayer_times_new.py
│   │   ├── quran_new.py
│   │   ├── tasbeh.py
│   │   └── user.py
│   ├── schemas/                # Data validation schemas
│   ├── utils/                  # Utility functions
│   │   └── islamic_data.py
│   ├── app.py                  # Main Flask application
│   ├── database.py             # Database configuration
│   ├── Dockerfile
│   └── requirements.txt
├── database/                    # Database setup and migrations
│   ├── init.sql
│   ├── migrate.sh
│   └── migrations/
├── k8s/                        # Kubernetes manifests
│   ├── 00-namespace.yaml
│   ├── 01-secrets-configmap.yaml
│   ├── 02-persistent-storage.yaml
│   ├── 03-postgres.yaml
│   ├── 04-backend.yaml
│   ├── 05-frontend.yaml
│   ├── 06-nginx.yaml
│   ├── 07-ingress.yaml
│   ├── 08-hpa.yaml
│   ├── build-images.sh
│   ├── cleanup.sh
│   ├── deploy-only.sh
│   ├── deploy.sh
│   └── setup.sh
├── argocd/                     # ArgoCD GitOps configuration
│   ├── application.yaml
│   ├── application-staging.yaml
│   ├── project.yaml
│   └── deploy.sh
├── nginx/                      # Nginx configuration
│   └── nginx.conf
├── docker-compose.yml          # Local development setup
├── Jenkinsfile                 # CI/CD pipeline definition
└── JENKINS_PIPELINE_GUIDE.md   # Detailed pipeline documentation
```

## Prerequisites

- **Node.js 16+** and npm
- **Python 3.9+**
- **PostgreSQL 12+**
- **Docker** and **Docker Compose**
- **Kubernetes cluster** (for production deployment)
- **Jenkins** (for CI/CD)
- **ArgoCD** (for GitOps deployment)

## Local Development Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Full-DevOps-Project-islamic-app
```

### 2. Database Setup
```bash
# Start PostgreSQL database
docker-compose up database -d

# Run database migrations
cd database
chmod +x migrate.sh
./migrate.sh
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export FLASK_APP=app.py
export FLASK_ENV=development
export DATABASE_URL=postgresql://islamic_user:islamic_pass123@localhost:5432/islamic_app

# Start backend server
python app.py
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

## Docker Deployment

### Full Stack Deployment
```bash
# Build and start all services
docker-compose up --build

# Access application
# Frontend: http://localhost:80
# API: http://localhost:80/api
```

### Individual Service Deployment
```bash
# Backend only
docker-compose up backend database

# Frontend only  
docker-compose up frontend nginx
```

## Kubernetes Deployment

### Quick Setup
```bash
cd k8s
chmod +x setup.sh deploy.sh
./deploy.sh
```

### Manual Deployment Steps
```bash
# 1. Setup cluster
./setup.sh

# 2. Build Docker images
./build-images.sh

# 3. Deploy to Kubernetes
./deploy-only.sh

# 4. Verify deployment
kubectl get pods -n islamic-app
kubectl get services -n islamic-app
```

### Cleanup
```bash
./cleanup.sh
```

## CI/CD Pipeline

### Jenkins Pipeline Features
- **Automated Builds**: Triggered by Git commits
- **Docker Image Building**: Multi-stage builds for frontend and backend
- **Security Scanning**: Trivy vulnerability scanning
- **Kubernetes Deployment**: Automated deployment to cluster
- **Notifications**: Discord webhook notifications
- **Build Optimization**: Change detection and selective building

### Pipeline Stages
1. **Checkout**: Source code retrieval
2. **Build Detection**: Detect changes in frontend/backend
3. **Docker Build**: Create optimized container images
4. **Security Scan**: Vulnerability assessment with Trivy
5. **Push Images**: Upload to Docker registry
6. **Deploy**: Kubernetes deployment
7. **Notification**: Build status updates

### ArgoCD GitOps
- **Production**: Automatic sync from master branch
- **Staging**: Automatic sync from develop branch
- **Self-healing**: Automatic drift correction
- **Rollback**: Quick reversion capabilities

## API Documentation

### Authentication Endpoints
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
POST /api/auth/logout      # User logout
GET  /api/auth/profile     # Get user profile
```

### Tasbeh Counter Endpoints
```
GET  /api/tasbeh/phrases   # Get user's tasbeh counts
POST /api/tasbeh/increment # Increment phrase count
PUT  /api/tasbeh/reset     # Reset specific phrase count
```

### User Management Endpoints
```
GET  /api/user/preferences        # Get user preferences
PUT  /api/user/preferences        # Update preferences
POST /api/user/favorites          # Manage favorites
GET  /api/user/reading-stats      # Get reading statistics
POST /api/user/achievements       # Track achievements
```

### Prayer Times Endpoints
```
GET  /api/prayer-times            # Get prayer times for location
POST /api/prayer-times/location   # Update user location
```

## Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes and add tests
4. Commit: `git commit -m "Add: feature description"`
5. Push: `git push origin feature/your-feature`
6. Create Pull Request

### Code Standards
- **Frontend**: TypeScript strict mode, ESLint configuration
- **Backend**: Python PEP 8, Flask best practices
- **Testing**: Unit tests for critical functionality
- **Documentation**: Update README for new features

### DevOps Guidelines
- Update Kubernetes manifests for infrastructure changes
- Test Docker builds locally before pushing
- Verify CI/CD pipeline changes in staging environment
- Follow semantic versioning for releases

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

- **Issues**: Create GitHub issues for bugs or feature requests
- **Documentation**: Check JENKINS_PIPELINE_GUIDE.md for CI/CD details
- **Kubernetes**: See k8s/README.md for deployment specifics
- **ArgoCD**: Check argocd/README.md for GitOps configuration