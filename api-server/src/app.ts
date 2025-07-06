import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { authRoutes } from './routes/auth.js';
import { characterRoutes } from './routes/character.js';
import { guildRoutes } from './routes/guild.js';
import { campaignRoutes } from './routes/campaign.js';
import { setupSocketHandlers } from './sockets/index.js';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

const app = express();
const server = createServer(app);

// Trust proxy for Railway/production deployments
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);  
}


// Socket.IO setup with enhanced CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, native clients)
      if (!origin) return callback(null, true);
      
      // Define allowed origins for Socket.IO
      const socketAllowedOrigins = [
        'http://localhost:3000',
        'https://tactical-operator.vercel.app',
        'https://tactical-operators.vercel.app',
        'https://tactical-operators-web-client.vercel.app',
        process.env.SOCKET_CORS_ORIGIN,
      ].filter(Boolean);
      
      // Allow known origins
      if (socketAllowedOrigins.includes(origin)) {
        console.log(`✅ Socket.IO CORS allowed known origin: ${origin}`);
              return callback(null, true);
      }
      
      // Allow Vercel preview URLs
      if (origin.includes('.vercel.app')) {
        console.log(`✅ Socket.IO CORS allowed Vercel preview URL: ${origin}`);
        return callback(null, true);
      }
      
      console.warn(`🚫 Socket.IO CORS rejected origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// Security middleware
app.use(helmet());

// Enhanced CORS configuration for multiple environments
const allowedOrigins = [
  'http://localhost:3000', // Local development
  'https://tactical-operator.vercel.app', // Production Vercel
  'https://tactical-operators.vercel.app', // Alternative domain
  'https://tactical-operators-web-client.vercel.app', // Web client domain
  process.env.CORS_ORIGIN, // Environment-specific origin
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS allowed known origin: ${origin}`);
      return callback(null, true);
    }
    
    // Check if it's a Vercel preview URL (any subdomain of vercel.app)
    if (origin.includes('.vercel.app')) {
      console.log(`✅ CORS allowed Vercel preview URL: ${origin}`);
      return callback(null, true);
    }
    
    // Log rejected origins for debugging
    console.warn(`🚫 CORS rejected origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
}));

// Rate limiting (only in production)
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);
  console.log('🛡️ Rate limiting enabled for production');
} else {
  console.log('🔓 Rate limiting disabled for development');
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CSRF Protection (disabled for API-first applications using JWT)
// For web applications with forms, uncomment and configure:
// import csrf from 'csurf';
// const csrfProtection = csrf({ cookie: { sameSite: 'strict', secure: process.env.NODE_ENV === 'production' } });
// app.use(csrfProtection);

// Health check endpoint - Enhanced for monitoring and debugging
app.get('/health', async (req, res) => {
  try {
    // Basic health status
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'unknown',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      }
    };

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthData.database = 'connected';
    } catch (dbError) {
      healthData.database = 'disconnected';
      healthData.status = 'DEGRADED';
    }

    // Set appropriate status code
    const statusCode = healthData.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(healthData);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Test endpoint for staging environment verification
app.get('/test/status', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    branch: process.env.RAILWAY_GIT_BRANCH || 'unknown',
    commit: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 7) || 'unknown'
  });
});

// Root endpoint - API info
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Tactical Operator API Server',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      test: '/test/status',
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
    // Test database connection (but don't run migrations)
    if (process.env.DATABASE_URL) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connection established');
      } catch (dbError) {
        console.warn('⚠️ Database connection failed:', dbError);
        // Don't exit - server can still start for non-DB endpoints
      }
    } else {
      console.warn('⚠️ DATABASE_URL not available - database features disabled');
    }

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
