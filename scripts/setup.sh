#!/bin/bash

# Tactical Operator Development Setup Script
echo "🎮 Setting up Tactical Operator development environment..."

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm version
NPM_VERSION=$(npm --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not found. Please install npm."
    exit 1
fi

# Check PostgreSQL (optional check)
PG_VERSION=$(psql --version 2>/dev/null)
DOCKER_VERSION=$(docker --version 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL: $PG_VERSION"
    HAS_POSTGRES=true
else
    echo "⚠️  PostgreSQL not found locally"
    HAS_POSTGRES=false
fi

if [ $? -eq 0 ]; then
    echo "✅ Docker: $DOCKER_VERSION"
    HAS_DOCKER=true
else
    echo "⚠️  Docker not found"
    HAS_DOCKER=false
fi

if [ "$HAS_POSTGRES" = false ] && [ "$HAS_DOCKER" = false ]; then
    echo "❌ You need either PostgreSQL or Docker for the database."
    echo "   Install Docker (recommended): https://docs.docker.com/get-docker/"
    echo "   Or install PostgreSQL: https://postgresql.org/download/"
    exit 1
fi

echo ""
echo "🔧 Installing dependencies..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install all workspace dependencies
echo "📦 Installing workspace dependencies..."
npm run install-all

echo ""
echo "🔧 Setting up environment files..."

# Copy environment example files if they don't exist
if [ ! -f "api-server/.env" ]; then
    cp api-server/.env.example api-server/.env
    echo "✅ Created api-server/.env (please configure database settings)"
else
    echo "ℹ️  api-server/.env already exists"
fi

if [ ! -f "web-client/.env" ]; then
    cp web-client/.env.example web-client/.env
    echo "✅ Created web-client/.env"
else
    echo "ℹ️  web-client/.env already exists"
fi

echo ""
echo "🎯 Next steps:"

if [ "$HAS_DOCKER" = true ]; then
    echo "📦 Docker Setup (Recommended):"
    echo "1. Start the database: npm run docker:db"
    echo "2. Update api-server/.env with Docker database URL:"
    echo "   DATABASE_URL=\"postgresql://tactical_user:tactical_password@localhost:5432/tactical_operator\""
    echo "3. Run database migrations: cd api-server && npm run db:migrate"
    echo "4. Start development: npm run dev"
    echo ""
fi

if [ "$HAS_POSTGRES" = true ]; then
    echo "🗄️  Local PostgreSQL Setup:"
    echo "1. Create a database named 'tactical_operator'"
    echo "2. Update api-server/.env with your database credentials"
    echo "3. Run database migrations: cd api-server && npm run db:migrate"
    echo "4. Start development: npm run dev"
    echo ""
fi

echo "📚 Documentation:"
echo "- README.md for full setup instructions"
echo "- docs/DOCKER.md for Docker setup details"
echo "- PLANNING.md for project architecture"
echo "- TASK.md for development tasks"
echo ""
echo "🚀 Ready to start development!"
