/**
 * Environment Configuration
 *
 * Centralized environment variable access with type safety.
 */

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Validate required secrets
function getRequiredSecret(name: string, fallback?: string): string {
  const value = process.env[name];

  if (value) {
    return value;
  }

  if (isProduction) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `This secret must be set in production for security.`
    );
  }

  // In non-production, allow fallback but warn
  if (fallback) {
    console.warn(
      `WARNING: ${name} is not set. Using insecure default value. ` +
        `Set ${name} environment variable before deploying to production.`
    );
    return fallback;
  }

  throw new Error(
    `Missing required environment variable: ${name}. ` +
      `Set this in your .env file for local development.`
  );
}

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '3000', 10),
  HOST: process.env.HOST || '0.0.0.0',

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // Auth - secrets are REQUIRED in production, warn in development
  JWT_SECRET: getRequiredSecret(
    'JWT_SECRET',
    isProduction ? undefined : 'dev-jwt-secret-do-not-use-in-production'
  ),
  COOKIE_SECRET: getRequiredSecret(
    'COOKIE_SECRET',
    isProduction ? undefined : 'dev-cookie-secret-do-not-use-in-production'
  ),

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],

  // OpenAI (for PDF parsing)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // Feature flags
  get isPDFImportEnabled(): boolean {
    return !!this.OPENAI_API_KEY;
  },
};
