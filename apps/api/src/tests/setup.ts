/**
 * Vitest Global Setup - Test Database Isolation
 *
 * CRITICAL: Tests MUST run against an isolated test database.
 * This setup ensures tests NEVER touch the development or production database.
 *
 * Local: Uses 'worksite_test' database (created by docker-compose)
 * CI/GitHub: Uses PostgreSQL service container
 */

import { execSync } from 'child_process';
import { beforeAll, afterAll } from 'vitest';

// ============================================
// STRICT DATABASE ISOLATION
// ============================================

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://myuser:mypassword@localhost:5433/worksite_test';

/**
 * SAFETY CHECK: Verify we're using a test database.
 * Tests will FAIL IMMEDIATELY if trying to use a non-test database.
 */
function enforceTestDatabaseOnly(): void {
  const dbUrl = TEST_DATABASE_URL.toLowerCase();

  // Must contain 'test' in database name
  const isTestDb =
    dbUrl.includes('worksite_test') ||
    dbUrl.includes('_test') ||
    dbUrl.includes('-test') ||
    process.env.CI === 'true'; // CI environments are always safe

  if (!isTestDb) {
    console.error('\n🚨 FATAL: Refusing to run tests against non-test database!');
    console.error('   Database URL:', dbUrl.replace(/:[^:@]+@/, ':****@'));
    console.error('   Tests require a database with "test" in its name.');
    console.error('\n   To fix:');
    console.error('   - Local: Run `docker-compose down && docker-compose up -d`');
    console.error('   - Then: `pnpm db:test:setup`');
    process.exit(1);
  }
}

// Run safety check IMMEDIATELY before anything else
enforceTestDatabaseOnly();

// Override DATABASE_URL for Prisma
process.env.DATABASE_URL = TEST_DATABASE_URL;

console.log('\n🧪 Test Database:', TEST_DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
console.log('   Environment:', process.env.CI ? 'CI (GitHub Actions)' : 'Local');

/**
 * Global setup - runs once before all test files
 */
beforeAll(async () => {
  console.log('🔧 Setting up test database schema...');

  try {
    // Push schema to test database (creates tables without migrations)
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: 'pipe',
    });
    console.log('✅ Test database schema synchronized');
  } catch (error) {
    console.error('❌ Failed to setup test database.');
    console.error('   Make sure the test database exists and is accessible.');
    console.error('   Run: docker-compose up -d && pnpm db:test:setup');
    throw error;
  }
});

/**
 * Global teardown - runs once after all test files
 */
afterAll(async () => {
  const { prisma } = await import('../lib/prisma');
  await prisma.$disconnect();
  console.log('\n✅ Test database connection closed');
});
