import type { FastifyReply } from 'fastify';

// ============================================
// Response Types
// ============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface PaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    pagination: PaginationMeta;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

// ============================================
// Response Builders
// ============================================

/**
 * Build a success response
 */
export function successResponse<T>(data: T): SuccessResponse<T> {
  return { success: true, data };
}

/**
 * Build a paginated response
 */
export function paginatedResponse<T>(items: T[], pagination: PaginationMeta): PaginatedResponse<T> {
  return {
    success: true,
    data: { items, pagination },
  };
}

/**
 * Build pagination metadata from query params and total count
 */
export function buildPagination(page: number, limit: number, total: number): PaginationMeta {
  const pages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    pages,
    hasMore: page < pages,
  };
}

/**
 * Build an error response
 */
export function errorResponse(message: string, code: string, details?: unknown): ErrorResponse {
  const error: ErrorResponse['error'] = { message, code };
  if (details !== undefined) {
    error.details = details;
  }
  return { success: false, error };
}

// ============================================
// Reply Helpers
// ============================================

/**
 * Send a success response
 */
export function sendSuccess<T>(reply: FastifyReply, data: T, statusCode = 200) {
  return reply.code(statusCode).send(successResponse(data));
}

/**
 * Send a 201 created response
 */
export function sendCreated<T>(reply: FastifyReply, data: T) {
  return reply.code(201).send(successResponse(data));
}

/**
 * Send a paginated response
 */
export function sendPaginated<T>(reply: FastifyReply, items: T[], pagination: PaginationMeta) {
  return reply.send(paginatedResponse(items, pagination));
}

/**
 * Send an error response
 */
export function sendError(
  reply: FastifyReply,
  statusCode: number,
  message: string,
  code: string,
  details?: unknown
) {
  return reply.code(statusCode).send(errorResponse(message, code, details));
}

/**
 * Send a 404 not found response
 */
export function sendNotFound(reply: FastifyReply, resource: string) {
  return sendError(reply, 404, `${resource} not found`, 'NOT_FOUND');
}

/**
 * Send a 204 no content response
 */
export function sendNoContent(reply: FastifyReply) {
  return reply.code(204).send();
}
