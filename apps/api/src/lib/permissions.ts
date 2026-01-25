// ============================================
// Permission Types
// ============================================

/**
 * Role name type - these correspond to system roles created for organizations
 * Roles are now stored in the Role model, not as an enum
 */
export type RoleName = 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'SUPERVISOR' | 'CLIENT';

export type Resource =
  | 'projects'
  | 'stages'
  | 'expenses'
  | 'payments'
  | 'parties'
  | 'documents'
  | 'categories'
  | 'organizations'
  | 'members';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

export interface Permission {
  resource: Resource;
  actions: Action[];
  scope: 'all' | 'assigned' | 'own';
}

// ============================================
// Role Definitions
// ============================================

/**
 * Permission matrix by role
 *
 * | Role       | Projects | Expenses | Payments | Parties | Documents | Scope            |
 * |------------|----------|----------|----------|---------|-----------|------------------|
 * | ADMIN      | CRUD     | CRUD     | CRUD     | CRUD    | CRUD      | All              |
 * | MANAGER    | CRUD     | CRUD     | CRUD     | CRUD    | CRUD      | All              |
 * | ACCOUNTANT | Read     | CRUD     | CRUD     | Read    | Read      | All              |
 * | SUPERVISOR | Read     | Create   | Read     | Read    | CRUD      | Assigned projects|
 * | CLIENT     | Read     | Read     | Read     | -       | Read      | Their projects   |
 */

const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  ADMIN: [
    {
      resource: 'projects',
      actions: ['create', 'read', 'update', 'delete', 'manage'],
      scope: 'all',
    },
    { resource: 'stages', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'expenses', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'payments', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    {
      resource: 'parties',
      actions: ['create', 'read', 'update', 'delete', 'manage'],
      scope: 'all',
    },
    { resource: 'documents', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'categories', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'organizations', actions: ['read', 'update', 'manage'], scope: 'all' },
    { resource: 'members', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
  ],

  MANAGER: [
    { resource: 'projects', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'stages', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'expenses', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'payments', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'parties', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'documents', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'categories', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'organizations', actions: ['read'], scope: 'all' },
    { resource: 'members', actions: ['read'], scope: 'all' },
  ],

  ACCOUNTANT: [
    { resource: 'projects', actions: ['read'], scope: 'all' },
    { resource: 'stages', actions: ['read'], scope: 'all' },
    { resource: 'expenses', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'payments', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'parties', actions: ['read'], scope: 'all' },
    { resource: 'documents', actions: ['read'], scope: 'all' },
    { resource: 'categories', actions: ['read'], scope: 'all' },
    { resource: 'organizations', actions: ['read'], scope: 'all' },
    { resource: 'members', actions: ['read'], scope: 'all' },
  ],

  SUPERVISOR: [
    { resource: 'projects', actions: ['read'], scope: 'assigned' },
    { resource: 'stages', actions: ['read'], scope: 'assigned' },
    { resource: 'expenses', actions: ['create', 'read'], scope: 'assigned' },
    { resource: 'payments', actions: ['read'], scope: 'assigned' },
    { resource: 'parties', actions: ['read'], scope: 'all' },
    { resource: 'documents', actions: ['create', 'read', 'update', 'delete'], scope: 'assigned' },
    { resource: 'categories', actions: ['read'], scope: 'all' },
    { resource: 'organizations', actions: ['read'], scope: 'all' },
    { resource: 'members', actions: [], scope: 'all' },
  ],

  CLIENT: [
    { resource: 'projects', actions: ['read'], scope: 'own' },
    { resource: 'stages', actions: ['read'], scope: 'own' },
    { resource: 'expenses', actions: ['read'], scope: 'own' },
    { resource: 'payments', actions: ['read'], scope: 'own' },
    { resource: 'parties', actions: [], scope: 'all' },
    { resource: 'documents', actions: ['read'], scope: 'own' },
    { resource: 'categories', actions: ['read'], scope: 'all' },
    { resource: 'organizations', actions: ['read'], scope: 'all' },
    { resource: 'members', actions: [], scope: 'all' },
  ],
};

// ============================================
// Permission Check Functions
// ============================================

/**
 * Check if a role has permission to perform an action on a resource
 */
export function hasPermission(
  roleName: RoleName | string,
  resource: Resource,
  action: Action
): boolean {
  const permissions = ROLE_PERMISSIONS[roleName as RoleName];
  if (!permissions) return false;

  const resourcePermission = permissions.find((p) => p.resource === resource);
  if (!resourcePermission) return false;

  return resourcePermission.actions.includes(action);
}

/**
 * Get the permission scope for a role and resource
 */
export function getPermissionScope(
  roleName: RoleName | string,
  resource: Resource
): 'all' | 'assigned' | 'own' | null {
  const permissions = ROLE_PERMISSIONS[roleName as RoleName];
  if (!permissions) return null;

  const resourcePermission = permissions.find((p) => p.resource === resource);
  return resourcePermission?.scope ?? null;
}

/**
 * Check if a role requires project-level access check
 */
export function requiresProjectAccess(roleName: RoleName | string): boolean {
  return roleName === 'SUPERVISOR' || roleName === 'CLIENT';
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(roleName: RoleName | string): Permission[] {
  return ROLE_PERMISSIONS[roleName as RoleName] || [];
}

/**
 * Check if role is admin-level (full access)
 */
export function isAdminRole(roleName: RoleName | string): boolean {
  return roleName === 'ADMIN';
}

/**
 * Check if role has management capabilities
 */
export function isManagerRole(roleName: RoleName | string): boolean {
  return roleName === 'ADMIN' || roleName === 'MANAGER';
}

/**
 * Check if role has financial access
 */
export function hasFinancialAccess(roleName: RoleName | string): boolean {
  return roleName === 'ADMIN' || roleName === 'MANAGER' || roleName === 'ACCOUNTANT';
}

// ============================================
// Error Messages
// ============================================

export const PERMISSION_ERRORS = {
  FORBIDDEN: 'You do not have permission to perform this action',
  NO_PROJECT_ACCESS: 'You do not have access to this project',
  RESOURCE_NOT_ALLOWED: 'You are not allowed to access this resource',
  ACTION_NOT_ALLOWED: 'You are not allowed to perform this action',
} as const;
