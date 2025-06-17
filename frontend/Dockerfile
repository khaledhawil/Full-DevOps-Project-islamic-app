# Ultra-minimal React build
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with more verbose output and better error handling
RUN npm ci --legacy-peer-deps \
    && npm cache clean --force

# Copy source and build
COPY . ./
RUN npm run build

# Ultra-minimal nginx  //
FROM nginx:alpine

# Remove everything unnecessary
RUN rm -rf /usr/share/nginx/html/* \
    && apk add --no-cache curl \
    && rm -rf /var/cache/apk/*

# Copy only the build
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

HEALTHCHECK --interval=60s --timeout=3s --start-period=30s --retries=2 \
    CMD curl -f http://localhost:3000 || exit 1

CMD ["nginx", "-g", "daemon off;"]
