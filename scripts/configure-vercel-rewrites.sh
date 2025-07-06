#!/bin/bash

# Update vercel.json rewrites based on environment variables
# This script runs during Vercel build to set the correct Railway URL

echo "🔧 Configuring Vercel rewrites for environment..."

PR_NUMBER=${VERCEL_GIT_PULL_REQUEST_ID}
VERCEL_ENV=${VERCEL_ENV}

echo "Environment: $VERCEL_ENV"
echo "PR Number: $PR_NUMBER"

# Determine Railway URL based on environment
if [ "$VERCEL_ENV" = "preview" ] && [ -n "$PR_NUMBER" ]; then
    RAILWAY_URL="https://tactical-operators-tactical-operators-pr-${PR_NUMBER}.up.railway.app"
    echo "Using PR Railway URL: $RAILWAY_URL"
elif [ "$VERCEL_ENV" = "production" ]; then
    RAILWAY_URL="https://tactical-operator-api.up.railway.app"
    echo "Using production Railway URL: $RAILWAY_URL"
else
    RAILWAY_URL="https://tactical-operator-api.up.railway.app"
    echo "Using default Railway URL: $RAILWAY_URL"
fi

# Update vercel.json with correct Railway URL
cat > vercel.json << EOF
{
  "version": 2,
  "name": "tactical-operator-web",
  "framework": "vite",
  "prebuildCommand": "./scripts/configure-vercel-rewrites.sh",
  "buildCommand": "npm ci && cd shared && npm run build && cd ../web-client && npm ci && npm run build",
  "outputDirectory": "web-client/dist",
  "installCommand": "npm ci",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "${RAILWAY_URL}/api/\$1"
    },
    {
      "source": "/socket.io/(.*)", 
      "destination": "${RAILWAY_URL}/socket.io/\$1"
    }
  ],
  "env": {
    "VITE_API_URL": "${RAILWAY_URL}",
    "VITE_SOCKET_URL": "${RAILWAY_URL}",
    "VITE_PR_NUMBER": "${PR_NUMBER}",
    "VITE_VERCEL_ENV": "${VERCEL_ENV}"
  },
  "build": {
    "env": {
      "VITE_API_URL": "${RAILWAY_URL}",
      "VITE_SOCKET_URL": "${RAILWAY_URL}",
      "VITE_PR_NUMBER": "${PR_NUMBER}",
      "VITE_VERCEL_ENV": "${VERCEL_ENV}"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options", 
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-src 'self' https://vercel.live; connect-src 'self' ${RAILWAY_URL} wss://${RAILWAY_URL#https://} https://vercel.live wss://vercel.live"
        }
      ]
    }
  ]
}
EOF

echo "✅ vercel.json updated with Railway URL: $RAILWAY_URL"
