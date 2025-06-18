# Frontend Build Instructions

## Overview
The frontend is a React TypeScript application built with Create React App, featuring Material-UI components and modern state management with Zustand.

## Prerequisites
- Node.js 16+ and npm 7+ (or Yarn)
- Docker (for containerized builds)

## Dependencies
### Core Dependencies
- **React 18.2.0**: Core UI framework
- **TypeScript 4.9.5**: Type safety and modern JavaScript features
- **React Router DOM 6.18.0**: Client-side routing
- **Material-UI 5.13.0**: Modern React UI components
- **Axios 1.5.2**: HTTP client for API requests
- **Zustand 4.4.6**: Lightweight state management
- **date-fns 2.30.0**: Date manipulation utilities

### Development Dependencies
- **React Scripts 5.0.1**: Build toolchain and development server
- **Testing Library**: Unit testing framework

## Build Methods

### 1. Local Development Build

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Start Development Server
```bash
npm start
```
- Server runs on `http://localhost:3000`
- Hot reload enabled for development
- Automatically opens browser

#### Environment Configuration
Create `.env` file in frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

### 2. Production Build

#### Build for Production
```bash
npm run build
```
- Creates optimized production build in `build/` directory
- Minifies and optimizes all assets
- Ready for deployment

#### Test Production Build Locally
```bash
# Install serve globally
npm install -g serve

# Serve production build
serve -s build -l 3000
```

### 3. Docker Build

#### Build Docker Image
```bash
# From project root
docker build -f frontend/Dockerfile -t islamic-app-frontend .
```

#### Run Container
```bash
docker run -p 3000:80 islamic-app-frontend
```

#### Multi-stage Docker Build Process
The Dockerfile uses multi-stage builds:
1. **Build Stage**: Node.js environment to build React app
2. **Production Stage**: Nginx to serve static files

### 4. Docker Compose Build
```bash
# From project root
docker-compose build frontend
docker-compose up frontend
```

## Build Scripts

### Available npm Scripts
- `npm start`: Development server with hot reload
- `npm run build`: Production build
- `npm test`: Run test suite
- `npm run eject`: Eject from Create React App (irreversible)

### Build Optimization
- TypeScript compilation with strict mode
- Bundle splitting and code optimization
- CSS and asset optimization
- Service worker for caching (PWA ready)

## Testing

### Unit Tests
```bash
npm test
```
- Runs tests in watch mode
- Uses Jest and React Testing Library

### Build Verification
```bash
# Build and verify no errors
npm run build

# Check build size
ls -la build/static/js/
ls -la build/static/css/
```

## Deployment Preparation

### Environment Variables for Production
```env
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_ENVIRONMENT=production
```

### Build Verification Checklist
- [ ] No TypeScript compilation errors
- [ ] All tests passing
- [ ] Build completes successfully
- [ ] Static assets generated correctly
- [ ] Environment variables configured
- [ ] API endpoints accessible

## Troubleshooting

### Common Build Issues

#### Node Version Compatibility
```bash
# Check Node version
node --version

# Use Node Version Manager if needed
nvm use 16
```

#### Memory Issues During Build
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### TypeScript Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Fix type errors or add type assertions
```

#### Dependency Conflicts
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Performance Optimization
- Enable gzip compression in production
- Use CDN for static assets
- Implement lazy loading for routes
- Optimize images and assets

## File Structure
```
frontend/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Route components
│   ├── contexts/     # React contexts
│   ├── hooks/        # Custom hooks
│   ├── services/     # API services
│   ├── stores/       # Zustand stores
│   └── utils/        # Utility functions
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── Dockerfile        # Container build instructions
```

## Integration with DevOps Pipeline
- Jenkins builds using `npm run build`
- Docker image built and pushed to registry
- Kubernetes deployment uses built image
- ArgoCD manages continuous deployment
