import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDevUser() {
  try {
    // Check if dev user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: 'dev-user-1' }
    });

    if (existingUser) {
      console.log('✅ Development user already exists:', existingUser);
      return existingUser;
    }

    // Create development user
    const devUser = await prisma.user.create({
      data: {
        id: 'dev-user-1',
        email: 'dev@tactical-operator.com',
        username: 'dev-user',
        password: 'dev-password-hash', // This would be properly hashed in production
      },
    });

    console.log('🎉 Created development user:', devUser);
    return devUser;
  } catch (error) {
    console.error('❌ Error creating development user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createDevUser()
  .then(() => {
    console.log('✅ Development user setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to setup development user:', error);
    process.exit(1);
  });
