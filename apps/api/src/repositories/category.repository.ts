import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { CategoryType, CategoryItem } from '@prisma/client';

// ============================================
// Category Type Repository (GLOBAL - not per-organization)
// ============================================

export interface CreateCategoryTypeData {
  key: string;
  label: string;
}

export interface UpdateCategoryTypeData {
  label?: string;
  isActive?: boolean;
}

export class CategoryTypeRepository {
  /**
   * Create a global category type.
   * Note: This is typically done during system setup, not by users.
   */
  async create(data: CreateCategoryTypeData): Promise<CategoryType> {
    try {
      return await prisma.categoryType.create({
        data: {
          key: data.key,
          label: data.label,
        },
        include: {
          items: true,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(id: string): Promise<CategoryType | null> {
    try {
      return await prisma.categoryType.findUnique({
        where: { id },
        include: {
          items: {
            where: { isActive: true },
            orderBy: { name: 'asc' },
          },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findByKey(key: string): Promise<CategoryType | null> {
    try {
      return await prisma.categoryType.findUnique({
        where: { key },
        include: {
          items: {
            where: { isActive: true },
            orderBy: { name: 'asc' },
          },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Find all global category types.
   * Items are filtered by organizationId to show only that org's items.
   */
  async findAll(options?: { includeInactive?: boolean }): Promise<CategoryType[]> {
    try {
      return await prisma.categoryType.findMany({
        where: options?.includeInactive ? {} : { isActive: true },
        include: {
          items: {
            where: options?.includeInactive ? {} : { isActive: true },
            orderBy: { name: 'asc' },
          },
        },
        orderBy: { label: 'asc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Find all global category types with items filtered by organization.
   */
  async findAllWithOrgItems(
    organizationId: string,
    options?: { includeInactive?: boolean }
  ): Promise<CategoryType[]> {
    try {
      return await prisma.categoryType.findMany({
        where: options?.includeInactive ? {} : { isActive: true },
        include: {
          items: {
            where: {
              organizationId,
              ...(options?.includeInactive ? {} : { isActive: true }),
            },
            orderBy: { name: 'asc' },
          },
        },
        orderBy: { label: 'asc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async update(id: string, data: UpdateCategoryTypeData): Promise<CategoryType> {
    try {
      return await prisma.categoryType.update({
        where: { id },
        data,
        include: { items: true },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.categoryType.delete({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

// ============================================
// Category Item Repository (per-organization)
// ============================================

export interface CreateCategoryItemData {
  categoryTypeId: string;
  name: string;
}

export interface UpdateCategoryItemData {
  name?: string;
  isActive?: boolean;
}

export class CategoryItemRepository {
  async create(organizationId: string, data: CreateCategoryItemData): Promise<CategoryItem> {
    try {
      // Verify category type exists (global)
      const categoryType = await prisma.categoryType.findUnique({
        where: { id: data.categoryTypeId },
      });

      if (!categoryType) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.categoryItem.create({
        data: {
          organizationId,
          categoryTypeId: data.categoryTypeId,
          name: data.name,
        },
        include: {
          categoryType: true,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(organizationId: string, id: string): Promise<CategoryItem | null> {
    try {
      return await prisma.categoryItem.findFirst({
        where: {
          id,
          organizationId,
        },
        include: {
          categoryType: true,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findByTypeKey(
    organizationId: string,
    typeKey: string,
    options?: { includeInactive?: boolean }
  ): Promise<CategoryItem[]> {
    try {
      return await prisma.categoryItem.findMany({
        where: {
          organizationId,
          categoryType: {
            key: typeKey,
          },
          ...(options?.includeInactive ? {} : { isActive: true }),
        },
        include: {
          categoryType: true,
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async update(
    organizationId: string,
    id: string,
    data: UpdateCategoryItemData
  ): Promise<CategoryItem> {
    try {
      // Atomic org-scoped update
      const result = await prisma.categoryItem.updateMany({
        where: { id, organizationId },
        data,
      });

      if (result.count === 0) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.categoryItem.findUniqueOrThrow({
        where: { id },
        include: { categoryType: true },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      // Soft delete: set isActive = false instead of deleting
      // This preserves referential integrity with expenses that reference this item
      const result = await prisma.categoryItem.updateMany({
        where: { id, organizationId },
        data: { isActive: false },
      });

      if (result.count === 0) {
        throw handlePrismaError({ code: 'P2025' });
      }
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const categoryTypeRepository = new CategoryTypeRepository();
export const categoryItemRepository = new CategoryItemRepository();
