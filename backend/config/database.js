const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  // Add connection pooling for better stability
  pool: {
    min: 2,
    max: 10,
  }
});

const prisma = new PrismaClient({
  adapter,
  // Disable query logging in production
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'minimal'
});

// Test database connection with retry logic
async function testConnection() {
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect();
      console.log('Connected to PostgreSQL database via Prisma');
      return;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1}/${maxRetries} failed:`, error.message);
      
      if (i < maxRetries - 1) {
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error('Failed to connect to database after maximum retries');
        process.exit(1);
      }
    }
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

testConnection();

module.exports = prisma;