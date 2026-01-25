/**
 * API Module Exports
 */

export { api, request } from './client';
export { authApi } from './auth';
export * from './permissions';
export * from './roles';
export * from './team';
export * from './payments';
// Re-export member-advances with explicit names to avoid duplicates with payments
export {
  getMemberAdvances,
  getMemberAdvance,
  createMemberAdvance,
  updateMemberAdvance,
  deleteMemberAdvance,
  getMemberAdvanceSummary,
  getProjectMemberAdvanceSummaries,
  getProjectMembers,
  getMemberBalancesAcrossProjects,
  getMemberTotalBalance,
  getMemberTotalBalancesBatch,
  type MemberAdvance,
  type MemberAdvanceSummary,
  type ProjectMember,
  type MemberProjectBalance,
  type CreateMemberAdvanceInput,
  type UpdateMemberAdvanceInput,
  type MemberAdvanceQueryParams,
  type MemberAdvancesResponse,
  type MemberAdvanceSortBy,
  type MemberAdvanceProject,
  type MemberAdvanceMember,
} from './member-advances';
export type {
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginationMeta,
  ApiPaginatedResponse,
  PaginatedResult,
} from './types';
