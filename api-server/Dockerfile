# Production API Server Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY api-server/package*.json ./api-server/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Build shared package
FROM base AS shared-builder
WORKDIR /app
COPY shared/ ./shared/
WORKDIR /app/shared
RUN npm ci && npm run build

# Build API server
FROM base AS api-builder
WORKDIR /app
COPY api-server/ ./api-server/
COPY --from=shared-builder /app/shared/dist ./shared/dist
COPY --from=shared-builder /app/shared/package.json ./shared/package.json

WORKDIR /app/api-server
RUN npm ci && npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api-server

# Copy built application
COPY --from=api-builder --chown=api-server:nodejs /app/api-server/dist ./api-server/dist
COPY --from=api-builder --chown=api-server:nodejs /app/api-server/package.json ./api-server/package.json
COPY --from=api-builder --chown=api-server:nodejs /app/api-server/prisma ./api-server/prisma
COPY --from=shared-builder --chown=api-server:nodejs /app/shared/dist ./shared/dist
COPY --from=shared-builder --chown=api-server:nodejs /app/shared/package.json ./shared/package.json
COPY --from=deps --chown=api-server:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=api-server:nodejs /app/api-server/node_modules ./api-server/node_modules

# Set permissions
RUN chown -R api-server:nodejs /app
USER api-server

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
WORKDIR /app/api-server
CMD ["npm", "start"]
