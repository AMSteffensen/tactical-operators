# 🛡️ BRANCH_PROTECTION_GUIDE.md - Safe Development Workflow

## 🚀 Overview

This guide explains how to safely develop features using branch protection and staging deployments.

---

## 🔒 Branch Protection Setup

### Protected Branch: `main`

The `main` branch is protected with the following rules:

- ✅ **Require pull request reviews** (1 reviewer minimum)
- ✅ **Dismiss stale reviews** when new commits are pushed
- ✅ **Require status checks** to pass before merging:
  - `test` - Unit and integration tests
  - `docker-build` - Docker image builds successfully
  - `security-scan` - Security vulnerability scan
- ✅ **Require branches to be up to date** before merging
- ✅ **Include administrators** (no bypass allowed)
- ❌ **Restrict force pushes**
- ❌ **Restrict deletions**

### Setup Commands

```bash
# 1. Install GitHub CLI (if not already installed)
brew install gh

# 2. Login to GitHub
gh auth login

# 3. Run branch protection setup
./scripts/setup-branch-protection.sh
```

---

## 🚂 Railway Staging Environment

### Environment Structure

- **Production**: `main` branch → `tactical-operator-api.up.railway.app`
- **Staging**: PR branches → `tactical-operator-api-staging.up.railway.app`

### Setup Staging Environment

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Setup staging environment
./scripts/setup-railway-staging.sh

# 3. Get staging token for GitHub Actions
railway auth token

# 4. Add token to GitHub secrets
gh secret set RAILWAY_STAGING_TOKEN --body="your-token-here"
```

---

## 🔄 Safe Development Workflow

### 1. **Create Feature Branch**

```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... edit files ...

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature-name
```

### 2. **Create Pull Request**

```bash
# Create PR via GitHub CLI
gh pr create \
  --title "feat: add new feature" \
  --body "Description of changes" \
  --base main \
  --head feature/your-feature-name
```

### 3. **Automatic Staging Deployment**

When you create the PR, GitHub Actions will:

1. ✅ **Run tests** and security scans
2. ✅ **Build Docker image**
3. ✅ **Deploy to staging** environment
4. ✅ **Post staging URL** in PR comments

Example PR comment:
```
🚀 Staging Deployment Ready

Your PR has been deployed to staging:
- API: https://tactical-operator-api-staging.up.railway.app
- Health Check: https://tactical-operator-api-staging.up.railway.app/health

Test your changes:
curl https://tactical-operator-api-staging.up.railway.app/health
```

### 4. **Test Your Changes**

```bash
# Test staging deployment
STAGING_URL="https://tactical-operator-api-staging.up.railway.app"

# Health check
curl $STAGING_URL/health

# Test specific endpoints
curl $STAGING_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"testpass123"}'
```

### 5. **Code Review & Merge**

1. **Request review** from team member
2. **Address feedback** if needed
3. **Ensure all checks pass**:
   - ✅ Tests pass
   - ✅ Docker builds
   - ✅ Security scan clean
   - ✅ Staging deployment successful
4. **Merge PR** (squash merge recommended)

### 6. **Production Deployment**

When PR is merged to `main`:

1. ✅ **Automatic production deployment** to Railway
2. ✅ **Staging environment cleanup**
3. ✅ **Production health checks**

---

## 🧪 Testing Strategy

### Local Testing

```bash
# Run all tests locally before pushing
make test

# Build Docker image locally
docker build -t tactical-operator:test .

# Test Docker image
docker run --rm -p 3001:3001 \
  -e DATABASE_URL="your-local-db-url" \
  -e JWT_SECRET="test-secret" \
  tactical-operator:test
```

### Staging Testing

```bash
# Automated tests run on every PR
# Manual testing on staging URL
# API endpoint testing
# Integration testing with frontend
```

### Production Testing

```bash
# Health checks
# Smoke tests
# Performance monitoring
# Error tracking
```

---

## 🚨 Emergency Procedures

### Hotfix Workflow

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# 2. Make minimal changes
# ... fix the issue ...

# 3. Create emergency PR
gh pr create \
  --title "hotfix: critical production fix" \
  --body "Emergency fix for production issue" \
  --base main \
  --head hotfix/critical-fix

# 4. Request immediate review
# 5. Merge after staging verification
```

### Rollback Procedure

```bash
# 1. Identify last known good commit
git log --oneline -10

# 2. Create rollback PR
git checkout -b rollback/to-commit-abc123
git revert bad-commit-hash

# 3. Follow normal PR process (expedited)
```

---

## 📊 Monitoring & Alerts

### GitHub Actions Status

- Monitor workflow runs in GitHub Actions tab
- Check for failing builds or tests
- Review security scan results

### Railway Dashboard

- **Production**: Monitor deployment status, logs, metrics
- **Staging**: Verify deployments, cleanup old instances

### Key Metrics

- ✅ Build success rate
- ✅ Test coverage
- ✅ Deployment frequency
- ✅ Mean time to recovery
- ✅ Security vulnerability count

---

## 🔧 Troubleshooting

### Common Issues

#### Branch Protection Bypass

```bash
# If you need to bypass protection (emergency only)
# Temporarily disable protection via GitHub UI
# Make changes
# Re-enable protection immediately
```

#### Staging Deployment Fails

```bash
# Check Railway logs
railway logs --environment staging

# Check GitHub Actions logs
gh run list --limit 5
gh run view [run-id]

# Manual staging deployment
railway environment staging
railway up
```

#### Tests Failing

```bash
# Run specific test suite
npm test -- --testNamePattern="specific test"

# Check test coverage
npm run test:coverage

# Debug failing tests
npm test -- --verbose
```

---

## 📝 Best Practices

### Pull Request Guidelines

1. **Small, focused changes** (< 500 lines when possible)
2. **Clear, descriptive titles** following conventional commits
3. **Comprehensive descriptions** with context and testing notes
4. **Link to related issues** or tasks
5. **Include screenshots** for UI changes

### Code Quality

1. **Write tests** for new features
2. **Update documentation** for API changes
3. **Follow TypeScript** strict mode
4. **Use proper error handling**
5. **Add logging** for debugging

### Security

1. **Never commit secrets** to version control
2. **Use environment variables** for configuration
3. **Validate all inputs** in API endpoints
4. **Regular dependency updates** with security audits
5. **Follow least privilege** principle

---

*Last Updated: July 6, 2025*
*Team: Tactical Operator Development*
