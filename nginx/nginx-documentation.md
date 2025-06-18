# Nginx Configuration Documentation

## Overview
Nginx serves as a reverse proxy and load balancer for the Islamic App, handling SSL termination, static content serving, and routing between frontend and backend services.

## Configuration Files

### nginx.conf
Main Nginx configuration file with optimized settings for production use.

```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

# Optimize worker connections
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Basic settings
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    # Upstream servers
    upstream backend {
        least_conn;
        server backend:5000 max_fails=3 fail_timeout=30s;
        # Add more backend servers for load balancing
        # server backend-2:5000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }
    
    upstream frontend {
        least_conn;
        server frontend:3000 max_fails=3 fail_timeout=30s;
        # Add more frontend servers for load balancing  
        # server frontend-2:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }
    
    # Main server block
    server {
        listen 80;
        server_name localhost islamic-app.local;
        
        # Security settings
        server_tokens off;
        client_max_body_size 10M;
        
        # Frontend routes (React Router)
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Handle React Router
            try_files $uri $uri/ @fallback;
        }
        
        # Fallback for React Router
        location @fallback {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
        
        # API routes
        location /api/ {
            # Rate limiting for API
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }
        
        # Auth endpoints with stricter rate limiting
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            
            proxy_pass http://backend/auth/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Static files with caching
        location /static/ {
            proxy_pass http://frontend/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
        
        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
        
        # Favicon
        location = /favicon.ico {
            proxy_pass http://frontend/favicon.ico;
            expires 1y;
            access_log off;
            log_not_found off;
        }
        
        # Robots.txt
        location = /robots.txt {
            proxy_pass http://frontend/robots.txt;
            access_log off;
            log_not_found off;
        }
        
        # Security: Block access to sensitive files
        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }
        
        location ~ ~$ {
            deny all;
            access_log off;
            log_not_found off;
        }
    }
    
    # HTTPS server block (for production with SSL)
    server {
        listen 443 ssl http2;
        server_name islamic-app.local;
        
        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;
        
        # Modern SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        
        # HSTS
        add_header Strict-Transport-Security "max-age=63072000" always;
        
        # Same location blocks as HTTP server
        # ... (duplicate all location blocks from HTTP server)
    }
}
```

## Kubernetes Integration

### ConfigMap for Nginx Configuration
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-config
  namespace: islamic-app
data:
  nginx.conf: |
    # Include the full nginx.conf content here
    # This allows dynamic configuration updates
```

### Nginx Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  namespace: islamic-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        - containerPort: 443
        volumeMounts:
        - name: nginx-config
          mountPath: /etc/nginx/nginx.conf
          subPath: nginx.conf
        - name: ssl-certs
          mountPath: /etc/nginx/ssl
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 250m
            memory: 256Mi
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: nginx-config
        configMap:
          name: nginx-config
      - name: ssl-certs
        secret:
          secretName: nginx-ssl-certs
```

### Service Configuration
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx
  namespace: islamic-app
spec:
  type: LoadBalancer
  ports:
  - name: http
    port: 80
    targetPort: 80
  - name: https
    port: 443
    targetPort: 443
  selector:
    app: nginx
```

## Features and Optimizations

### Load Balancing
- **Upstream Configuration**: Backend and frontend server pools
- **Load Balancing Method**: Least connections
- **Health Checks**: Automatic failure detection
- **Keep-Alive**: Persistent connections for performance

### Security
- **Rate Limiting**: API and authentication endpoint protection
- **Security Headers**: XSS protection, content type sniffing prevention
- **SSL/TLS**: Modern cipher suites and protocols
- **HSTS**: HTTP Strict Transport Security
- **Content Security Policy**: XSS prevention

### Performance
- **Gzip Compression**: Reduces bandwidth usage
- **Static File Caching**: Long-term caching for assets
- **Keep-Alive Connections**: Reduces connection overhead
- **HTTP/2**: Modern protocol for improved performance

### Monitoring
- **Access Logs**: Request logging for analysis
- **Error Logs**: Error tracking and debugging
- **Health Endpoints**: Monitoring integration
- **Metrics**: Performance metrics collection

## SSL/TLS Configuration

### Certificate Management
```bash
# Generate self-signed certificate for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout key.pem -out cert.pem \
    -subj "/CN=islamic-app.local"

# Create Kubernetes secret
kubectl create secret tls nginx-ssl-certs \
    --cert=cert.pem --key=key.pem -n islamic-app
```

### Let's Encrypt Integration
```yaml
# cert-manager ClusterIssuer
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@islamic-app.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

## Monitoring and Logging

### Log Analysis
```bash
# View access logs
kubectl logs -f deployment/nginx -n islamic-app

# Filter for errors
kubectl logs deployment/nginx -n islamic-app | grep "error"

# Monitor response times
kubectl logs deployment/nginx -n islamic-app | grep "request_time"
```

### Metrics Collection
```nginx
# Nginx metrics for Prometheus
location /nginx_status {
    stub_status on;
    access_log off;
    allow 10.0.0.0/8;    # Allow monitoring systems
    deny all;
}
```

### Health Monitoring
```bash
# Check nginx health
curl http://nginx-service/health

# Check upstream status
curl http://nginx-service/nginx_status
```

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Backend services not responding
   - Check upstream server health
   - Verify service endpoints

2. **SSL Certificate Issues**
   - Certificate expired or invalid
   - Incorrect certificate chain
   - SSL configuration errors

3. **Rate Limiting**
   - Too many requests from client
   - Adjust rate limit zones
   - Monitor client behavior

### Debug Commands
```bash
# Test nginx configuration
nginx -t

# Reload configuration
nginx -s reload

# Check nginx process
ps aux | grep nginx

# Test connectivity to upstreams
telnet backend 5000
telnet frontend 3000
```

### Performance Tuning
```nginx
# Optimize worker processes
worker_processes auto;
worker_cpu_affinity auto;

# Optimize connections
worker_connections 4096;
worker_rlimit_nofile 8192;

# Optimize buffers
client_body_buffer_size 10K;
client_header_buffer_size 1k;
client_max_body_size 8m;
large_client_header_buffers 2 1k;

# Optimize timeouts
client_body_timeout 12;
client_header_timeout 12;
keepalive_timeout 15;
send_timeout 10;
```

## Best Practices

### Configuration Management
- Use ConfigMaps for configuration
- Version control nginx.conf
- Test configurations before deployment
- Implement configuration validation

### Security
- Regular security updates
- SSL/TLS best practices
- Rate limiting implementation
- Security header configuration

### Performance
- Monitor response times
- Optimize cache settings
- Load balancing configuration
- Resource limit tuning

### Maintenance
- Regular log rotation
- Certificate renewal automation
- Health check monitoring
- Backup configuration files
