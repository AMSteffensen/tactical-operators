# 🔑 Environment Setup - Quick Reference

## 🚀 **Quick Start (2 minutes)**

```bash
# Automatic setup
npm run setup:env

# Validate setup
npm run validate:env

# Start development
npm run dev
```

---

## 📋 **Manual Setup**

### Development
```bash
# Copy environment files
cp api-server/.env.example api-server/.env
cp web-client/.env.example web-client/.env

# Start database
npm run docker:db

# Start development
npm run dev
```

### Production Secrets
```bash
# Generate secure secrets
npm run generate:secrets

# Copy secrets to:
# - Railway dashboard (API variables)
# - Vercel dashboard (frontend variables)  
# - GitHub secrets (CI/CD variables)
```

---

## 🔧 **Required Variables**

| Environment | Variables | Count |
|-------------|-----------|--------|
| **API Server** | DATABASE_URL, JWT_SECRET, PORT, CORS_ORIGIN | 4+ |
| **Web Client** | VITE_API_URL, VITE_SOCKET_URL | 2 |
| **Railway** | All API variables + production URLs | 6+ |
| **Vercel** | VITE_* variables with Railway URLs | 2 |
| **GitHub** | Platform tokens + production URLs | 6+ |

---

## 🎯 **Environment Files Status**

- [ ] `api-server/.env` - API server configuration
- [ ] `web-client/.env` - Frontend configuration  
- [ ] Railway dashboard - Production API variables
- [ ] Vercel dashboard - Production frontend variables
- [ ] GitHub secrets - CI/CD automation

---

## 🆘 **Quick Fixes**

### API won't start
```bash
npm run validate:env
# Check DATABASE_URL and JWT_SECRET
```

### Frontend can't connect  
```bash
# Check VITE_API_URL points to running API
curl http://localhost:3001/health
```

### Production deployment fails
```bash
# Check all secrets are set in dashboards
npm run generate:secrets
```

---

**📚 Full Guide**: `docs/ENVIRONMENT_SETUP.md`
