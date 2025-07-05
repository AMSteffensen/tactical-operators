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

const app = express();
const server = createServer(app);

// Trust proxy for Railway/production deployments
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);  
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
    // Initialize database schema at startup (when DATABASE_URL is available)
    if (process.env.DATABASE_URL) {
      console.log('🗄️ Initializing database schema...');
      const { execSync } = await import('child_process');
      try {
        execSync('npx prisma db push --schema=./prisma/schema.prisma', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        console.log('✅ Database schema synchronized');
      } catch (dbError) {
        console.warn('⚠️ Database schema sync failed (may already exist):', dbError);
        // Don't exit - server can still start for non-DB endpoints
      }
    } else {
      console.warn('⚠️ DATABASE_URL not available - skipping database initialization');
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
