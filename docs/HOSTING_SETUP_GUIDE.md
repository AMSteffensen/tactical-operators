# 🚀 Step-by-Step Hosting Setup Guide

This guide walks you through setting up Railway and Vercel for your tactical-operator game deployment.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ GitHub account with your tactical-operator repository
- ✅ Git repository pushed to GitHub
- ✅ Project builds successfully locally (`npm run build`)

---

## 🚂 Part 1: Railway Setup (Backend + Database)

Railway will host your API server and PostgreSQL database.

### Step 1: Create Railway Account

1. **Go to [Railway.app](https://railway.app)**
2. **Click "Login" → "Login with GitHub"**
3. **Authorize Railway** to access your GitHub account
4. **Complete your profile** (optional but recommended)

### Step 2: Create Project from GitHub

1. **Click "New Project"** on Railway dashboard
2. **Select "Deploy from GitHub repo"**
3. **Choose your tactical-operator repository**
4. **Click "Deploy Now"**

Railway will automatically detect your `railway.json` configuration!

### Step 3: Add PostgreSQL Database

1. **In your project dashboard, click "New"**
2. **Select "Database" → "Add PostgreSQL"**
3. **Railway will create a database instance**
4. **Wait for database to provision** (30-60 seconds)

### Step 4: Configure Environment Variables

1. **Click on your API service** (tactical-operator-api)
2. **Go to "Variables" tab**
3. **Add these environment variables**:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secure-jwt-secret-at-least-64-characters-long-123456789
CORS_ORIGIN=https://your-app-name.vercel.app
SOCKET_CORS_ORIGIN=https://your-app-name.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important**: The `DATABASE_URL` is automatically set by Railway when you add PostgreSQL!

### Step 5: Get Your Railway Token

1. **Go to Railway Account Settings** (click your avatar → Account)
2. **Go to "Tokens" tab**
3. **Click "Create Token"**
4. **Name it**: `GitHub Actions Deployment`
5. **Copy the token** - you'll need it for GitHub Secrets

### Step 6: Get Your API URL

1. **In your project, click on the API service**
2. **Go to "Settings" tab**
3. **Copy the domain** (e.g., `https://tactical-operator-api-production.up.railway.app`)
4. **Save this URL** - you'll need it for Vercel configuration

---

## 🌐 Part 2: Vercel Setup (Frontend)

Vercel will host your React web client.

### Step 1: Create Vercel Account

1. **Go to [Vercel.com](https://vercel.com)**
2. **Click "Sign Up" → "Continue with GitHub"**
3. **Authorize Vercel** to access your GitHub account
4. **Choose hobby plan** (free)

### Step 2: Import Your Project

1. **Click "Add New..." → "Project"**
2. **Find your tactical-operator repository**
3. **Click "Import"**
4. **Configure project settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `web-client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Configure Environment Variables

1. **Before deploying, click "Environment Variables"**
2. **Add these variables**:

```env
VITE_API_URL=https://your-railway-api-url.up.railway.app/api
VITE_SOCKET_URL=https://your-railway-api-url.up.railway.app
```

**Replace** `your-railway-api-url.up.railway.app` with your actual Railway API URL from Step 6 above.

### Step 4: Deploy

1. **Click "Deploy"**
2. **Wait for build to complete** (2-3 minutes)
3. **Get your Vercel URL** (e.g., `https://tactical-operator.vercel.app`)

### Step 5: Update Railway CORS Settings

1. **Go back to Railway**
2. **Update your API service environment variables**:
   - **CORS_ORIGIN**: `https://your-vercel-app.vercel.app`
   - **SOCKET_CORS_ORIGIN**: `https://your-vercel-app.vercel.app`
3. **Redeploy your Railway service**

### Step 6: Get Vercel Deployment Info

1. **Go to Vercel Settings** → "General"
2. **Copy these values**:
   - **Project ID** (in URL or settings)
   - **Team ID** (if using a team)
3. **Go to Account Settings** → "Tokens"
4. **Create new token**: `GitHub Actions Deployment`
5. **Copy the token**

---

## 🔑 Part 3: GitHub Secrets Configuration

Now configure GitHub to automatically deploy to both platforms.

### Step 1: Go to GitHub Repository Settings

1. **Open your tactical-operator repository on GitHub**
2. **Go to Settings** → **Secrets and variables** → **Actions**
3. **Click "New repository secret"**

### Step 2: Add Railway Secrets

Add these secrets one by one:

**RAILWAY_TOKEN**
```
your-railway-token-from-step-5-above
```

### Step 3: Add Vercel Secrets

**VERCEL_TOKEN**
```
your-vercel-token-from-step-6-above
```

**VERCEL_ORG_ID**
```
your-vercel-team-id-or-personal-account-id
```

**VERCEL_PROJECT_ID**
```
your-vercel-project-id
```

### Step 4: Add Environment URL Secrets

**VITE_API_URL**
```
https://your-railway-api-url.up.railway.app/api
```

**VITE_SOCKET_URL**
```
https://your-railway-api-url.up.railway.app
```

---

## 🚀 Part 4: Test Your Deployment

### Step 1: Trigger Deployment

1. **Make a small change** to your code (like updating README.md)
2. **Commit and push**:
```bash
git add .
git commit -m "Test deployment pipeline"
git push origin main
```

### Step 2: Monitor Deployment

1. **Go to GitHub** → **Actions tab**
2. **Watch the deployment workflow run**
3. **Check that both Railway and Vercel deploy successfully**

### Step 3: Test Your Live Application

1. **Visit your Vercel URL** (e.g., `https://tactical-operator.vercel.app`)
2. **Try creating a character** (tests API connection)
3. **Check browser console** for any errors
4. **Test real-time features** (if any)

---

## 🎉 Success! What You've Accomplished

✅ **Railway Backend**: API server running with PostgreSQL database  
✅ **Vercel Frontend**: React web client with optimized delivery  
✅ **Automated CI/CD**: Push code → automatic deployment  
✅ **Production URLs**: Live application accessible worldwide  
✅ **Free Hosting**: $0/month for hobby project usage  

## 📊 Your Live URLs

After setup, you'll have:
- **🌐 Game Frontend**: `https://your-app.vercel.app`
- **🚂 API Backend**: `https://your-api.up.railway.app`
- **📊 Database**: Managed PostgreSQL on Railway
- **🔄 CI/CD**: Automated deployments via GitHub Actions

---

## 🔧 Common Issues & Solutions

### Issue: Vercel Build Fails
**Solution**: Ensure `web-client` has all dependencies and builds locally first
```bash
cd web-client
npm install
npm run build
```

### Issue: Railway API Won't Start
**Solution**: Check logs in Railway dashboard, ensure all environment variables are set

### Issue: CORS Errors
**Solution**: Verify CORS_ORIGIN in Railway matches your Vercel URL exactly

### Issue: Database Connection Error
**Solution**: Railway auto-provides DATABASE_URL, don't override it

---

## 🎯 Next Steps

After successful deployment:
1. **Custom Domain**: Add your own domain to Vercel (optional)
2. **Monitoring**: Set up error tracking with Sentry or LogRocket
3. **Analytics**: Add Google Analytics or Mixpanel
4. **Performance**: Monitor with Vercel Analytics

---

## 💡 Pro Tips

- **Use Railway CLI** for local debugging: `npm install -g @railway/cli`
- **Vercel Preview Deployments** test every PR automatically
- **Railway Logs** are available in the dashboard for debugging
- **Environment Variables** can be updated without redeployment

Your tactical-operator game is now running on professional hosting infrastructure! 🚀
