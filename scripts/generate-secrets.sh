#!/bin/bash

# 🔐 Generate Production Secrets

echo "🔐 Production Secret Generator"
echo "============================="
echo ""

echo "🔑 JWT Secret (64-character hex):"
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "JWT_SECRET=${JWT_SECRET}"
echo ""

echo "🔒 Database Password (16-character base64):"
DB_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(16).toString('base64').replace(/[+/=]/g, ''))")
echo "DB_PASSWORD=${DB_PASSWORD}"
echo ""

echo "🗝️  API Key (32-character hex):"
API_KEY=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
echo "API_KEY=${API_KEY}"
echo ""

echo "⚠️  IMPORTANT: Save these secrets securely!"
echo "   - Use JWT_SECRET for Railway JWT_SECRET"
echo "   - Use DB_PASSWORD if setting up custom database"
echo "   - Never commit these to git"
echo "   - Store in Railway/Vercel dashboards only"
