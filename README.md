# Islamic Digital Companion

A comprehensive full-stack Islamic application providing digital tools for Muslim worship and learning. This project demonstrates modern DevOps practices with a React TypeScript frontend, Flask backend, PostgreSQL database, and complete CI/CD pipeline using Jenkins, Docker, and Kubernetes.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [DevOps Pipeline](#devops-pipeline)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Islamic Digital Companion is a modern web application designed to serve the Muslim community with essential digital tools for daily Islamic practices. It combines traditional Islamic resources with contemporary technology to provide an accessible and comprehensive platform for worship, learning, and spiritual growth.

## Features

### Core Functionality
- **Digital Tasbeh Counter**: Advanced counter with achievement system, sound effects, and progress tracking
- **Quran Reader**: Complete Quran with Arabic text, audio recitation, and translation support
- **Hadith Collection**: Searchable database with authentic hadiths from major collections (Bukhari, Muslim, etc.)
- **Prayer Times**: Location-based prayer time calculations with notifications
- **Azkar and Duas**: Collection of Islamic supplications and remembrances
- **User Authentication**: Secure registration and login system with JWT tokens

### Advanced Features
- **Multi-language Support**: Arabic, English, and Indonesian translations
- **Dark/Light Theme**: Responsive theme switching with user preferences
- **Offline Support**: Progressive Web App capabilities for offline usage
- **Achievement System**: Gamified progress tracking for spiritual activities
- **Audio Integration**: Recitation playback with playback controls
- **User Preferences**: Customizable settings and favorites management

### Technical Features
- **Responsive Design**: Mobile-first approach with cross-device compatibility
- **Real-time Data**: Live updates and synchronization
- **Secure API**: JWT-based authentication with role-based access control
- **Database Optimization**: Efficient data storage and retrieval
- **Containerization**: Docker support for consistent deployment
- **CI/CD Pipeline**: Automated testing, building, and deployment

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with enhanced IDE support
- **React Router**: Client-side routing for single-page application
- **Zustand**: Lightweight state management
- **CSS3**: Modern styling with flexbox and grid
- **Web Audio API**: Sound effects and audio playback

### Backend
- **Flask**: Python web framework with RESTful API design
- **Flask-JWT-Extended**: JSON Web Token authentication
- **Flask-SQLAlchemy**: Object-relational mapping
- **Flask-CORS**: Cross-origin resource sharing
- **PostgreSQL**: Relational database with advanced features
- **Gunicorn**: WSGI HTTP Server for production

### DevOps & Infrastructure
- **Docker**: Containerization for consistent environments
- **Docker Compose**: Multi-container orchestration
- **Kubernetes**: Container orchestration and scaling
- **Jenkins**: Continuous integration and deployment
- **ArgoCD**: GitOps continuous delivery
- **Nginx**: Reverse proxy and load balancer

### External APIs
- **Islamic Prayer Times API**: Accurate prayer time calculations
- **Quran API**: Verse retrieval and audio resources
- **Hadith APIs**: Authentic hadith collections

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React TS)    │◄──►│   (Flask API)   │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   External      │    │    Volume       │
│  (Port: 80/443) │    │     APIs        │    │   Persistence   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

- Node.js 16+ and npm
- Python 3.9+
- PostgreSQL 12+
- Docker and Docker Compose
- Git

## Installation

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Full-DevOps-Project-islamic-app
   ```

2. **Database Setup**
   ```bash
   # Start PostgreSQL database
   docker-compose up database -d
   
   # Run database migrations
   cd database
   chmod +x migrate.sh
   ./migrate.sh
   ```

3. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Set environment variables
   export FLASK_APP=app.py
   export FLASK_ENV=development
   export DATABASE_URL=postgresql://islamic_user:islamic_pass123@localhost:5432/islamic_app
   
   # Start the backend server
   python app.py
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

### Docker Deployment

1. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - Application: http://localhost:80
   - API: http://localhost:80/api

### Kubernetes Deployment

1. **Setup cluster**
   ```bash
   cd k8s
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Deploy application**
   ```bash
   ./deploy.sh
   ```

## Usage

### User Registration and Authentication
1. Navigate to the registration page
2. Create an account with email and password
3. Login with your credentials
4. Access personalized features and preferences

### Digital Tasbeh Counter
1. Select from various Islamic phrases
2. Tap the counter button or use auto-increment
3. Track daily goals and achievements
4. View statistics and progress

### Quran Reading
1. Browse surahs and verses
2. Listen to audio recitations
3. Read translations in multiple languages
4. Search for specific verses

### Hadith Study
1. Browse hadith collections
2. Search by keyword or topic
3. Switch between Arabic and English translations
4. Save favorite hadiths

### Prayer Times
1. Allow location access or set manually
2. View daily prayer schedules
3. Receive prayer notifications
4. Track prayer completion

## DevOps Pipeline

### Continuous Integration
- **Jenkins Pipeline**: Automated builds triggered by Git commits
- **Unit Testing**: Comprehensive test suite for backend and frontend
- **Code Quality**: Linting and static analysis
- **Security Scanning**: Vulnerability assessment

### Continuous Deployment
- **ArgoCD**: GitOps-based deployment to Kubernetes
- **Blue-Green Deployment**: Zero-downtime deployments
- **Rollback Capability**: Quick reversion to previous versions
- **Environment Promotion**: Dev → Staging → Production pipeline

### Monitoring and Observability
- **Health Checks**: Application and database monitoring
- **Logging**: Centralized log aggregation
- **Metrics**: Performance and usage analytics
- **Alerting**: Automated incident response

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Tasbeh Endpoints
- `GET /api/tasbeh/phrases` - Get user's tasbeh counts
- `POST /api/tasbeh/increment` - Increment phrase count
- `PUT /api/tasbeh/reset` - Reset specific phrase count

### User Preference Endpoints
- `GET /api/user/preferences` - Get user preferences
- `PUT /api/user/preferences` - Update user preferences
- `POST /api/user/favorites` - Manage favorites

### External API Integration
- Prayer times calculation
- Quran verse retrieval
- Hadith collection access
- Audio recitation services

## Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Development Guidelines
- Follow TypeScript/Python coding standards
- Write comprehensive tests
- Update documentation
- Ensure responsive design
- Maintain API compatibility

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For support, questions, or suggestions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## Acknowledgments

- Islamic prayer time calculation algorithms
- Quran and Hadith data providers
- Open source community contributions
- Islamic scholars and traditional sources