# Vercel Rewrite Debugging

## Current Issue
API requests from the frontend are **not being proxied to Railway**. They stay on the Vercel domain and return 404 errors.

## Evidence
```
Request: https://tactical-operators-web-client-git-ce52aa-amsteffensens-projects.vercel.app/api
Response: {"status":"error","code":404,"message":"Application not found","request_id":"..."}
```

The request should have been rewritten to:
```
https://tactical-operator-api.up.railway.app/api
```

## Possible Causes

### 1. Vercel Rewrites Not Applied
- Our `configure-vercel-rewrites.sh` script may not be updating `vercel.json` in time
- Vercel may be using the committed version instead of the dynamically generated one
- The prebuild script may not be running when expected

### 2. Vercel Configuration Issue
- The `vercel.json` file may have syntax errors
- The rewrite rules may be malformed
- The destination URL may be incorrect

### 3. Deployment Context Issue
- This might be a branch deployment without proper configuration
- Environment variables may not be available during the rewrite processing
- Vercel may not support dynamic rewrites

## Debugging Steps

### Step 1: Verify Vercel Rewrites Work At All
Create a simple rewrite to a known working URL (like httpbin.org) to test if rewrites function.

### Step 2: Check Build Logs
Review Vercel build logs to see if our configuration script is running and what it outputs.

### Step 3: Test Static Configuration
Try using a static `vercel.json` without dynamic updates to isolate the issue.

### Step 4: Alternative Approaches
- Use Vercel's serverless functions as proxies
- Use environment variables in build-time configuration
- Configure rewrites at the Vercel project level instead of in `vercel.json`

## Current Status
- ❌ **API Requests**: Not reaching Railway backend
- ✅ **Frontend Deployment**: Working correctly
- ✅ **Environment Detection**: Partially working (detecting production instead of preview)
- ❌ **Vercel Rewrites**: Not functioning as expected
