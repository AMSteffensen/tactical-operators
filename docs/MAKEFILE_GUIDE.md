# 🛠️ Makefile Usage Guide

## Overview

The project now includes a comprehensive Makefile that standardizes all development, build, and deployment operations. This eliminates the need to remember complex npm scripts and provides a consistent interface across all project components.

## Quick Start

```bash
# See all available commands
make help

# Quick development setup
make quick-start    # Starts database + development servers

# Build everything
make quick-build    # Builds and tests all packages

# Check code quality
make quick-check    # Type check + lint all packages
```

## Common Commands

### Development
```bash
make dev            # Start API + Web development servers
make dev-full       # Start Database + API + Web
make dev-web        # Start only web client
make dev-api        # Start only API server
make dev-mobile     # Start mobile app
```

### Building
```bash
make build          # Build all packages
make build-web      # Build web client only
make build-api      # Build API server only
make type-check     # TypeScript type checking
make lint           # Run linting on all packages
```

### Testing
```bash
make test           # Run all tests
make test-web       # Web client tests only
make test-api       # API server tests only
```

### Database & Docker
```bash
make docker-db      # Start PostgreSQL database
make docker-db-down # Stop database
make db-migrate     # Run database migrations
make db-studio      # Open Prisma Studio
```

### Maintenance
```bash
make status         # Check project health
make clean          # Clean all build artifacts and node_modules
make clean-soft     # Clean only build artifacts
make install        # Install all dependencies
```

## Benefits Over npm Scripts

### 1. **Unified Interface**
- Single command format: `make <command>`
- No need to remember different script names across packages
- Clear, descriptive command names

### 2. **Cross-Package Operations**
```bash
# Old way - multiple commands
cd web-client && npm run build
cd ../api-server && npm run build
cd ../shared && npm run build

# New way - single command
make build
```

### 3. **Error Handling**
- Commands fail fast with clear error messages
- Colored output for better visibility
- Status checks before operations

### 4. **Smart Dependencies**
```bash
# Automatically handles build order
make build          # Builds shared → api → web in correct order
make quick-start    # Starts DB then dev servers
make full-reset     # Clean → install → DB → migrate
```

### 5. **Development Shortcuts**
```bash
make quick-start    # Database + development servers
make quick-build    # Build + test everything
make quick-check    # Type check + lint
make fix-build      # Fix common build issues
make hybrid-test    # Test hybrid system specifically
```

## Command Categories

### Setup & Installation
- `make install` - Install all dependencies
- `make install-web/api/mobile/shared` - Install specific package
- `make clean` - Clean everything
- `make full-reset` - Complete reset and setup

### Development
- `make dev*` - Various development server combinations
- `make logs-*` - View logs for specific services
- `make quick-start` - Fast development setup

### Build & Test
- `make build*` - Build specific or all packages
- `make test*` - Run tests for specific or all packages
- `make lint*` - Linting for specific or all packages
- `make type-check*` - TypeScript checking

### Docker & Database
- `make docker-*` - Docker operations
- `make db-*` - Database operations
- `make quick-build` - Build with testing

### Utilities
- `make status` - Project health check
- `make info` - Project information
- `make help` - Command reference

## Troubleshooting

### Build Issues
```bash
make fix-build      # Attempts to fix common build problems
make type-check-web # Check specific TypeScript errors
make clean-soft     # Clean build artifacts only
```

### Development Issues
```bash
make status         # Check what's missing
make docker-db      # Ensure database is running
make install        # Reinstall dependencies
```

### Complete Reset
```bash
make full-reset     # Nuclear option - rebuilds everything
```

## Integration with Development Workflow

### Daily Development
```bash
# Morning startup
make quick-start

# Make changes, then verify
make quick-check

# Before committing
make quick-build
```

### CI/CD Integration
```bash
# In CI pipelines
make install
make quick-check
make build
make test
```

### Debugging
```bash
# Check what's wrong
make status

# View logs
make docker-logs
make logs-web
make logs-api
```

## Advanced Features

### Colored Output
- Blue: Informational messages
- Green: Success messages  
- Yellow: Warnings
- Red: Errors

### Smart Dependencies
Commands automatically run prerequisites:
- `make build` ensures shared package is built first
- `make dev-full` starts database before servers
- `make quick-start` handles proper startup sequence

### Environment Detection
- Checks for Node.js, npm, Docker availability
- Validates project structure
- Reports missing dependencies

## Conclusion

The Makefile provides a robust, standardized interface for all project operations. It eliminates the complexity of managing multiple npm scripts across different packages and provides clear, consistent commands for all development tasks.

**Key Benefits:**
- ✅ Single command interface
- ✅ Proper dependency handling
- ✅ Clear error reporting
- ✅ Colored, informative output
- ✅ Cross-platform compatibility
- ✅ Integration-ready commands
