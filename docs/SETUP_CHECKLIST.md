# ✅ Deployment Setup Checklist

Use this checklist to track your progress through the hosting setup.

## 🚂 Railway Setup
- [ ] Create Railway account at [railway.app](https://railway.app)
- [ ] Connect GitHub account
- [ ] Create new project from tactical-operator repository
- [ ] Add PostgreSQL database to project
- [ ] Configure environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3001`
  - [ ] `JWT_SECRET=your-secure-secret`
  - [ ] `CORS_ORIGIN=https://your-app.vercel.app`
  - [ ] `SOCKET_CORS_ORIGIN=https://your-app.vercel.app`
- [ ] Create Railway API token
- [ ] Copy Railway API URL (e.g., `https://tactical-operator-api.up.railway.app`)

## 🌐 Vercel Setup
- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Connect GitHub account
- [ ] Import tactical-operator project
- [ ] Configure build settings:
  - [ ] Framework: `Vite`
  - [ ] Root Directory: `web-client`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
- [ ] Add environment variables:
  - [ ] `VITE_API_URL=https://your-railway-url.up.railway.app/api`
  - [ ] `VITE_SOCKET_URL=https://your-railway-url.up.railway.app`
- [ ] Deploy project
- [ ] Copy Vercel app URL (e.g., `https://tactical-operator.vercel.app`)
- [ ] Create Vercel deployment token
- [ ] Get Vercel project ID and org ID

## 🔄 Update Railway CORS
- [ ] Go back to Railway environment variables
- [ ] Update `CORS_ORIGIN` with actual Vercel URL
- [ ] Update `SOCKET_CORS_ORIGIN` with actual Vercel URL
- [ ] Redeploy Railway service

## 🔑 GitHub Secrets
Go to GitHub repo → Settings → Secrets and variables → Actions

- [ ] Add `RAILWAY_TOKEN`
- [ ] Add `VERCEL_TOKEN`
- [ ] Add `VERCEL_ORG_ID`
- [ ] Add `VERCEL_PROJECT_ID`
- [ ] Add `VITE_API_URL`
- [ ] Add `VITE_SOCKET_URL`

## 🚀 Test Deployment
- [ ] Make a test commit and push to main branch
- [ ] Check GitHub Actions workflow runs successfully
- [ ] Verify Railway deployment completes
- [ ] Verify Vercel deployment completes
- [ ] Visit live Vercel URL
- [ ] Test API connection (try creating a character)
- [ ] Check browser console for errors

## 🎉 Success Indicators
- [ ] Vercel app loads without errors
- [ ] API calls work (create character, etc.)
- [ ] Real-time features work (if implemented)
- [ ] No CORS errors in browser console
- [ ] Both Railway and Vercel show successful deployments

---

## 📝 Save These URLs
After setup, record your live URLs:

**Frontend**: `https://_________________________.vercel.app`
**Backend**: `https://_________________________.up.railway.app`

## 🆘 Need Help?
- Check `docs/HOSTING_SETUP_GUIDE.md` for detailed instructions
- Review `docs/DEPLOYMENT.md` for troubleshooting
- Check Railway/Vercel logs for specific error messages
