#!/bin/bash

# Test CORS configuration for Vercel preview URLs
echo "🧪 Testing CORS Configuration for Vercel Preview URLs"
echo "====================================================="

API_URL="https://tactical-operator-api.up.railway.app"
PREVIEW_ORIGIN="https://tactical-operators-web-client-no8bwmjbj-amsteffensens-projects.vercel.app"

echo "🌐 Testing CORS preflight request..."
echo "Origin: $PREVIEW_ORIGIN"
echo "API: $API_URL"
echo ""

# Test preflight request (OPTIONS)
echo "📋 Preflight Request (OPTIONS):"
curl -X OPTIONS \
  -H "Origin: $PREVIEW_ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v \
  "$API_URL/api/auth/register" \
  2>&1 | grep -E "(Access-Control|HTTP/|Origin)"

echo ""
echo "📋 Actual POST Request:"
curl -X POST \
  -H "Origin: $PREVIEW_ORIGIN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"TestPassword123"}' \
  -v \
  "$API_URL/api/auth/register" \
  2>&1 | head -20 | grep -E "(Access-Control|HTTP/|Origin|CORS)"

echo ""
echo "🔍 Health Check (should work without CORS):"
curl -s "$API_URL/health" | jq -r '.status // "No response"'

echo ""
echo "ℹ️  Note: If CORS is working, you should see Access-Control-Allow-Origin headers"
echo "ℹ️  The actual registration might fail due to duplicate users, but CORS should pass"
