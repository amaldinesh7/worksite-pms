import type { FastifyReply, FastifyRequest } from 'fastify';
import { categoryTypeRepository } from '../../repositories/category.repository';
import { createErrorHandler } from '../../lib/error-handler';
import { sendSuccess, sendNotFound, sendNoContent } from '../../lib/response.utils';
import type {
  CreateCategoryTypeInput,
  UpdateCategoryTypeInput,
  CategoryTypeParams,
  CategoryTypeKeyParams,
  CategoryQuery,
} from './category.schema';

const handle = createErrorHandler('category type');

// ============================================
// List Category Types (global types with org-scoped items)
// ============================================
export const listCategoryTypes = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: CategoryQuery }>, reply: FastifyReply) => {
    // Get global types with items filtered by organization
    const categoryTypes = await categoryTypeRepository.findAllWithOrgItems(
      request.organizationId,
      { includeInactive: request.query.includeInactive }
    );

    return sendSuccess(reply, categoryTypes);
  }
);

// ============================================
// Get Category Type by ID (global)
// ============================================
export const getCategoryType = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: CategoryTypeParams }>, reply: FastifyReply) => {
    const categoryType = await categoryTypeRepository.findById(request.params.id);

    if (!categoryType) {
      return sendNotFound(reply, 'Category type');
    }

    return sendSuccess(reply, categoryType);
  }
);

// ============================================
// Get Category Type by Key (global)
// ============================================
export const getCategoryTypeByKey = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: CategoryTypeKeyParams }>, reply: FastifyReply) => {
    const categoryType = await categoryTypeRepository.findByKey(request.params.key);

    if (!categoryType) {
      return sendNotFound(reply, 'Category type');
    }

    return sendSuccess(reply, categoryType);
  }
);

// ============================================
// Create Category Type (global - admin only)
// ============================================
export const createCategoryType = handle(
  'create',
  async (request: FastifyRequest<{ Body: CreateCategoryTypeInput }>, reply: FastifyReply) => {
    const categoryType = await categoryTypeRepository.create(request.body);

    return sendSuccess(reply, categoryType, 201);
  }
);

// ============================================
// Update Category Type (global - admin only)
// ============================================
export const updateCategoryType = handle(
  'update',
  async (
    request: FastifyRequest<{
      Params: CategoryTypeParams;
      Body: UpdateCategoryTypeInput;
    }>,
    reply: FastifyReply
  ) => {
    const categoryType = await categoryTypeRepository.update(request.params.id, request.body);

    return sendSuccess(reply, categoryType);
  }
);

// ============================================
// Delete Category Type (global - admin only)
// ============================================
export const deleteCategoryType = handle(
  'delete',
  async (request: FastifyRequest<{ Params: CategoryTypeParams }>, reply: FastifyReply) => {
    await categoryTypeRepository.delete(request.params.id);
    return sendNoContent(reply);
  }
);
