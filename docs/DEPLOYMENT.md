# 🚀 Deployment Guide - Free Hosting Setup

This guide walks you through setting up CI/CD and deploying your tactical-operator game to free hosting platforms.

## 🎯 Architecture Overview

- **Frontend**: Vercel (Free tier: 100 deployments/month, 100GB bandwidth)
- **Backend API**: Railway (Free tier: $5 credit/month, ~500 hours)
- **Database**: Railway PostgreSQL (Free tier included)
- **Mobile App**: Expo EAS Build (Free tier: 15 builds/month)
- **CI/CD**: GitHub Actions (Free for public repos)

---

## 🔧 Setup Instructions

### 1. **GitHub Repository Setup**

```bash
# If not already done, initialize git and push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/tactical-operator.git
git push -u origin main
```

### 2. **Railway Setup (Backend + Database)**

1. **Sign up at [Railway.app](https://railway.app)**
2. **Connect your GitHub account**
3. **Create new project from GitHub repo**
4. **Add PostgreSQL database**:
   ```bash
   # Railway will auto-generate DATABASE_URL
   ```
5. **Set environment variables**:
   ```env
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-production-jwt-secret-64-chars
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   SOCKET_CORS_ORIGIN=https://your-vercel-app.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

6. **Get your Railway token**:
   ```bash
   npm install -g @railway/cli
   railway login
   railway generate-token
   ```

### 3. **Vercel Setup (Frontend)**

1. **Sign up at [Vercel.com](https://vercel.com)**
2. **Connect your GitHub account**
3. **Import your repository**
4. **Set build settings**:
   - Framework: Vite
   - Build Command: `cd web-client && npm run build`
   - Output Directory: `web-client/dist`
5. **Set environment variables**:
   ```env
   VITE_API_URL=https://your-railway-app.railway.app/api
   VITE_SOCKET_URL=https://your-railway-app.railway.app
   ```

### 4. **GitHub Secrets Setup**

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

```env
# Railway
RAILWAY_TOKEN=your-railway-token

# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id

# Production URLs
VITE_API_URL=https://your-railway-app.railway.app/api
VITE_SOCKET_URL=https://your-railway-app.railway.app

# Expo (for mobile app)
EXPO_TOKEN=your-expo-token
```

### 5. **Expo Setup (Mobile App)**

1. **Sign up at [Expo.dev](https://expo.dev)**
2. **Install EAS CLI**:
   ```bash
   npm install -g @expo/cli@latest
   expo login
   ```
3. **Configure EAS**:
   ```bash
   cd mobile-app
   eas init --id your-project-id
   eas build:configure
   ```

---

## 🚀 Deployment Process

### Automatic Deployment (Recommended)

1. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **GitHub Actions will**:
   - Run tests and linting
   - Build all packages
   - Deploy API to Railway
   - Deploy frontend to Vercel
   - Build mobile app (on tagged releases)

### Manual Deployment

#### Deploy API to Railway:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link your-project-id
railway up --service api-server
```

#### Deploy Frontend to Vercel:
```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
cd web-client
vercel --prod
```

#### Build Mobile App:
```bash
cd mobile-app
eas build --platform all
```

---

## 🔧 Environment Configuration

### Production Environment Variables

#### Railway (API Server):
```env
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-super-secure-64-char-hex-string
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-vercel-app.vercel.app
SOCKET_CORS_ORIGIN=https://your-vercel-app.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Vercel (Web Client):
```env
VITE_API_URL=https://your-railway-app.railway.app/api
VITE_SOCKET_URL=https://your-railway-app.railway.app
```

---

## 📊 Free Tier Limits

| Service | Free Tier Limits | Upgrade Options |
|---------|------------------|-----------------|
| **Railway** | $5 credit/month (~500 hours) | $5/month for hobby plan |
| **Vercel** | 100 deployments/month, 100GB bandwidth | $20/month for pro |
| **Expo EAS** | 15 builds/month | $29/month for production |
| **GitHub Actions** | 2000 minutes/month (public repos unlimited) | $4/month for 3000 minutes |

---

## 🔍 Monitoring & Troubleshooting

### Health Checks

- **API Health**: `https://your-railway-app.railway.app/health`
- **Web Health**: `https://your-vercel-app.vercel.app/health`

### Logs Access

#### Railway Logs:
```bash
railway logs --service api-server
```

#### Vercel Logs:
```bash
vercel logs https://your-vercel-app.vercel.app
```

#### GitHub Actions:
- Go to Actions tab in your GitHub repository
- View workflow runs and logs

### Common Issues

1. **API CORS Errors**:
   - Ensure `CORS_ORIGIN` matches your Vercel URL exactly

2. **Database Connection Issues**:
   - Check Railway database is running
   - Verify `DATABASE_URL` is set correctly

3. **Build Failures**:
   - Check GitHub Actions logs
   - Ensure all environment variables are set

---

## 🚀 Production Checklist

Before going live:

- [ ] Set strong JWT secrets
- [ ] Configure production database
- [ ] Set up proper CORS origins
- [ ] Enable HTTPS/SSL (automatic on Railway/Vercel)
- [ ] Set up monitoring and alerts
- [ ] Test all functionality in production
- [ ] Set up backup strategy
- [ ] Configure custom domains (if needed)

---

## 🔗 Quick Deploy Links

Once set up, you can deploy with these one-click options:

[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/yourusername/tactical-operator)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/tactical-operator&project-name=tactical-operator&repository-name=tactical-operator)

---

## 💡 Cost Optimization Tips

1. **Use Railway efficiently**:
   - Enable sleep mode for inactive services
   - Monitor resource usage

2. **Optimize Vercel usage**:
   - Use static generation where possible
   - Optimize images and assets

3. **Mobile app builds**:
   - Only trigger EAS builds on tags/releases
   - Use local builds during development

---

*Last Updated: July 5, 2025*
*For questions: Check GitHub Issues or Railway/Vercel documentation*
