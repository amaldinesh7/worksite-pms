import Fastify from 'fastify';
import cors from '@fastify/cors';

export interface AppOptions {
  logger?: boolean;
}

export async function buildApp(options: AppOptions = {}) {
  const fastify = Fastify({
    logger: options.logger ?? true,
  });

  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  });

  // Health check
  fastify.get('/health', async () => ({ status: 'ok' }));

  // API routes
  fastify.get('/api/hello', async () => ({ message: 'Hello from API!' }));

  return fastify;
}
