# 🐳 Docker Setup Guide

This document explains how to use Docker for Tactical Operator development.

## 🎯 Quick Start with Docker Database

The easiest way to get started is to use Docker only for the PostgreSQL database while running the application locally:

### 1. Start the Database

```bash
# Start only the PostgreSQL database
npm run docker:db

# Check if it's running
docker ps
```

### 2. Configure Environment

Update your `api-server/.env` file:

```env
# Use this for Docker database
DATABASE_URL="postgresql://tactical_user:tactical_password@localhost:5432/tactical_operator"
```

### 3. Run Migrations

```bash
cd api-server
npm run db:migrate
npm run db:seed
```

### 4. Start Development

```bash
# In the root directory
npm run dev
```

### 5. Stop the Database

```bash
npm run docker:db:down
```

## 🚀 Full Docker Development

For a complete containerized development environment:

### 1. Build and Start All Services

```bash
# Build and start all services (database, API, web client)
npm run docker:dev
```

This will start:
- PostgreSQL on `localhost:5432`
- API Server on `localhost:5000`
- Web Client on `localhost:3000`
- Redis on `localhost:6379`

### 2. View Logs

```bash
# View all logs
npm run docker:dev:logs

# View database logs only
npm run docker:db:logs
```

### 3. Stop All Services

```bash
npm run docker:dev:down
```

## 🗄️ Database Management

### Access Database

```bash
# Connect to the PostgreSQL database
docker exec -it tactical-operator-db-dev psql -U tactical_user -d tactical_operator

# Or using a GUI tool like pgAdmin
# Host: localhost
# Port: 5432
# Database: tactical_operator
# Username: tactical_user
# Password: tactical_password
```

### Database Operations

```bash
# Run migrations inside container
docker exec -it tactical-operator-api npm run db:migrate

# Seed database
docker exec -it tactical-operator-api npm run db:seed

# Reset database
docker exec -it tactical-operator-api npm run db:reset
```

### Backup and Restore

```bash
# Backup database
docker exec tactical-operator-db-dev pg_dump -U tactical_user tactical_operator > backup.sql

# Restore database
docker exec -i tactical-operator-db-dev psql -U tactical_user tactical_operator < backup.sql
```

## 🔧 Docker Commands Reference

### Database Only

```bash
npm run docker:db           # Start PostgreSQL container
npm run docker:db:down      # Stop PostgreSQL container
npm run docker:db:logs      # View PostgreSQL logs
```

### Full Development Environment

```bash
npm run docker:dev          # Start all services
npm run docker:dev:down     # Stop all services
npm run docker:dev:logs     # View all logs
npm run docker:build        # Rebuild containers
```

### Manual Docker Commands

```bash
# Start database only
docker-compose -f docker-compose.dev.yml up -d

# Start all services with live reload
docker-compose --profile full up -d

# View specific service logs
docker-compose logs -f postgres
docker-compose logs -f api-server
docker-compose logs -f web-client

# Rebuild specific service
docker-compose build api-server

# Execute commands in running containers
docker exec -it tactical-operator-api bash
docker exec -it tactical-operator-db-dev psql -U tactical_user
```

## 🐛 Troubleshooting

### Port Conflicts

If you get port conflicts:

```bash
# Check what's using the port
lsof -i :5432  # PostgreSQL
lsof -i :5000  # API Server
lsof -i :3000  # Web Client

# Stop conflicting services
sudo pkill -f postgres  # If local PostgreSQL is running
```

### Database Connection Issues

```bash
# Check if database is ready
docker exec tactical-operator-db-dev pg_isready -U tactical_user

# Reset database container
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Container Issues

```bash
# Remove all containers and volumes (DESTRUCTIVE)
docker-compose down -v --rmi all

# Clean up Docker system
docker system prune -a
```

### Permission Issues

```bash
# Fix ownership of files (if running on Linux)
sudo chown -R $USER:$USER .
```

## 📊 Development Workflows

### Recommended: Hybrid Approach

For most development, we recommend:

1. **Use Docker for database only**: `npm run docker:db`
2. **Run API and Web client locally**: `npm run dev`

This gives you:
- ✅ Consistent database environment
- ✅ Fast hot reloading
- ✅ Easy debugging
- ✅ Native IDE integration

### Full Docker Approach

Use `npm run docker:dev` when you need:
- Complete environment isolation
- Testing deployment-like setup
- Sharing exact environment with team
- CI/CD pipeline testing

## 🏭 Production Deployment

For production deployment, see the main README.md. The Docker setup includes:

- Multi-stage builds for optimization
- Health checks for all services
- Proper networking and security
- Volume management for data persistence
- Environment-specific configurations

## 📝 Environment Variables

### Docker Database Configuration

```env
# Docker Compose Environment
POSTGRES_DB=tactical_operator
POSTGRES_USER=tactical_user
POSTGRES_PASSWORD=tactical_password

# Application Environment (api-server/.env)
DATABASE_URL=postgresql://tactical_user:tactical_password@localhost:5432/tactical_operator
```

### Volume Management

Docker volumes are used for data persistence:

- `postgres_dev_data`: Database data
- `redis_data`: Redis cache (if using full setup)

These volumes persist data between container restarts but can be removed with:

```bash
docker-compose down -v  # REMOVES ALL DATA
```

---

This Docker setup provides a flexible development environment that can scale from simple database hosting to full containerized development!
