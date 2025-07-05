# Railway Dockerfile - Final Fix for Prisma Client Issue
FROM node:20-alpine

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY api-server/package*.json ./api-server/
COPY shared/package*.json ./shared/

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY shared/ ./shared/
COPY api-server/ ./api-server/

# Build shared package first
WORKDIR /app/shared
RUN npm run build

# Build and setup API server
WORKDIR /app/api-serverRUN npx prisma generate
RUN npm run build

# CRITICAL: Generate Prisma client AFTER build in the correct directory
RUN npx prisma generate --schema=./prisma/schema.prisma

# CRITICAL: Copy shared dist to node_modules for @shared imports to work
RUN mkdir -p node_modules/@shared && cp -r ../shared/dist/* node_modules/@shared/

# Create a production start script that uses the correct working directory
RUN echo '#!/bin/sh\ncd /app/api-server\nexec node -r tsconfig-paths/register dist/app.js' > /app/start-production.sh
RUN chmod +x /app/start-production.sh

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Use our custom start script that ensures correct working directory
CMD ["/app/start-production.sh"]
