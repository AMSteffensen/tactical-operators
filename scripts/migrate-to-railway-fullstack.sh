#!/bin/bash

# 🚀 Quick Migration to Railway Full-Stack
# This script moves everything to Railway, eliminating Vercel complexity

echo "🚂 Migrating to Railway Full-Stack..."

# 1. Add static file serving to existing Railway API
echo "📁 Adding static file serving to Railway API..."

# Add to api-server/src/app.ts
cat >> api-server/src/app.ts << 'EOF'

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../web-client/dist')));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../web-client/dist/index.html'));
  });
}
EOF

# 2. Update Railway deployment to build frontend
echo "🔧 Updating Railway build process..."

# Update railway.json
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "dockerfile",
    "dockerfilePath": "api-server/Dockerfile.fullstack"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "never"
  }
}
EOF

# 3. Create full-stack Dockerfile
echo "🐳 Creating full-stack Dockerfile..."

cat > api-server/Dockerfile.fullstack << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY api-server/package*.json ./api-server/
COPY web-client/package*.json ./web-client/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY shared/ ./shared/
COPY api-server/ ./api-server/
COPY web-client/ ./web-client/

# Build shared library
RUN cd shared && npm run build

# Build frontend
RUN cd web-client && npm run build

# Build backend
RUN cd api-server && npm run build

# Expose port
EXPOSE 3001

# Start API server (which now serves frontend too)
WORKDIR /app/api-server
CMD ["npm", "start"]
EOF

echo "✅ Migration files created!"
echo ""
echo "📋 Next steps:"
echo "1. git add . && git commit -m 'Migrate to Railway full-stack'"
echo "2. git push origin feature/railway-fullstack"
echo "3. Update Railway deployment to use new Dockerfile"
echo "4. Delete Vercel project"
echo ""
echo "🎉 This eliminates ALL current CORS/proxy issues!"
