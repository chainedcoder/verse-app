import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

export default async function globalSetup() {
  console.log('Running database migrations and seed for tests...');
  
  // Load test environment variables
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
  
  // The DATABASE_URL in .env.test should be postgresql://steve@localhost:5432/posts_test
  if (!process.env.DATABASE_URL.includes('test')) {
    console.error('CRITICAL: DATABASE_URL does not seem to point to a test database.');
    process.exit(1);
  }

  // Push schema to test DB and force reset it
  execSync('npx prisma db push --force-reset --accept-data-loss', { stdio: 'inherit' });
  
  // Run seed script
  execSync('node prisma/seed.mjs', { stdio: 'inherit' });
}
