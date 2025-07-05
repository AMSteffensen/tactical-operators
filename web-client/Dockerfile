# Production Web Client Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY web-client/package*.json ./web-client/

# Install dependencies
RUN npm ci && npm cache clean --force

# Build shared package
FROM base AS shared-builder
WORKDIR /app
COPY shared/ ./shared/
WORKDIR /app/shared
RUN npm ci && npm run build

# Build web client
FROM base AS web-builder
WORKDIR /app
COPY web-client/ ./web-client/
COPY --from=shared-builder /app/shared/dist ./shared/dist
COPY --from=shared-builder /app/shared/package.json ./shared/package.json

WORKDIR /app/web-client
RUN npm ci && npm run build

# Production image with nginx
FROM nginx:alpine AS runner

# Copy built app to nginx
COPY --from=web-builder /app/web-client/dist /usr/share/nginx/html

# Copy nginx configuration
COPY web-client/nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set permissions
RUN chown -R nextjs:nodejs /usr/share/nginx/html
RUN chown -R nextjs:nodejs /var/cache/nginx
RUN chown -R nextjs:nodejs /var/log/nginx
RUN chown -R nextjs:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R nextjs:nodejs /var/run/nginx.pid

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
