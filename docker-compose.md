# Docker Compose Documentation

## Overview
Docker Compose configuration for local development and testing of the Islamic App. This file orchestrates multiple services including frontend, backend, database, and nginx proxy.

## Services Architecture

### Database Service
- **Image**: `postgres:15-alpine`
- **Container Name**: `islamic-app-db`
- **Port**: `5432:5432`
- **Environment Variables**:
  - `POSTGRES_DB`: islamic_app
  - `POSTGRES_USER`: islamic_user
  - `POSTGRES_PASSWORD`: islamic_pass123
  - `POSTGRES_HOST_AUTH_METHOD`: trust
- **Volumes**:
  - `postgres_data:/var/lib/postgresql/data` (persistent data)
  - `./database/init.sql:/docker-entrypoint-initdb.d/init.sql` (initialization script)
- **Health Check**: PostgreSQL readiness probe
- **Network**: islamic-network

### Backend Service
- **Build Context**: `./backend`
- **Container Name**: `islamic-app-backend`
- **Port**: `5000:5000`
- **Dependencies**: database service
- **Environment Variables**:
  - `DATABASE_URL`: Connection to PostgreSQL
  - `FLASK_ENV`: development
  - `FLASK_APP`: app.py
- **Volumes**: Source code mounting for development
- **Network**: islamic-network

### Frontend Service
- **Build Context**: `./frontend`
- **Container Name**: `islamic-app-frontend`
- **Port**: `3000:3000`
- **Dependencies**: backend service
- **Environment Variables**:
  - `REACT_APP_API_URL`: Backend API endpoint
- **Volumes**: Source code mounting for development
- **Network**: islamic-network

### Nginx Service
- **Image**: `nginx:alpine`
- **Container Name**: `islamic-app-nginx`
- **Port**: `80:80`
- **Dependencies**: frontend and backend services
- **Configuration**: `./nginx/nginx.conf:/etc/nginx/nginx.conf`
- **Purpose**: Reverse proxy and load balancer
- **Network**: islamic-network

## Networks
- **islamic-network**: Bridge network for service communication

## Volumes
- **postgres_data**: Persistent PostgreSQL data storage

## Usage Commands

### Start All Services
```bash
docker-compose up
```

### Start in Background
```bash
docker-compose up -d
```

### Build and Start
```bash
docker-compose up --build
```

### Start Specific Service
```bash
docker-compose up database
docker-compose up backend
docker-compose up frontend
```

### View Logs
```bash
docker-compose logs
docker-compose logs -f backend
docker-compose logs frontend
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes
```bash
docker-compose down -v
```

### Scale Services
```bash
docker-compose up --scale backend=3
```

## Development Workflow
1. Start database first: `docker-compose up database -d`
2. Run backend locally or in container
3. Run frontend locally or in container
4. Access via nginx proxy on port 80

## Troubleshooting

### Database Connection Issues
- Check if database is healthy: `docker-compose ps`
- Verify environment variables
- Check network connectivity

### Port Conflicts
- Ensure ports 80, 3000, 5000, 5432 are available
- Modify port mappings if needed

### Build Issues
- Clean build: `docker-compose build --no-cache`
- Remove old containers: `docker-compose rm`
- Remove old images: `docker image prune`

## Environment Variables
Create `.env` file for custom configuration:
```env
POSTGRES_PASSWORD=your_secure_password
API_BASE_URL=http://localhost:5000
REACT_APP_API_URL=http://localhost:80/api
```
