# 🔄 Deployment Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEPLOYMENT ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐    git push    ┌─────────────────┐    deploys to    ┌─────────────┐
│             │───────────────▶│                 │─────────────────▶│             │
│   LOCAL     │                │  GITHUB ACTIONS │                  │   RAILWAY   │
│ DEVELOPMENT │                │      CI/CD      │                  │ (API + DB)  │
│             │                │                 │─────────────────▶│             │
└─────────────┘                └─────────────────┘    deploys to    └─────────────┘
                                                                     ┌─────────────┐
                                                                     │             │
                                                                     │   VERCEL    │
                                                                     │   (WEB)     │
                                                                     │             │
                                                                     └─────────────┘
```

## 🚀 Step-by-Step Flow

### 1. **Setup Phase** (One-time, ~30 minutes)
```
You → Railway Account → Create Project → Add Database → Get Tokens
You → Vercel Account → Import Project → Configure Build → Get Tokens  
You → GitHub Secrets → Add All Tokens → Configure URLs
```

### 2. **Development Phase** (Ongoing)
```
Code Changes → git commit → git push → Triggers GitHub Actions
```

### 3. **Automatic Deployment** (Every push to main)
```
GitHub Actions → Tests Pass → Build Success → Deploy to Railway + Vercel
```

## 🎯 What Each Platform Does

### 🚂 **Railway**
- **Hosts**: Node.js API server (`api-server/`)
- **Database**: PostgreSQL with automatic backups
- **Features**: Auto-scaling, health checks, logs
- **URL**: `https://tactical-operator-api.up.railway.app`

### 🌐 **Vercel** 
- **Hosts**: React web client (`web-client/`)
- **Features**: CDN, automatic SSL, preview deployments
- **Build**: Vite optimized production bundle
- **URL**: `https://tactical-operator.vercel.app`

### 🔄 **GitHub Actions**
- **Triggers**: Every push to main branch
- **Tests**: Runs all unit tests and linting
- **Builds**: Creates production bundles
- **Deploys**: Pushes to Railway and Vercel simultaneously

## 🔗 How They Connect

```
┌─────────────────┐     HTTP/WebSocket     ┌─────────────────┐
│                 │◀─────────────────────▶│                 │
│  VERCEL (Web)   │     API Calls +        │ RAILWAY (API)   │
│                 │     Real-time Data     │                 │
└─────────────────┘                        └─────────────────┘
                                                     │
                                                     │ SQL
                                                     ▼
                                           ┌─────────────────┐
                                           │                 │
                                           │ PostgreSQL (DB) │
                                           │                 │
                                           └─────────────────┘
```

## 🎮 User Experience Flow

```
User visits Vercel URL → Loads React App → API calls to Railway → Data from PostgreSQL
        ↓
Socket.IO connects to Railway → Real-time multiplayer features → Game sessions
```

## 🔑 Environment Variables Flow

```
Local Development:          Production:
┌─────────────┐             ┌─────────────┐     ┌─────────────┐
│ .env files  │            │GitHub Secrets│────▶│Railway Vars │
└─────────────┘             └─────────────┘     └─────────────┘
                                    │           ┌─────────────┐
                                    └──────────▶│Vercel Vars  │
                                                └─────────────┘
```

## 💰 Cost Breakdown (FREE!)

```
Railway:     $5 credit/month  = $0 (covers 500+ hours)
Vercel:      100 deployments = $0 (more than enough)
GitHub:      Unlimited CI/CD = $0 (for public repos)
───────────────────────────────────────────────────
Total:                        $0/month
```

## 🚨 Common Connection Issues

### CORS Errors
```
Problem: Web app can't connect to API
Solution: Ensure CORS_ORIGIN in Railway = exact Vercel URL
```

### Database Connection
```
Problem: API can't connect to database  
Solution: Railway auto-provides DATABASE_URL (don't override)
```

### Build Failures
```
Problem: Vercel build fails
Solution: Ensure web-client builds locally first
```

This visual overview shows how all the pieces fit together for your tactical-operator deployment! 🎯
