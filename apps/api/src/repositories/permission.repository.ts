import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Permission } from '@prisma/client';

export class PermissionRepository {
  /**
   * Get all permissions (global, not organization-specific)
   */
  async findAll(): Promise<Permission[]> {
    try {
      return await prisma.permission.findMany({
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get permissions grouped by category
   */
  async findAllGroupedByCategory(): Promise<Record<string, Permission[]>> {
    try {
      const permissions = await prisma.permission.findMany({
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });

      return permissions.reduce(
        (acc, permission) => {
          if (!acc[permission.category]) {
            acc[permission.category] = [];
          }
          acc[permission.category].push(permission);
          return acc;
        },
        {} as Record<string, Permission[]>
      );
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get a permission by ID
   */
  async findById(id: string): Promise<Permission | null> {
    try {
      return await prisma.permission.findUnique({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get a permission by key
   */
  async findByKey(key: string): Promise<Permission | null> {
    try {
      return await prisma.permission.findUnique({
        where: { key },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get multiple permissions by keys
   */
  async findByKeys(keys: string[]): Promise<Permission[]> {
    try {
      return await prisma.permission.findMany({
        where: { key: { in: keys } },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const permissionRepository = new PermissionRepository();
