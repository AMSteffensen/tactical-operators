# 🌐 VERCEL_DEPLOYMENT_GUIDE.md - Frontend Deployment Setup

## 🚀 Overview

This guide covers deploying the Tactical Operator web client to Vercel with automatic PR previews and production deployments.

---

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Integration**: Connect your GitHub account to Vercel
3. **Railway Backend**: Ensure API server is deployed and operational
4. **Vercel CLI**: `npm install -g vercel` (optional, for local testing)

---

## ⚙️ Vercel Project Setup

### 1. **Create New Project**

```bash
# Option 1: Via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import from GitHub: tactical-operators repository
4. Select framework: "Vite"
5. Set root directory: "web-client"

# Option 2: Via Vercel CLI
cd /Users/andreassteffensen/dev/tactical-operator
vercel
# Follow prompts to link project
```

### 2. **Environment Variables**

Add these to Vercel project settings:

```bash
# Production Environment
VITE_API_URL=https://tactical-operators-production.up.railway.app
VITE_SOCKET_URL=https://tactical-operators-production.up.railway.app
VITE_ENVIRONMENT=production

# Preview Environment (for PR deployments)
VITE_API_URL=https://tactical-operators-production.up.railway.app
VITE_SOCKET_URL=https://tactical-operators-production.up.railway.app
VITE_ENVIRONMENT=preview
```

### 3. **Build Configuration**

Vercel will automatically detect the build settings from `vercel.json`:

```json
{
  "buildCommand": "cd web-client && npm run build",
  "outputDirectory": "web-client/dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

---

## 🔧 GitHub Secrets Setup

Add these secrets to your GitHub repository:

```bash
# Get these from Vercel dashboard -> Settings -> General
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id  
VERCEL_PROJECT_ID=your-project-id
```

### How to Get Vercel Secrets:

1. **VERCEL_TOKEN**:
   - Go to Vercel Dashboard → Settings → Tokens
   - Create new token with scope: "Full Account"

2. **VERCEL_ORG_ID & VERCEL_PROJECT_ID**:
   ```bash
   cd web-client
   vercel link
   cat .vercel/project.json
   ```

---

## 🚀 Deployment Workflow

### **Automatic Deployments**

- **PR Created**: → Preview deployment + comment with URL
- **PR Updated**: → Preview deployment updated
- **PR Merged**: → Production deployment
- **Direct Push to Main**: → Production deployment

### **Manual Deployments**

```bash
# Preview deployment
cd web-client
vercel

# Production deployment  
cd web-client
vercel --prod
```

---

## 🧪 Testing Deployments

### **Preview Deployment Testing**

When a PR is created, test these features:

```bash
# 1. Basic site load
curl -f https://your-preview-url.vercel.app/

# 2. Test API connection
# Open browser dev tools and check:
# - No CORS errors
# - API calls to Railway backend succeed
# - Socket.IO connection establishes

# 3. Test game features
# - Character creation form
# - 3D tactical view rendering
# - Real-time communication
```

### **Production Deployment Testing**

```bash
# Health check via browser
https://your-domain.vercel.app/

# API integration test
# Check browser console for:
# - "✅ Connected to game server" (Socket.IO)
# - Successful API responses from Railway
# - No CORS or network errors
```

---

## 🛠️ Troubleshooting

### **Common Issues**

#### **CORS Errors**
```bash
# Problem: Frontend can't connect to Railway backend
# Solution: Update Railway CORS settings

# Check Railway API CORS configuration
curl -H "Origin: https://your-vercel-domain.vercel.app" \
  https://tactical-operators-production.up.railway.app/health
```

#### **Build Failures**
```bash
# Problem: Vercel build fails
# Solution: Check build logs

# Test build locally
cd web-client
npm run build

# Check for missing dependencies
npm ci
```

#### **Environment Variables**
```bash
# Problem: API URLs not configured
# Solution: Verify Vercel environment variables

# Check if variables are loaded
console.log(import.meta.env.VITE_API_URL)
```

### **Debug Commands**

```bash
# Test local build with production settings
cd web-client
VITE_API_URL=https://tactical-operators-production.up.railway.app \
VITE_SOCKET_URL=https://tactical-operators-production.up.railway.app \
npm run build

# Preview local build
npm run preview

# Test Vercel CLI deployment
vercel dev
```

---

## 🔒 Security Configuration

### **Content Security Policy**

The `vercel.json` includes CSP headers:

```json
{
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://tactical-operators-production.up.railway.app wss://tactical-operators-production.up.railway.app"
}
```

### **HTTPS Enforcement**

Vercel automatically provides HTTPS for all deployments.

---

## 📊 Monitoring & Analytics

### **Vercel Analytics**

Enable in Vercel dashboard:
- Web Vitals tracking
- Performance monitoring  
- Error tracking

### **Deployment Logs**

```bash
# View deployment logs
vercel logs https://your-deployment-url.vercel.app

# View function logs
vercel logs --follow
```

---

## 🔄 CI/CD Integration

The GitHub Action `vercel-deployment.yml` handles:

1. **Build Testing**: Type checking, linting, build verification
2. **Preview Deployment**: Automatic PR previews
3. **Production Deployment**: Main branch deployments
4. **Testing**: Basic health checks on deployments

### **Manual Workflow Trigger**

```bash
# Trigger deployment workflow
git push origin feature-branch

# Or via GitHub UI:
# Actions → Vercel Frontend Deployment → Run workflow
```

---

## 🎯 Production Checklist

Before going live:

- [ ] **Domain Setup**: Configure custom domain in Vercel
- [ ] **Environment Variables**: Production URLs configured
- [ ] **CORS Configuration**: Railway allows Vercel domain
- [ ] **Performance**: Test with Lighthouse
- [ ] **Security**: CSP headers properly configured
- [ ] **Analytics**: Vercel Analytics enabled
- [ ] **Error Tracking**: Sentry or similar configured
- [ ] **Backup Strategy**: Database backups scheduled

---

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Backend**: https://tactical-operators-production.up.railway.app
- **GitHub Actions**: Check repository Actions tab
- **Deployment Docs**: https://vercel.com/docs

---

*Last Updated: July 6, 2025*
*Team: Tactical Operator Development*
