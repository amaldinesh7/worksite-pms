import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { organizationMiddleware } from '../../middleware/organization.middleware';
import * as controller from './document.controller';
import { documentQuerySchema, documentParamsSchema } from './document.schema';
import { z } from 'zod';

export default async function documentRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Note: multipart plugin is registered globally in app.ts

  // Apply organization middleware to all routes
  app.addHook('preHandler', organizationMiddleware);

  // GET /api/documents - List all documents
  app.get('/', {
    schema: { querystring: documentQuerySchema },
    handler: controller.listDocuments,
  });

  // GET /api/documents/:id - Get document by ID
  app.get('/:id', {
    schema: { params: documentParamsSchema },
    handler: controller.getDocument,
  });

  // GET /api/documents/:id/download - Get signed download URL
  app.get('/:id/download', {
    schema: { params: documentParamsSchema },
    handler: controller.getDownloadUrl,
  });

  // POST /api/documents - Upload document
  app.post('/', {
    schema: {
      querystring: z.object({
        projectId: z.string().min(1, 'Project ID is required'),
      }),
    },
    handler: controller.uploadDocument,
  });

  // DELETE /api/documents/:id - Delete document
  app.delete('/:id', {
    schema: { params: documentParamsSchema },
    handler: controller.deleteDocument,
  });
}
