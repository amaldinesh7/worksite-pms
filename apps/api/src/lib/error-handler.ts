import type { FastifyReply, FastifyRequest } from 'fastify';
import { isDatabaseError } from './database-errors';
import { sendError } from './response.utils';

/**
 * Centralized error handler for route handlers.
 * Handles database errors and generic errors uniformly.
 */
export function handleRouteError(
  error: unknown,
  reply: FastifyReply,
  fallbackMessage: string,
  fallbackCode: string
) {
  // Log the error (fastify instance not available here, use console)
  console.error(error);

  // Handle known database errors
  if (isDatabaseError(error)) {
    return sendError(reply, error.statusCode, error.message, error.code);
  }

  // Handle Zod validation errors (from fastify-type-provider-zod)
  if (error && typeof error === 'object' && 'validation' in error) {
    return sendError(reply, 400, 'Validation failed', 'VALIDATION_ERROR', error);
  }

  // Generic error
  return sendError(reply, 500, fallbackMessage, fallbackCode);
}

/**
 * Higher-order function that wraps a route handler with error handling.
 * Eliminates try/catch boilerplate in every route.
 *
 * @example
 * ```typescript
 * export const getUser = withErrorHandler(
 *   async (request, reply) => {
 *     const user = await userRepository.findById(request.params.id);
 *     return sendSuccess(reply, user);
 *   },
 *   'Failed to fetch user',
 *   'FETCH_FAILED'
 * );
 * ```
 */
export function withErrorHandler<
  TRequest extends FastifyRequest = FastifyRequest,
  TReply extends FastifyReply = FastifyReply,
>(
  handler: (request: TRequest, reply: TReply) => Promise<unknown>,
  fallbackMessage: string,
  fallbackCode: string
) {
  return async (request: TRequest, reply: TReply) => {
    try {
      return await handler(request, reply);
    } catch (error) {
      return handleRouteError(error, reply, fallbackMessage, fallbackCode);
    }
  };
}

/**
 * Create a resource-specific error handler factory.
 * Reduces repetition when all handlers in a controller deal with the same resource.
 *
 * @example
 * ```typescript
 * const handle = createErrorHandler('expense');
 *
 * export const list = handle('fetch', async (req, reply) => {...});
 * export const create = handle('create', async (req, reply) => {...});
 * ```
 */
export function createErrorHandler(resourceName: string) {
  return function <
    TRequest extends FastifyRequest = FastifyRequest,
    TReply extends FastifyReply = FastifyReply,
  >(
    operation: 'fetch' | 'create' | 'update' | 'delete' | string,
    handler: (request: TRequest, reply: TReply) => Promise<unknown>
  ) {
    const message = `Failed to ${operation} ${resourceName}`;
    const code = `${operation.toUpperCase()}_FAILED`;
    return withErrorHandler(handler, message, code);
  };
}
