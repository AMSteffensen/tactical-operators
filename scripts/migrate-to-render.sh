#!/bin/bash

# 🎨 Render.com Full-Stack Migration Script
# Migrate from Vercel + Railway to Render.com for everything

echo "🎨 Migrating to Render.com Full-Stack..."
echo "========================================="

# 1. Create render.yaml configuration
echo "📝 Creating render.yaml configuration..."

cat > render.yaml << 'EOF'
services:
  # Frontend - Static Site (FREE)
  - type: web
    name: tactical-operator-frontend
    env: static
    buildCommand: |
      cd shared && npm ci && npm run build
      cd ../web-client && npm ci && npm run build
    staticPublishPath: web-client/dist
    routes:
      # SPA routing - fallback to index.html
      - type: rewrite
        source: /*
        destination: /index.html

  # Backend - API Server ($7/month)
  - type: web
    name: tactical-operator-api
    env: node
    plan: starter
    buildCommand: |
      cd shared && npm ci && npm run build
      cd ../api-server && npm ci && npm run build
    startCommand: npm start
    workingDirectory: api-server
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: JWT_SECRET
        generateValue: true
      - key: CORS_ORIGIN
        fromService:
          type: web
          name: tactical-operator-frontend
          property: host
      - key: SOCKET_CORS_ORIGIN
        fromService:
          type: web
          name: tactical-operator-frontend
          property: host

# Database - PostgreSQL ($7/month)
databases:
  - name: tactical-operator-db
    databaseName: tactical_operator
    user: tactical_user
    plan: starter
EOF

echo "✅ Created render.yaml"

# 2. Create simple migration guide
echo "📋 Creating migration guide..."

cat > docs/RENDER_MIGRATION.md << 'EOF'
# 🎨 Render.com Migration Guide

## Quick Migration (30 minutes)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your tactical-operator repository

### Step 2: Deploy Services
1. **Create Web Service** for frontend:
   - Type: Static Site
   - Build Command: `cd shared && npm ci && npm run build && cd ../web-client && npm ci && npm run build`
   - Publish Directory: `web-client/dist`
   - **Cost**: FREE forever

2. **Create Web Service** for API:
   - Type: Web Service
   - Environment: Node
   - Build Command: `cd shared && npm ci && npm run build && cd ../api-server && npm ci && npm run build`
   - Start Command: `npm start`
   - **Cost**: $7/month

3. **Create Database**:
   - Type: PostgreSQL
   - Plan: Starter
   - **Cost**: $7/month

### Step 3: Configure Environment Variables
Render automatically configures most variables, but set:
- `NODE_ENV=production`
- `JWT_SECRET` (auto-generated)
- `CORS_ORIGIN` (auto-linked to frontend URL)

### Step 4: Update Frontend URLs
Set in frontend environment:
- `VITE_API_URL` → Points to your Render API service
- `VITE_SOCKET_URL` → Same as API URL

## Benefits Over Current Setup

✅ **No CORS issues** - same domain for everything
✅ **No proxy complexity** - direct API calls
✅ **No environment sync** - automatic URL linking
✅ **Better reliability** - more stable than Railway
✅ **Free frontend hosting** - static sites are free
✅ **Automatic PR previews** - every PR gets a preview URL
✅ **Simple pricing** - $14/month total, predictable

## Migration Checklist

- [ ] Create Render account
- [ ] Deploy static site (frontend)
- [ ] Deploy web service (API)
- [ ] Deploy PostgreSQL database
- [ ] Migrate database data
- [ ] Update DNS (if using custom domain)
- [ ] Delete Vercel project
- [ ] Delete Railway project
- [ ] Update documentation

## Database Migration

```bash
# Export from Railway
pg_dump $RAILWAY_DATABASE_URL > backup.sql

# Import to Render
psql $RENDER_DATABASE_URL < backup.sql
```

**Total Migration Time: ~30 minutes**
**Result: Single platform, zero complexity, $14/month**
EOF

echo "✅ Created migration guide"

# 3. Create render-specific package.json scripts
echo "🔧 Adding Render.com specific scripts..."

# Add to root package.json
if command -v jq &> /dev/null; then
    jq '.scripts += {
        "render:deploy": "echo Render.com deploys automatically from git push",
        "render:build:frontend": "cd shared && npm run build && cd ../web-client && npm run build",
        "render:build:api": "cd shared && npm run build && cd ../api-server && npm run build",
        "render:dev": "npm run dev"
    }' package.json > package.json.tmp && mv package.json.tmp package.json
    echo "✅ Added Render scripts to package.json"
else
    echo "⚠️  jq not found - manually add render scripts to package.json"
fi

echo ""
echo "🎉 Render.com migration files created!"
echo ""
echo "📋 Next steps:"
echo "1. Read docs/RENDER_MIGRATION.md"
echo "2. Create account at render.com"
echo "3. Deploy using render.yaml configuration"
echo "4. Migrate database data"
echo "5. Delete Vercel/Railway projects"
echo ""
echo "🎯 Result: Single platform, $14/month, zero complexity!"
EOF

chmod +x scripts/migrate-to-render.sh
