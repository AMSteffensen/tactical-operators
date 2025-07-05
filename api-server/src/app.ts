import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { authRoutes } from './routes/auth.js';
import { characterRoutes } from './routes/character.js';
import { guildRoutes } from './routes/guild.js';
import { campaignRoutes } from './routes/campaign.js';
import { setupSocketHandlers } from './sockets/index.js';

// Load environment variables
dotenv.config();

// Enhanced debugging for Railway deployment
console.log('🔍 Environment Debug Info:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? `SET (${process.env.DATABASE_URL.substring(0, 20)}...)` : 'NOT SET');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? `SET (${process.env.JWT_SECRET.substring(0, 10)}...)` : 'NOT SET');
console.log('- CORS_ORIGIN:', process.env.CORS_ORIGIN || 'DEFAULT');

// List all environment variables that start with common prefixes
console.log('🌍 All Environment Variables:');
const envVars = Object.keys(process.env).sort();
envVars.forEach(key => {
  if (key.startsWith('DATABASE') || key.startsWith('POSTGRES') || key.startsWith('JWT') || key.startsWith('NODE') || key.startsWith('PORT') || key.startsWith('CORS')) {
    const value = process.env[key];
    if (value && value.length > 20) {
      console.log(`- ${key}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`- ${key}: ${value}`);
    }
  }
});

// Check for Railway-specific variables
console.log('🚂 Railway-specific Variables:');
const railwayVars = envVars.filter(key => key.startsWith('RAILWAY') || key.includes('POSTGRES') || key.includes('DATABASE'));
railwayVars.forEach(key => {
  const value = process.env[key];
  if (value && value.length > 30) {
    console.log(`- ${key}: ${value.substring(0, 30)}...`);
  } else {
    console.log(`- ${key}: ${value}`);
  }
});

const app = express();
const server = createServer(app);

// Trust proxy for Railway/production deployments
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);  
  console.log('✅ Trust proxy enabled for production');
}


// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CSRF Protection (disabled for API-first applications using JWT)
// For web applications with forms, uncomment and configure:
// import csrf from 'csurf';
// const csrfProtection = csrf({ cookie: { sameSite: 'strict', secure: process.env.NODE_ENV === 'production' } });
// app.use(csrfProtection);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint for Railway troubleshooting (remove in production)
app.get('/debug/env', (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    return res.status(404).json({ error: 'Debug endpoint only available in production for Railway troubleshooting' });
  }
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      CORS_ORIGIN: process.env.CORS_ORIGIN,
    },
    railwayVars: {} as Record<string, string | undefined>
  };
  
  // Add Railway-specific variables
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('RAILWAY') || key.includes('POSTGRES') || key.includes('DATABASE')) {
      const value = process.env[key];
      if (value && value.length > 30) {
        debugInfo.railwayVars[key] = value.substring(0, 30) + '...';
      } else {
        debugInfo.railwayVars[key] = value;
      }
    }
  });
  
  res.json(debugInfo);
});

// Root endpoint - API info
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Tactical Operator API Server',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      character: 'GET /api/character (requires auth)',
      guild: 'GET /api/guild (requires auth)',
      campaign: 'GET /api/campaign (requires auth)'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/guild', guildRoutes);
app.use('/api/campaign', campaignRoutes);

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

// Enhanced server startup with error handling
const startServer = async () => {
  try {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 Socket.IO enabled`);
    });
  } catch (error) {
    console.error(`❌ Failed to start server on port ${PORT}:`, error);
    process.exit(1);
  }
};

// Handle server errors
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.log(`💡 Tip: Use 'npm run dev:smart' for automatic port management`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

startServer();

export { app, io };
