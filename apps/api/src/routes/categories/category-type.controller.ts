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
// List Category Types
// ============================================
export const listCategoryTypes = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: CategoryQuery }>, reply: FastifyReply) => {
    const categoryTypes = await categoryTypeRepository.findAll(request.organizationId, {
      includeInactive: request.query.includeInactive,
    });

    return sendSuccess(reply, categoryTypes);
  }
);

// ============================================
// Get Category Type by ID
// ============================================
export const getCategoryType = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: CategoryTypeParams }>, reply: FastifyReply) => {
    const categoryType = await categoryTypeRepository.findById(
      request.organizationId,
      request.params.id
    );

    if (!categoryType) {
      return sendNotFound(reply, 'Category type');
    }

    return sendSuccess(reply, categoryType);
  }
);

// ============================================
// Get Category Type by Key
// ============================================
export const getCategoryTypeByKey = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: CategoryTypeKeyParams }>, reply: FastifyReply) => {
    const categoryType = await categoryTypeRepository.findByKey(
      request.organizationId,
      request.params.key
    );

    if (!categoryType) {
      return sendNotFound(reply, 'Category type');
    }

    return sendSuccess(reply, categoryType);
  }
);

// ============================================
// Create Category Type
// ============================================
export const createCategoryType = handle(
  'create',
  async (request: FastifyRequest<{ Body: CreateCategoryTypeInput }>, reply: FastifyReply) => {
    const categoryType = await categoryTypeRepository.create(request.organizationId, request.body);

    return sendSuccess(reply, categoryType, 201);
  }
);

// ============================================
// Update Category Type
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
    const categoryType = await categoryTypeRepository.update(
      request.organizationId,
      request.params.id,
      request.body
    );

    return sendSuccess(reply, categoryType);
  }
);

// ============================================
// Delete Category Type
// ============================================
export const deleteCategoryType = handle(
  'delete',
  async (request: FastifyRequest<{ Params: CategoryTypeParams }>, reply: FastifyReply) => {
    await categoryTypeRepository.delete(request.organizationId, request.params.id);
    return sendNoContent(reply);
  }
);
