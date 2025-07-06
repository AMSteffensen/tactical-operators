# 🧪 Authentication System Test Plan

## Test Objectives
Verify that the frontend authentication system correctly routes API requests to the appropriate Railway backend based on deployment environment.

## Test Environments

### 1. Production Deployment
- **URL**: https://tactical-operator-web.vercel.app
- **Expected API Target**: https://tactical-operator-api.up.railway.app
- **Environment Variables**: 
  - `VITE_VERCEL_ENV=production`
  - `VITE_PR_NUMBER=undefined`

### 2. Preview Deployment (PR Branch)
- **URL**: https://tactical-operator-web-[branch]-[hash].vercel.app
- **Expected API Target**: https://tactical-operators-tactical-operators-pr-[NUMBER].up.railway.app
- **Environment Variables**:
  - `VITE_VERCEL_ENV=preview`
  - `VITE_PR_NUMBER=[actual PR number]`

### 3. Local Development
- **URL**: http://localhost:3000
- **Expected API Target**: http://localhost:3001 (via Vite proxy)
- **Environment Variables**:
  - `VITE_VERCEL_ENV=undefined`
  - `VITE_PR_NUMBER=[from .env file]`

## Test Procedures

### Visual Inspection (Debug Component)
1. ✅ Open the deployment URL
2. ✅ Navigate to login page
3. ✅ Check the API Configuration Debug panel (top-right)
4. ✅ Verify environment variables are correct
5. ✅ Verify API URLs point to expected Railway instance

### Network Request Testing (Browser Console)
1. ✅ Open Developer Tools → Console
2. ✅ Copy and paste the browser test script from `scripts/browser-auth-test.js`
3. ✅ Run the script and observe network requests
4. ✅ Verify requests are proxied to correct Railway URLs
5. ✅ Check response status codes and headers

### Authentication Flow Testing
1. ✅ Test user registration
   - Fill out registration form
   - Submit and check network tab for `/api/auth/register` request
   - Verify request goes to correct Railway URL
   
2. ✅ Test user login
   - Fill out login form  
   - Submit and check network tab for `/api/auth/login` request
   - Verify request goes to correct Railway URL
   - Check for JWT token in response

3. ✅ Test authenticated requests
   - After login, navigate to character management
   - Check network tab for `/api/character` requests
   - Verify requests include Authorization header
   - Verify requests go to correct Railway URL

## Success Criteria

### ✅ Configuration Detection
- [ ] Environment variables are correctly detected in all environments
- [ ] API configuration shows correct Railway URLs for each environment
- [ ] Debug component displays accurate information

### ✅ Network Routing
- [ ] HTTP requests use relative URLs (`/api/...`)
- [ ] Vercel rewrites proxy requests to correct Railway backend
- [ ] WebSocket connections use direct Railway URLs
- [ ] No CORS errors in browser console

### ✅ Authentication Flow
- [ ] Registration creates user account on Railway backend
- [ ] Login returns valid JWT token
- [ ] Authenticated requests include Authorization header
- [ ] Token verification works correctly

### ✅ Error Handling
- [ ] Network errors display user-friendly messages
- [ ] Invalid credentials show appropriate error
- [ ] Expired tokens trigger re-authentication

## Debugging Information

### Key URLs to Monitor
- Registration: `POST /api/auth/register`
- Login: `POST /api/auth/login`  
- Token verification: `GET /api/auth/verify`
- Character data: `GET /api/character`

### Expected Response Patterns
```javascript
// Successful login response
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "username": "..." },
    "token": "eyJ..."
  }
}

// Error response
{
  "success": false,
  "error": "Invalid credentials"
}
```

### Common Issues to Check
- Double `/api/api` in request URLs (should be fixed)
- CORS errors (should be resolved with proper rewrites)
- 404 errors on auth endpoints (check Railway deployment status)
- Environment variables not being passed to frontend

## Next Steps After Testing
1. Document any issues found
2. Update TASK.md with test results
3. Create production deployment if tests pass
4. Set up monitoring for authentication endpoints
