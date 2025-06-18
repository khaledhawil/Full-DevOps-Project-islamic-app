# Backend Build Instructions

## Overview
The backend is a Flask-based REST API with PostgreSQL database integration, featuring JWT authentication, SQLAlchemy ORM, and comprehensive Islamic app functionality.

## Prerequisites
- Python 3.8+ with pip
- PostgreSQL 12+
- Docker (for containerized builds)
- Virtual environment (recommended)

## Dependencies
### Core Dependencies
- **Flask 2.2+**: Web framework and API server
- **Flask-SQLAlchemy**: ORM for database operations
- **Flask-JWT-Extended**: JWT authentication
- **Flask-CORS**: Cross-origin resource sharing
- **Flask-Migrate**: Database migration management
- **psycopg2-binary**: PostgreSQL adapter
- **Gunicorn**: Production WSGI server
- **Marshmallow**: Object serialization/deserialization

### Development Dependencies
- **python-dotenv**: Environment variable management
- **requests**: HTTP client library

## Build Methods

### 1. Local Development Build

#### Create Virtual Environment
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Environment Configuration
Create `.env` file in backend directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/islamic_app
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key
FLASK_ENV=development
FLASK_DEBUG=True
```

#### Database Setup
```bash
# Start PostgreSQL service
sudo systemctl start postgresql

# Create database
createdb islamic_app

# Run migrations
flask db upgrade
```

#### Start Development Server
```bash
python app.py
```
- Server runs on `http://localhost:5000`
- Auto-reload enabled in development mode
- API endpoints available at `/api/*`

### 2. Production Build

#### Install Production Dependencies
```bash
pip install -r requirements.txt
pip install --upgrade pip
```

#### Environment Configuration for Production
```env
DATABASE_URL=postgresql://user:pass@db-host:5432/islamic_app_prod
SECRET_KEY=production-secret-key
JWT_SECRET_KEY=production-jwt-secret
FLASK_ENV=production
FLASK_DEBUG=False
GUNICORN_WORKERS=4
```

#### Run with Gunicorn
```bash
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
```

### 3. Docker Build

#### Build Docker Image
```bash
# From project root
docker build -f backend/Dockerfile -t islamic-app-backend .
```

#### Run Container
```bash
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  islamic-app-backend
```

#### Multi-stage Docker Build Process
The Dockerfile:
1. **Base Stage**: Python runtime environment
2. **Dependencies**: Install Python packages
3. **Application**: Copy source code and configure
4. **Production**: Gunicorn server setup

### 4. Docker Compose Build
```bash
# From project root
docker-compose build backend
docker-compose up backend
```

## Database Management

### Migration Commands
```bash
# Initialize migrations (first time only)
flask db init

# Create new migration
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade

# Downgrade migrations
flask db downgrade
```

### Database Schema
Key models include:
- **User**: Authentication and user data
- **TasbehCount**: Prayer counter functionality
- **UserPreference**: User settings and preferences
- **UserLocation**: Location-based features
- **UserReadingStats**: Quran reading progress

## API Endpoints

### Authentication Routes (`/auth`)
- `POST /auth/register`: User registration
- `POST /auth/login`: User login
- `POST /auth/logout`: User logout

### User Routes (`/user`)
- `GET /user/profile`: Get user profile
- `PUT /user/profile`: Update user profile
- `GET /user/preferences`: Get user preferences
- `PUT /user/preferences`: Update user preferences

### Islamic Features
- `GET /prayer-times`: Prayer times for location
- `GET /quran/*`: Quran text and audio
- `POST /tasbeh/*`: Tasbeh counter operations

## Testing

### Unit Tests
```bash
# Install test dependencies
pip install pytest pytest-flask

# Run tests
pytest tests/

# Run with coverage
pytest --cov=app tests/
```

### API Testing
```bash
# Test API endpoints
curl -X GET http://localhost:5000/api/health
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"testpass"}'
```

## Build Scripts

### Custom Build Scripts
Create `build.sh` for automated builds:
```bash
#!/bin/bash
set -e

echo "Building Islamic App Backend..."

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Run tests
python -m pytest tests/ -v

# Database migrations
flask db upgrade

echo "Backend build completed successfully!"
```

### Production Deployment Script
Create `deploy.sh`:
```bash
#!/bin/bash
set -e

# Pull latest code
git pull origin main

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
pip install -r requirements.txt

# Run database migrations
flask db upgrade

# Restart services
sudo systemctl restart islamic-app-backend
sudo systemctl restart nginx

echo "Deployment completed!"
```

## Performance Optimization

### Database Optimization
```python
# Add database indexes
db.Index('idx_user_email', User.email)
db.Index('idx_prayer_times_location', UserLocation.latitude, UserLocation.longitude)
```

### Caching Strategy
```python
# Redis caching for frequently accessed data
from flask_caching import Cache
cache = Cache(app, config={'CACHE_TYPE': 'redis'})

@cache.memoize(timeout=3600)
def get_prayer_times(lat, lng, date):
    # Cached prayer times calculation
    pass
```

### Production Configuration
```python
# app.py production settings
if os.environ.get('FLASK_ENV') == 'production':
    app.config['DEBUG'] = False
    app.config['TESTING'] = False
    app.config['SQLALCHEMY_ECHO'] = False
```

## Monitoring and Logging

### Application Logging
```python
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/islamic_app.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
```

### Health Check Endpoint
```python
@app.route('/health')
def health_check():
    return {'status': 'healthy', 'timestamp': datetime.utcnow()}
```

## Troubleshooting

### Common Build Issues

#### Python Version Compatibility
```bash
# Check Python version
python --version

# Use pyenv for version management
pyenv install 3.9.0
pyenv local 3.9.0
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -h localhost -U username -d islamic_app -c "SELECT 1;"
```

#### Dependency Conflicts
```bash
# Clear pip cache
pip cache purge

# Reinstall from scratch
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Migration Errors
```bash
# Reset migrations (development only)
rm -rf migrations/
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### Memory and Performance Issues
```bash
# Monitor memory usage
ps aux | grep python

# Profile application
pip install memory-profiler
@profile
def your_function():
    pass
```

## File Structure
```
backend/
├── app.py              # Main application entry point
├── database.py         # Database configuration
├── requirements.txt    # Python dependencies
├── Dockerfile         # Container build instructions
├── models/            # SQLAlchemy models
│   ├── user.py
│   ├── tasbeh_count.py
│   └── ...
├── routes/            # API route handlers
│   ├── auth.py
│   ├── user.py
│   └── ...
├── schemas/           # Marshmallow schemas
├── utils/             # Utility functions
└── tests/             # Unit tests
```

## Integration with DevOps Pipeline
- Jenkins builds using pip and pytest
- Docker image built with multi-stage Dockerfile
- Kubernetes deployment with health checks
- Database migrations automated in CI/CD
- ArgoCD manages continuous deployment
- Monitoring with application logs and metrics
