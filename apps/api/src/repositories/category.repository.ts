import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { CategoryType, CategoryItem, Prisma } from '@prisma/client';

// ============================================
// Category Type Repository
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
  async create(organizationId: string, data: CreateCategoryTypeData): Promise<CategoryType> {
    try {
      return await prisma.categoryType.create({
        data: {
          organizationId,
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

  async findById(organizationId: string, id: string): Promise<CategoryType | null> {
    try {
      return await prisma.categoryType.findFirst({
        where: {
          id,
          organizationId,
        },
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

  async findByKey(organizationId: string, key: string): Promise<CategoryType | null> {
    try {
      return await prisma.categoryType.findFirst({
        where: {
          organizationId,
          key,
        },
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

  async findAll(
    organizationId: string,
    options?: { includeInactive?: boolean }
  ): Promise<CategoryType[]> {
    try {
      return await prisma.categoryType.findMany({
        where: {
          organizationId,
          ...(options?.includeInactive ? {} : { isActive: true }),
        },
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

  async update(
    organizationId: string,
    id: string,
    data: UpdateCategoryTypeData
  ): Promise<CategoryType> {
    try {
      const existing = await prisma.categoryType.findFirst({
        where: { id, organizationId },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.categoryType.update({
        where: { id },
        data,
        include: {
          items: true,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      const existing = await prisma.categoryType.findFirst({
        where: { id, organizationId },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      await prisma.categoryType.delete({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

// ============================================
// Category Item Repository
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
      // Verify category type belongs to organization
      const categoryType = await prisma.categoryType.findFirst({
        where: {
          id: data.categoryTypeId,
          organizationId,
        },
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
      const existing = await prisma.categoryItem.findFirst({
        where: { id, organizationId },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.categoryItem.update({
        where: { id },
        data,
        include: {
          categoryType: true,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      const existing = await prisma.categoryItem.findFirst({
        where: { id, organizationId },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      await prisma.categoryItem.delete({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const categoryTypeRepository = new CategoryTypeRepository();
export const categoryItemRepository = new CategoryItemRepository();
