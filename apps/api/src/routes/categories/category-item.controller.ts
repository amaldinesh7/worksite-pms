import type { FastifyReply, FastifyRequest } from 'fastify';
import { categoryItemRepository } from '../../repositories/category.repository';
import { createErrorHandler } from '../../lib/error-handler';
import { sendSuccess, sendNotFound, sendNoContent } from '../../lib/response.utils';
import type {
  CreateCategoryItemInput,
  UpdateCategoryItemInput,
  CategoryItemParams,
  CategoryItemTypeKeyParams,
  CategoryQuery,
} from './category.schema';

const handle = createErrorHandler('category item');

// ============================================
// List Category Items by Type Key
// ============================================
export const listCategoryItemsByTypeKey = handle(
  'fetch',
  async (
    request: FastifyRequest<{
      Params: CategoryItemTypeKeyParams;
      Querystring: CategoryQuery;
    }>,
    reply: FastifyReply
  ) => {
    const items = await categoryItemRepository.findByTypeKey(
      request.organizationId,
      request.params.typeKey,
      { includeInactive: request.query.includeInactive }
    );

    return sendSuccess(reply, items);
  }
);

// ============================================
// Get Category Item by ID
// ============================================
export const getCategoryItem = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: CategoryItemParams }>, reply: FastifyReply) => {
    const item = await categoryItemRepository.findById(request.organizationId, request.params.id);

    if (!item) {
      return sendNotFound(reply, 'Category item');
    }

    return sendSuccess(reply, item);
  }
);

// ============================================
// Create Category Item
// ============================================
export const createCategoryItem = handle(
  'create',
  async (request: FastifyRequest<{ Body: CreateCategoryItemInput }>, reply: FastifyReply) => {
    const item = await categoryItemRepository.create(request.organizationId, request.body);

    return sendSuccess(reply, item, 201);
  }
);

// ============================================
// Update Category Item
// ============================================
export const updateCategoryItem = handle(
  'update',
  async (
    request: FastifyRequest<{
      Params: CategoryItemParams;
      Body: UpdateCategoryItemInput;
    }>,
    reply: FastifyReply
  ) => {
    const item = await categoryItemRepository.update(
      request.organizationId,
      request.params.id,
      request.body
    );

    return sendSuccess(reply, item);
  }
);

// ============================================
// Delete Category Item
// ============================================
export const deleteCategoryItem = handle(
  'delete',
  async (request: FastifyRequest<{ Params: CategoryItemParams }>, reply: FastifyReply) => {
    await categoryItemRepository.delete(request.organizationId, request.params.id);
    return sendNoContent(reply);
  }
);
