import Fastify, { FastifyError, FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';

// Route imports
import organizationRoutes from './routes/organizations/index';
import userRoutes from './routes/users/index';
import projectRoutes from './routes/projects/index';
import categoryRoutes from './routes/categories/index';
import partyRoutes from './routes/parties/index';
import expenseRoutes from './routes/expenses/index';
import paymentRoutes from './routes/payments/index';
import stageRoutes from './routes/stages/index';
import taskRoutes from './routes/tasks/index';
import documentRoutes from './routes/documents/index';
import authRoutes from './routes/auth/index';
import permissionRoutes from './routes/permissions/index';
import roleRoutes from './routes/roles/index';
import teamRoutes from './routes/team/index';

// Middleware
import { registerAuthMiddleware } from './middleware/auth.middleware';

// Prisma
import { disconnectPrisma } from './lib/prisma';

export interface AppOptions {
  logger?: boolean;
}

export async function buildApp(options: AppOptions = {}) {
  const app = Fastify({
    logger: options.logger ?? true,
  });

  // Configure Zod type provider BEFORE anything else
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Get typed fastify instance
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  // Cookie plugin - must be registered before routes that use cookies
  await fastify.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'your-cookie-secret-change-in-production',
    parseOptions: {},
  });

  // CORS configuration - allow credentials for httpOnly cookie auth
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true, // Allow cookies to be sent cross-origin
  });

  // Register auth middleware (JWT plugin + authenticate decorator)
  await registerAuthMiddleware(app);

  // Health check
  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // API info
  fastify.get('/api', async () => ({
    name: 'Construction PMS API',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/organizations',
      '/api/users',
      '/api/projects',
      '/api/categories',
      '/api/parties',
      '/api/expenses',
      '/api/payments',
      '/api/stages',
      '/api/tasks',
      '/api/documents',
      '/api/permissions',
      '/api/roles',
      '/api/team',
    ],
  }));

  // Register routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(organizationRoutes, { prefix: '/api/organizations' });
  await fastify.register(userRoutes, { prefix: '/api/users' });
  await fastify.register(projectRoutes, { prefix: '/api/projects' });
  await fastify.register(categoryRoutes, { prefix: '/api/categories' });
  await fastify.register(partyRoutes, { prefix: '/api/parties' });
  await fastify.register(expenseRoutes, { prefix: '/api/expenses' });
  await fastify.register(paymentRoutes, { prefix: '/api/payments' });
  await fastify.register(stageRoutes, { prefix: '/api/stages' });
  await fastify.register(taskRoutes, { prefix: '/api/tasks' });
  await fastify.register(documentRoutes, { prefix: '/api/documents' });
  await fastify.register(permissionRoutes, { prefix: '/api/permissions' });
  await fastify.register(roleRoutes, { prefix: '/api/roles' });
  await fastify.register(teamRoutes, { prefix: '/api/team' });

  // Global error handler
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    fastify.log.error(error);

    // Handle Zod validation errors from fastify-type-provider-zod
    if (error.validation) {
      return reply.code(400).send({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.validation,
        },
      });
    }

    // Handle other errors
    return reply.code(error.statusCode || 500).send({
      success: false,
      error: {
        message: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  });

  // Graceful shutdown
  app.addHook('onClose', async () => {
    await disconnectPrisma();
  });

  return app;
}

// For backwards compatibility
export const build = buildApp;

// Export type for use in routes
export type FastifyZod = ReturnType<typeof buildApp> extends Promise<infer T> ? T : never;
