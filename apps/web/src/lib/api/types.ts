/**
 * API Response Types
 */

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
