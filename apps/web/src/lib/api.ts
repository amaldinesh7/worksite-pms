/**
 * API Module - Re-exports from split modules
 *
 * This file maintains backwards compatibility while the actual
 * implementation is split into smaller, focused modules.
 */

export { api, request, authApi } from './api/index';
export type { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from './api/index';
