/**
 * Environment Configuration
 *
 * Centralized environment variable access with type safety.
 */

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '3000', 10),
  HOST: process.env.HOST || '0.0.0.0',

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // Auth
  JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-change-in-production',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'your-cookie-secret-change-in-production',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],

  // OpenAI (for PDF parsing)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // Feature flags
  get isPDFImportEnabled(): boolean {
    return !!this.OPENAI_API_KEY;
  },
};
