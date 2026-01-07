import Fastify from 'fastify';
import cors from '@fastify/cors';
import 'dotenv/config';

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173']
});

fastify.get('/health', async () => ({ status: 'ok' }));
fastify.get('/api/hello', async () => ({ message: 'Hello from API!' }));

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Server at http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
