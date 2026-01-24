/**
 * API Response Types
 */

// ============================================
// Pagination Types
// ============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

export interface ApiPaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    pagination: PaginationMeta;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ============================================
// Generic Response Types
// ============================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { message: string; code: string };
};

// ============================================
// Aliases for convenience
// ============================================

export type SuccessResponse<T> = ApiSuccessResponse<T>;

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}
