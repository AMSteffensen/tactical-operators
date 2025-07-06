#!/bin/bash

# Dynamic Vercel configuration script
# This script updates vercel.json based on the current Git branch

echo "🔧 Configuring Vercel for current environment..."

# Get current branch name
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
echo "📋 Current branch: $BRANCH_NAME"

# Determine Railway URL based on branch
if [[ "$BRANCH_NAME" == "main" || "$BRANCH_NAME" == "master" ]]; then
    RAILWAY_URL="https://tactical-operator-api.up.railway.app"
    echo "🌍 Using production Railway URL: $RAILWAY_URL"
elif [[ "$BRANCH_NAME" == "feature/authentication-system" ]]; then
    RAILWAY_URL="https://tactical-operators-tactical-operators-pr-4.up.railway.app"
    echo "🧪 Using PR-4 Railway URL: $RAILWAY_URL"
else
    # Try to extract PR number from branch name
    PR_NUMBER=$(echo "$BRANCH_NAME" | grep -oE 'pr-?([0-9]+)' | grep -oE '[0-9]+')
    if [[ -n "$PR_NUMBER" ]]; then
        RAILWAY_URL="https://tactical-operators-tactical-operators-pr-${PR_NUMBER}.up.railway.app"
        echo "🧪 Using PR-${PR_NUMBER} Railway URL: $RAILWAY_URL"
    else
        RAILWAY_URL="https://tactical-operator-api.up.railway.app"
        echo "⚠️  Unknown branch pattern, using production Railway URL: $RAILWAY_URL"
    fi
fi

# Create temporary vercel.json with the correct URL
cp vercel.json vercel.json.backup

# Replace Railway URLs in vercel.json
sed -i.tmp "s|https://tactical-operator-api\.up\.railway\.app|${RAILWAY_URL}|g" vercel.json
sed -i.tmp "s|https://tactical-operators-tactical-operators-pr-[0-9]*\.up\.railway\.app|${RAILWAY_URL}|g" vercel.json

# Clean up temp files
rm -f vercel.json.tmp

echo "✅ Updated vercel.json with Railway URL: $RAILWAY_URL"
echo "📝 Backup saved as vercel.json.backup"

# Show the changes
echo "🔍 Vercel configuration preview:"
grep -A 2 -B 2 "destination.*railway" vercel.json || echo "No Railway URLs found in vercel.json"
