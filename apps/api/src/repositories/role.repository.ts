import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Role, Permission, Prisma } from '@prisma/client';

export interface CreateRoleData {
  organizationId: string;
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export interface RoleWithPermissions extends Role {
  permissions: Array<{
    permission: Permission;
  }>;
  _count?: {
    members: number;
  };
}

export interface RoleListOptions {
  skip?: number;
  take?: number;
  search?: string;
}

export class RoleRepository {
  /**
   * Get all roles for an organization
   */
  async findAll(
    organizationId: string,
    options?: RoleListOptions
  ): Promise<{ roles: RoleWithPermissions[]; total: number }> {
    try {
      const where: Prisma.RoleWhereInput = {
        organizationId,
        ...(options?.search && {
          OR: [
            { name: { contains: options.search, mode: 'insensitive' } },
            { description: { contains: options.search, mode: 'insensitive' } },
          ],
        }),
      };

      const [roles, total] = await Promise.all([
        prisma.role.findMany({
          where,
          skip: options?.skip,
          take: options?.take,
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
          orderBy: [{ isSystemRole: 'desc' }, { name: 'asc' }],
        }),
        prisma.role.count({ where }),
      ]);

      return { roles, total };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get a role by ID
   */
  async findById(id: string): Promise<RoleWithPermissions | null> {
    try {
      return await prisma.role.findUnique({
        where: { id },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get a role by name within an organization
   */
  async findByName(organizationId: string, name: string): Promise<RoleWithPermissions | null> {
    try {
      return await prisma.role.findUnique({
        where: {
          organizationId_name: {
            organizationId,
            name,
          },
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Create a new role
   */
  async create(data: CreateRoleData): Promise<RoleWithPermissions> {
    try {
      return await prisma.role.create({
        data: {
          organizationId: data.organizationId,
          name: data.name,
          description: data.description,
          permissions: data.permissionIds?.length
            ? {
                create: data.permissionIds.map((permissionId) => ({
                  permissionId,
                })),
              }
            : undefined,
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Update a role
   */
  async update(id: string, data: UpdateRoleData): Promise<RoleWithPermissions> {
    try {
      // If permissionIds are provided, we need to replace all permissions
      if (data.permissionIds !== undefined) {
        // Delete existing permissions and create new ones in a transaction
        return await prisma.$transaction(async (tx) => {
          // Delete existing permissions
          await tx.rolePermission.deleteMany({
            where: { roleId: id },
          });

          // Update role and create new permissions
          return await tx.role.update({
            where: { id },
            data: {
              name: data.name,
              description: data.description,
              permissions: data.permissionIds?.length
                ? {
                    create: data.permissionIds.map((permissionId) => ({
                      permissionId,
                    })),
                  }
                : undefined,
            },
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
              _count: {
                select: {
                  members: true,
                },
              },
            },
          });
        });
      }

      // Just update name/description
      return await prisma.role.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Delete a role
   */
  async delete(id: string): Promise<void> {
    try {
      // Check if role exists and is not a system role
      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
      });

      if (!role) {
        throw handlePrismaError({ code: 'P2025' });
      }

      if (role.isSystemRole) {
        throw {
          statusCode: 400,
          message: 'Cannot delete system role',
          code: 'SYSTEM_ROLE_DELETE',
        };
      }

      if (role._count.members > 0) {
        throw {
          statusCode: 400,
          message: 'Cannot delete role with assigned members',
          code: 'ROLE_HAS_MEMBERS',
        };
      }

      await prisma.role.delete({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Check if a user has a specific permission
   */
  async userHasPermission(userId: string, organizationId: string, permissionKey: string): Promise<boolean> {
    try {
      const member = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId,
          },
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!member) return false;

      return member.role.permissions.some((rp) => rp.permission.key === permissionKey);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const roleRepository = new RoleRepository();
