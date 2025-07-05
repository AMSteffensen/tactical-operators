# Railway Dockerfile - Fixed Prisma Schema Path Issue
FROM node:20-alpine

# Install curl for health checks and openssl for Prisma
RUN apk add --no-cache curl openssl

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY api-server/package*.json ./api-server/
COPY shared/package*.json ./shared/

# Copy source code (including Prisma schema) BEFORE installing dependencies
COPY shared/ ./shared/
COPY api-server/ ./api-server/

# Install ALL dependencies (including dev dependencies for build)
# Skip postinstall scripts to avoid prisma generate before schema is available
RUN npm ci --ignore-scripts

# Build shared package first
WORKDIR /app/shared
RUN npm run build

# Build and setup API server
WORKDIR /app/api-server

# Generate Prisma client now that schema is available
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build the API server
RUN npm run build

# Create a production start script that uses the correct working directory
RUN echo '#!/bin/sh\ncd /app/api-server\nexec node dist/app.js' > /app/start-production.sh
RUN chmod +x /app/start-production.sh

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Use our custom start script that ensures correct working directory
CMD ["/app/start-production.sh"]
