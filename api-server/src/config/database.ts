import { PrismaClient } from '@prisma/client';

// Database connection debugging
console.log('🗄️  Database Connection Debug:');
console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  // Parse URL safely to show connection details without exposing credentials
  try {
    const urlObj = new URL(url);
    console.log('- Database Host:', urlObj.hostname);
    console.log('- Database Port:', urlObj.port);
    console.log('- Database Name:', urlObj.pathname.substring(1));
    console.log('- Database Protocol:', urlObj.protocol);
  } catch (error) {
    console.log('- DATABASE_URL format error:', error);
  }
} else {
  console.log('❌ DATABASE_URL is not set!');
  console.log('- Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES')));
}

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test database connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    console.error('- Error code:', error.code);
    console.error('- Error details:', error);
  });

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
