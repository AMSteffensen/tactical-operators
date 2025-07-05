# 🔧 Deployment Troubleshooting Guide

Common issues and solutions when setting up Railway and Vercel for tactical-operator.

---

## 🚂 Railway Issues

### ❌ API Service Won't Start

**Symptoms**: Service shows "Failed" or "Crashed" status

**Solutions**:
1. **Check logs** in Railway dashboard → Service → Logs
2. **Verify environment variables** are set correctly
3. **Ensure DATABASE_URL** is not manually set (Railway auto-provides)
4. **Check build logs** for missing dependencies

```bash
# Common fixes:
NODE_ENV=production
PORT=3001
JWT_SECRET=must-be-at-least-32-characters-long
```

### ❌ Database Connection Errors

**Symptoms**: "Error connecting to database" in logs

**Solutions**:
1. **Don't set DATABASE_URL manually** - Railway provides it automatically
2. **Check database status** - ensure PostgreSQL service is running
3. **Verify migrations** ran successfully

### ❌ Build Fails on Railway

**Symptoms**: "Build failed" during deployment

**Solutions**:
1. **Test local build**: `npm run build` in project root
2. **Check shared package**: Ensure it builds first
3. **Verify Dockerfile** paths are correct
4. **Check Railway build logs** for specific errors

---

## 🌐 Vercel Issues

### ❌ Vercel Build Fails

**Symptoms**: "Build failed" during deployment

**Solutions**:
1. **Test local build**:
   ```bash
   cd web-client
   npm install
   npm run build
   ```
2. **Check build configuration**:
   - Root Directory: `web-client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Verify environment variables** are set in Vercel dashboard

### ❌ App Loads But API Calls Fail

**Symptoms**: Frontend loads, but character creation fails

**Solutions**:
1. **Check browser console** for CORS errors
2. **Verify API URL** in Vercel environment variables
3. **Ensure Railway API is running** and accessible
4. **Test API directly**:
   ```bash
   curl https://your-api.up.railway.app/health
   ```

### ❌ CORS Errors

**Symptoms**: "Access to fetch blocked by CORS policy"

**Solutions**:
1. **Update Railway CORS settings**:
   ```env
   CORS_ORIGIN=https://your-exact-vercel-url.vercel.app
   SOCKET_CORS_ORIGIN=https://your-exact-vercel-url.vercel.app
   ```
2. **Redeploy Railway service** after updating
3. **Don't use trailing slashes** in URLs
4. **Ensure URLs match exactly** (including subdomain)

---

## 🔄 GitHub Actions Issues

### ❌ CI Pipeline Fails

**Symptoms**: Red X on GitHub Actions

**Solutions**:
1. **Check the logs** in GitHub Actions tab
2. **Verify secrets are set**:
   - RAILWAY_TOKEN
   - VERCEL_TOKEN
   - VERCEL_ORG_ID
   - VERCEL_PROJECT_ID
3. **Test locally first**: `npm test && npm run build`

### ❌ Deployment Step Fails

**Symptoms**: Tests pass but deployment fails

**Solutions**:
1. **Check token permissions** - ensure tokens have deployment access
2. **Verify project IDs** are correct
3. **Check service status** on Railway/Vercel dashboards

---

## 🔑 Authentication & Secrets Issues

### ❌ Invalid Token Errors

**Symptoms**: "Authentication failed" in GitHub Actions

**Solutions**:
1. **Regenerate tokens** on Railway/Vercel
2. **Update GitHub secrets** with new tokens
3. **Ensure token permissions** include deployment access

### ❌ Environment Variable Issues

**Symptoms**: App behavior differs from local development

**Solutions**:
1. **Check all environment variables** are set in production
2. **Verify variable names** match exactly (case sensitive)
3. **Don't include quotes** around values in dashboard UI
4. **Use production URLs** not localhost

---

## 🌐 Network & Connectivity Issues

### ❌ Socket.IO Connection Fails

**Symptoms**: Real-time features don't work

**Solutions**:
1. **Check SOCKET_CORS_ORIGIN** matches Vercel URL exactly
2. **Verify WebSocket support** on hosting platform
3. **Test Socket.IO endpoint**:
   ```bash
   curl https://your-api.up.railway.app/socket.io/
   ```

### ❌ Slow API Responses

**Symptoms**: Long loading times, timeouts

**Solutions**:
1. **Check Railway logs** for performance issues
2. **Monitor database queries** for inefficiencies
3. **Consider Railway region** closest to users

---

## 📊 Debugging Tools

### Railway Debugging
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and view logs
railway login
railway logs
```

### Vercel Debugging
```bash
# Install Vercel CLI
npm install -g vercel

# View deployment logs
vercel logs
```

### Local Testing
```bash
# Test production build locally
npm run build
npm run start

# Test environment variables
npm run deploy:check
```

---

## 🆘 Emergency Recovery

### If Everything Breaks
1. **Check service status** on both platforms
2. **Rollback to last working commit**:
   ```bash
   git revert HEAD
   git push origin main
   ```
3. **Redeploy from working state**
4. **Check all environment variables** are still set

### Getting Help
- **Railway**: [Railway Discord](https://discord.gg/railway)
- **Vercel**: [Vercel Discord](https://discord.gg/vercel)
- **GitHub Actions**: Check documentation or community forums

---

## ✅ Health Check Commands

Test everything is working:

```bash
# 1. Test Railway API
curl https://your-api.up.railway.app/health

# 2. Test Vercel frontend
curl -I https://your-app.vercel.app

# 3. Test API from frontend
# Visit your Vercel URL and open browser console
fetch('/api/health').then(r => r.text()).then(console.log)

# 4. Test database connection
# Check Railway logs for successful database queries
```

Remember: Most issues are environment variable misconfigurations or URL mismatches! 🎯
