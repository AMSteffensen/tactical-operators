# 🚀 PM2 Development Workflow Guide

This document explains how to use PM2 for enhanced development experience in the Tactical Operator project.

## 🎯 Why PM2?

**Benefits over traditional `npm run dev`:**
- ✅ **Automatic Restarts**: Services restart automatically on crashes
- ✅ **Centralized Logging**: All logs in one place with timestamps
- ✅ **Resource Monitoring**: CPU and memory usage tracking
- ✅ **Process Management**: Start/stop/restart individual services
- ✅ **Background Processes**: Services run in background, terminal stays free
- ✅ **Hot Reloading**: File watching with intelligent reloads
- ✅ **Production-like**: Same process manager used in production

## 🚀 Quick Start Commands

### Primary Development Workflow
```bash
# Start everything (database + all services)
npm run dev

# Check what's running
npm run dev:status

# View all logs in real-time
npm run dev:logs

# Stop everything
npm run stop

# Restart everything
npm run restart
```

### Individual Service Management
```bash
# Via Makefile (recommended)
make pm2-start          # Start all services
make pm2-status         # Show status
make pm2-logs-api       # API logs only
make pm2-logs-web       # Web client logs only
make pm2-stop           # Stop all services

# Via PM2 directly
pm2 restart tactical-api    # Restart just API
pm2 stop tactical-web       # Stop just web client
pm2 reload tactical-api     # Zero-downtime reload
```

## 📊 Process Monitoring

### Status Overview
```bash
npm run dev:status
```
Shows:
- Process ID and name
- Status (online/stopped/errored)
- CPU usage
- Memory usage
- Restart count

### Log Management
```bash
# All services
npm run dev:logs

# Specific services
make pm2-logs-api       # API server logs
make pm2-logs-web       # Web client logs  
make pm2-logs-db        # Database logs

# PM2 log files location
./logs/api.log          # API combined logs
./logs/web.log          # Web combined logs
./logs/database.log     # Database logs
```

## 🔧 Configuration

### Ecosystem File
The `ecosystem.config.json` defines all services:

```json
{
  "apps": [
    {
      "name": "tactical-database",
      "script": "docker-compose",
      "args": "-f docker-compose.dev.yml up postgres"
    },
    {
      "name": "tactical-api", 
      "script": "npm",
      "args": "run dev:smart",
      "cwd": "./api-server",
      "watch": ["src"],
      "ignore_watch": ["node_modules", "dist", "logs"]
    }
  ]
}
```

### Key Features
- **File Watching**: API server watches `src/` folder for changes
- **Smart Ports**: Uses the smart API starter for port conflict resolution
- **Memory Limits**: Automatic restart if memory usage exceeds limits
- **Log Rotation**: Prevents log files from growing too large

## 🔄 Development Workflows

### 1. Standard Development Day
```bash
# Morning startup
npm run dev
npm run dev:status    # Verify everything is running

# During development - services auto-restart on file changes
# Check logs if something goes wrong
npm run dev:logs

# End of day
npm run stop
```

### 2. Debugging Issues
```bash
# Check what's running
npm run dev:status

# View specific service logs
make pm2-logs-api

# Restart problematic service
pm2 restart tactical-api

# Full restart if needed
npm run restart
```

### 3. Fresh Environment Setup
```bash
# Clean reset
npm run reset          # Stops services, cleans, reinstalls, starts

# Or step by step
npm run stop
npm run clean
npm install
npm run dev
```

## 🆚 Comparison with Traditional Methods

| Feature | PM2 | Concurrently | Individual npm |
|---------|-----|--------------|----------------|
| Auto-restart | ✅ | ❌ | ❌ |
| Background processes | ✅ | ❌ | ❌ |
| Centralized logs | ✅ | ⚠️ | ❌ |
| Resource monitoring | ✅ | ❌ | ❌ |
| Individual control | ✅ | ❌ | ✅ |
| Production similarity | ✅ | ❌ | ❌ |

## 🚨 Troubleshooting

### Services Won't Start
```bash
# Check for port conflicts
npm run status

# Clean restart
npm run stop
npm run dev
```

### High Memory Usage
```bash
# Check memory usage
npm run dev:status

# Restart memory-heavy service
pm2 restart tactical-web
```

### Lost Terminal Session
PM2 processes survive terminal closures:
```bash
# Reconnect to existing processes
npm run dev:status
npm run dev:logs
```

### Complete Reset
```bash
# Nuclear option - clean everything
make pm2-delete
npm run clean
npm install
npm run dev
```

## 📈 Advanced Features

### Process Persistence
```bash
# Save current PM2 setup
npm run pm2:save

# Auto-start on system boot
npm run pm2:startup

# Restore saved processes
npm run pm2:resurrect
```

### Custom Monitoring
```bash
# Monitor specific metrics
pm2 monit

# Web-based monitoring
pm2 web
```

## 🎯 Best Practices

1. **Always use `npm run dev`** for starting development
2. **Check status regularly** with `npm run dev:status`
3. **Use specific log commands** when debugging
4. **Stop services** when not developing to save resources
5. **Use `npm run restart`** after major changes (package.json, config files)
6. **Monitor memory usage** - restart services if they grow too large

## 🔗 Quick Reference

| Task | Command |
|------|---------|
| Start development | `npm run dev` |
| Check status | `npm run dev:status` |
| View logs | `npm run dev:logs` |
| Stop everything | `npm run stop` |
| Restart everything | `npm run restart` |
| API logs only | `make pm2-logs-api` |
| Web logs only | `make pm2-logs-web` |
| Restart API only | `pm2 restart tactical-api` |
| Fresh start | `npm run reset` |

---

**💡 Pro Tip**: Keep a terminal tab open with `npm run dev:logs` running to monitor all services in real-time during development.
