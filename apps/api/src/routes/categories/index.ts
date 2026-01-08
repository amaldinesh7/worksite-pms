import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { organizationMiddleware } from '../../middleware/organization.middleware';
import {
  createCategoryTypeSchema,
  updateCategoryTypeSchema,
  categoryTypeParamsSchema,
  categoryTypeKeyParamsSchema,
  createCategoryItemSchema,
  updateCategoryItemSchema,
  categoryItemParamsSchema,
  categoryItemTypeKeyParamsSchema,
  categoryQuerySchema,
} from './category.schema';
import * as typeController from './category-type.controller';
import * as itemController from './category-item.controller';

export default async function categoryRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.addHook('preHandler', organizationMiddleware);

  // ============================================
  // Category Types
  // ============================================

  // GET /api/categories/types
  app.get(
    '/types',
    { schema: { querystring: categoryQuerySchema } },
    typeController.listCategoryTypes
  );

  // GET /api/categories/types/key/:key
  app.get(
    '/types/key/:key',
    { schema: { params: categoryTypeKeyParamsSchema } },
    typeController.getCategoryTypeByKey
  );

  // GET /api/categories/types/:id
  app.get(
    '/types/:id',
    { schema: { params: categoryTypeParamsSchema } },
    typeController.getCategoryType
  );

  // POST /api/categories/types
  app.post(
    '/types',
    { schema: { body: createCategoryTypeSchema } },
    typeController.createCategoryType
  );

  // PUT /api/categories/types/:id
  app.put(
    '/types/:id',
    { schema: { params: categoryTypeParamsSchema, body: updateCategoryTypeSchema } },
    typeController.updateCategoryType
  );

  // DELETE /api/categories/types/:id
  app.delete(
    '/types/:id',
    { schema: { params: categoryTypeParamsSchema } },
    typeController.deleteCategoryType
  );

  // ============================================
  // Category Items
  // ============================================

  // GET /api/categories/items/type/:typeKey
  app.get(
    '/items/type/:typeKey',
    {
      schema: {
        params: categoryItemTypeKeyParamsSchema,
        querystring: categoryQuerySchema,
      },
    },
    itemController.listCategoryItemsByTypeKey
  );

  // GET /api/categories/items/:id
  app.get(
    '/items/:id',
    { schema: { params: categoryItemParamsSchema } },
    itemController.getCategoryItem
  );

  // POST /api/categories/items
  app.post(
    '/items',
    { schema: { body: createCategoryItemSchema } },
    itemController.createCategoryItem
  );

  // PUT /api/categories/items/:id
  app.put(
    '/items/:id',
    { schema: { params: categoryItemParamsSchema, body: updateCategoryItemSchema } },
    itemController.updateCategoryItem
  );

  // DELETE /api/categories/items/:id
  app.delete(
    '/items/:id',
    { schema: { params: categoryItemParamsSchema } },
    itemController.deleteCategoryItem
  );
}
