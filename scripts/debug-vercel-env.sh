#!/bin/bash

# Debug script to show all available environment variables during Vercel build
echo "🔍 Vercel Build Environment Debug"
echo "================================="

echo ""
echo "📋 Key Environment Variables:"
echo "VERCEL: $VERCEL"
echo "VERCEL_ENV: $VERCEL_ENV"
echo "VERCEL_URL: $VERCEL_URL"
echo "VERCEL_BRANCH_URL: $VERCEL_BRANCH_URL"
echo "VERCEL_GIT_PROVIDER: $VERCEL_GIT_PROVIDER"
echo "VERCEL_GIT_REPO_SLUG: $VERCEL_GIT_REPO_SLUG"
echo "VERCEL_GIT_REPO_OWNER: $VERCEL_GIT_REPO_OWNER"
echo "VERCEL_GIT_REPO_ID: $VERCEL_GIT_REPO_ID"
echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"
echo "VERCEL_GIT_COMMIT_SHA: $VERCEL_GIT_COMMIT_SHA"
echo "VERCEL_GIT_COMMIT_MESSAGE: $VERCEL_GIT_COMMIT_MESSAGE"
echo "VERCEL_GIT_COMMIT_AUTHOR_LOGIN: $VERCEL_GIT_COMMIT_AUTHOR_LOGIN"
echo "VERCEL_GIT_COMMIT_AUTHOR_NAME: $VERCEL_GIT_COMMIT_AUTHOR_NAME"
echo "VERCEL_GIT_PULL_REQUEST_ID: $VERCEL_GIT_PULL_REQUEST_ID"

echo ""
echo "📋 All Environment Variables (filtered for Vercel/Vite):"
env | grep -E "(VERCEL|VITE)" | sort

echo ""
echo "🔧 Determining deployment type..."

if [ "$VERCEL_ENV" = "production" ]; then
    echo "✅ Production deployment detected"
elif [ "$VERCEL_ENV" = "preview" ]; then
    echo "✅ Preview deployment detected"
    if [ -n "$VERCEL_GIT_PULL_REQUEST_ID" ]; then
        echo "   📌 PR ID: $VERCEL_GIT_PULL_REQUEST_ID"
    else
        echo "   📌 No PR ID (branch deployment)"
    fi
elif [ "$VERCEL_ENV" = "development" ]; then
    echo "✅ Development deployment detected"
else
    echo "❓ Unknown deployment type: $VERCEL_ENV"
fi
