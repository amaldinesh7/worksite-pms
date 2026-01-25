/**
 * BOQ Repository
 *
 * Data access layer for BOQ (Bill of Quantities) operations.
 * Handles CRUD for BOQ items, sections, and expense links.
 */

import { Decimal } from '@prisma/client/runtime/library';
import type { BOQCategory, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';

// ============================================
// Types
// ============================================

export interface CreateBOQItemData {
  projectId: string;
  sectionId?: string;
  stageId?: string;
  code?: string;
  category: BOQCategory;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  notes?: string;
  isReviewFlagged?: boolean;
  flagReason?: string;
}

export interface UpdateBOQItemData {
  sectionId?: string | null;
  stageId?: string | null;
  code?: string | null;
  category?: BOQCategory;
  description?: string;
  unit?: string;
  quantity?: number;
  rate?: number;
  notes?: string | null;
  isReviewFlagged?: boolean;
  flagReason?: string | null;
}

export interface CreateBOQSectionData {
  projectId: string;
  name: string;
  sortOrder?: number;
}

export interface BOQListOptions {
  skip?: number;
  take?: number;
  category?: BOQCategory;
  stageId?: string;
  sectionId?: string;
  search?: string;
  sortBy?: 'description' | 'category' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Include object for BOQ item queries
const boqItemInclude = {
  section: { select: { id: true, name: true } },
  stage: { select: { id: true, name: true } },
  expenseLinks: {
    include: {
      expense: {
        select: {
          id: true,
          rate: true,
          quantity: true,
          expenseDate: true,
          description: true,
        },
      },
    },
  },
} as const;

// ============================================
// BOQ Item Repository
// ============================================

export class BOQItemRepository {
  /**
   * Create a new BOQ item
   */
  async create(organizationId: string, data: CreateBOQItemData) {
    try {
      return await prisma.bOQItem.create({
        data: {
          organizationId,
          projectId: data.projectId,
          sectionId: data.sectionId,
          stageId: data.stageId,
          code: data.code,
          category: data.category,
          description: data.description,
          unit: data.unit,
          quantity: new Decimal(data.quantity),
          rate: new Decimal(data.rate),
          notes: data.notes,
          isReviewFlagged: data.isReviewFlagged ?? false,
          flagReason: data.flagReason,
        },
        include: boqItemInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Create multiple BOQ items (for import)
   */
  async createMany(organizationId: string, items: CreateBOQItemData[]) {
    try {
      const data = items.map((item) => ({
        organizationId,
        projectId: item.projectId,
        sectionId: item.sectionId,
        stageId: item.stageId,
        code: item.code,
        category: item.category,
        description: item.description,
        unit: item.unit,
        quantity: new Decimal(item.quantity),
        rate: new Decimal(item.rate),
        notes: item.notes,
        isReviewFlagged: item.isReviewFlagged ?? false,
        flagReason: item.flagReason,
      }));

      const result = await prisma.bOQItem.createMany({ data });
      return result.count;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Find BOQ item by ID
   */
  async findById(organizationId: string, id: string) {
    try {
      return await prisma.bOQItem.findFirst({
        where: { id, organizationId },
        include: boqItemInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Find all BOQ items for a project with filtering and pagination
   */
  async findAll(organizationId: string, projectId: string, options: BOQListOptions = {}) {
    try {
      const {
        skip = 0,
        take = 50,
        category,
        stageId,
        sectionId,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      const where: Prisma.BOQItemWhereInput = {
        organizationId,
        projectId,
        ...(category && { category }),
        ...(stageId && { stageId }),
        ...(sectionId && { sectionId }),
        ...(search && {
          OR: [
            { description: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      // Build orderBy based on sortBy
      let orderBy: Prisma.BOQItemOrderByWithRelationInput;
      if (sortBy === 'amount') {
        // Sort by calculated amount (rate * quantity) - we'll sort by rate as proxy
        orderBy = { rate: sortOrder };
      } else {
        orderBy = { [sortBy]: sortOrder };
      }

      const [items, total] = await Promise.all([
        prisma.bOQItem.findMany({
          where,
          include: boqItemInclude,
          skip,
          take,
          orderBy,
        }),
        prisma.bOQItem.count({ where }),
      ]);

      return { items, total };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get BOQ items grouped by category
   */
  async findByCategory(organizationId: string, projectId: string) {
    try {
      const items = await prisma.bOQItem.findMany({
        where: { organizationId, projectId },
        include: boqItemInclude,
        orderBy: [{ category: 'asc' }, { description: 'asc' }],
      });

      // Group by category
      const grouped = items.reduce(
        (acc, item) => {
          const cat = item.category;
          if (!acc[cat]) {
            acc[cat] = [];
          }
          acc[cat].push(item);
          return acc;
        },
        {} as Record<BOQCategory, typeof items>
      );

      return grouped;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get BOQ items grouped by stage
   */
  async findByStage(organizationId: string, projectId: string) {
    try {
      const items = await prisma.bOQItem.findMany({
        where: { organizationId, projectId },
        include: boqItemInclude,
        orderBy: [{ stage: { name: 'asc' } }, { description: 'asc' }],
      });

      // Group by stage (null stage = "Unassigned")
      const grouped = items.reduce(
        (acc, item) => {
          const stageKey = item.stageId || 'unassigned';
          const stageName = item.stage?.name || 'Unassigned';
          if (!acc[stageKey]) {
            acc[stageKey] = { stageName, items: [] };
          }
          acc[stageKey].items.push(item);
          return acc;
        },
        {} as Record<string, { stageName: string; items: typeof items }>
      );

      return grouped;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Update a BOQ item
   */
  async update(organizationId: string, id: string, data: UpdateBOQItemData) {
    try {
      return await prisma.bOQItem.update({
        where: { id, organizationId },
        data: {
          ...(data.sectionId !== undefined && { sectionId: data.sectionId }),
          ...(data.stageId !== undefined && { stageId: data.stageId }),
          ...(data.code !== undefined && { code: data.code }),
          ...(data.category && { category: data.category }),
          ...(data.description && { description: data.description }),
          ...(data.unit && { unit: data.unit }),
          ...(data.quantity !== undefined && { quantity: new Decimal(data.quantity) }),
          ...(data.rate !== undefined && { rate: new Decimal(data.rate) }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.isReviewFlagged !== undefined && { isReviewFlagged: data.isReviewFlagged }),
          ...(data.flagReason !== undefined && { flagReason: data.flagReason }),
        },
        include: boqItemInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Delete a BOQ item
   */
  async delete(organizationId: string, id: string) {
    try {
      await prisma.bOQItem.delete({
        where: { id, organizationId },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get BOQ statistics for a project
   */
  async getStats(organizationId: string, projectId: string) {
    try {
      const items = await prisma.bOQItem.findMany({
        where: { organizationId, projectId },
        include: {
          expenseLinks: {
            include: {
              expense: {
                select: { rate: true, quantity: true },
              },
            },
          },
        },
      });

      let totalQuoted = 0;
      let totalActual = 0;
      const categoryBreakdown: Record<
        BOQCategory,
        { quoted: number; actual: number; count: number }
      > = {
        MATERIAL: { quoted: 0, actual: 0, count: 0 },
        LABOUR: { quoted: 0, actual: 0, count: 0 },
        SUB_WORK: { quoted: 0, actual: 0, count: 0 },
        EQUIPMENT: { quoted: 0, actual: 0, count: 0 },
        OTHER: { quoted: 0, actual: 0, count: 0 },
      };

      for (const item of items) {
        const quotedAmount = item.rate.toNumber() * item.quantity.toNumber();
        totalQuoted += quotedAmount;

        // Calculate actual from linked expenses
        const actualAmount = item.expenseLinks.reduce((sum, link) => {
          return sum + link.expense.rate.toNumber() * link.expense.quantity.toNumber();
        }, 0);
        totalActual += actualAmount;

        // Update category breakdown
        categoryBreakdown[item.category].quoted += quotedAmount;
        categoryBreakdown[item.category].actual += actualAmount;
        categoryBreakdown[item.category].count += 1;
      }

      const variance = totalQuoted - totalActual;
      const variancePercent = totalQuoted > 0 ? (variance / totalQuoted) * 100 : 0;
      const budgetUsage = totalQuoted > 0 ? (totalActual / totalQuoted) * 100 : 0;

      return {
        totalQuoted,
        totalActual,
        variance,
        variancePercent,
        budgetUsage,
        itemCount: items.length,
        categoryBreakdown,
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Link an expense to a BOQ item
   */
  async linkExpense(organizationId: string, boqItemId: string, expenseId: string) {
    try {
      // Verify BOQ item belongs to organization
      const boqItem = await prisma.bOQItem.findFirst({
        where: { id: boqItemId, organizationId },
      });
      if (!boqItem) {
        throw new Error('BOQ item not found');
      }

      // Verify expense belongs to same organization and project
      const expense = await prisma.expense.findFirst({
        where: { id: expenseId, organizationId, projectId: boqItem.projectId },
      });
      if (!expense) {
        throw new Error('Expense not found or does not belong to same project');
      }

      return await prisma.bOQExpenseLink.create({
        data: { boqItemId, expenseId },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Unlink an expense from a BOQ item
   * @param organizationId - The requesting organization's ID for tenancy validation
   * @param boqItemId - The BOQ item ID
   * @param expenseId - The expense ID to unlink
   */
  async unlinkExpense(organizationId: string, boqItemId: string, expenseId: string) {
    try {
      // Verify BOQ item belongs to the organization (tenancy check)
      const boqItem = await prisma.bOQItem.findUnique({
        where: { id: boqItemId },
      });

      if (!boqItem) {
        throw new Error('BOQ item not found');
      }

      if (boqItem.organizationId !== organizationId) {
        throw new Error('Unauthorized: BOQ item does not belong to this organization');
      }

      await prisma.bOQExpenseLink.delete({
        where: {
          boqItemId_expenseId: { boqItemId, expenseId },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

// ============================================
// BOQ Section Repository
// ============================================

export class BOQSectionRepository {
  /**
   * Create a new BOQ section
   */
  async create(organizationId: string, data: CreateBOQSectionData) {
    try {
      return await prisma.bOQSection.create({
        data: {
          organizationId,
          projectId: data.projectId,
          name: data.name,
          sortOrder: data.sortOrder ?? 0,
        },
        include: {
          items: { include: boqItemInclude },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Find all sections for a project
   */
  async findByProject(organizationId: string, projectId: string) {
    try {
      return await prisma.bOQSection.findMany({
        where: { organizationId, projectId },
        include: {
          items: { include: boqItemInclude },
        },
        orderBy: { sortOrder: 'asc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Update a section
   */
  async update(organizationId: string, id: string, data: { name?: string; sortOrder?: number }) {
    try {
      return await prisma.bOQSection.update({
        where: { id, organizationId },
        data,
        include: {
          items: { include: boqItemInclude },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Delete a section (items will have sectionId set to null)
   */
  async delete(organizationId: string, id: string) {
    try {
      await prisma.bOQSection.delete({
        where: { id, organizationId },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Find or create a section by name
   */
  async findOrCreate(organizationId: string, projectId: string, name: string) {
    try {
      const existing = await prisma.bOQSection.findFirst({
        where: { organizationId, projectId, name },
      });

      if (existing) return existing;

      // Get max sort order
      const maxSort = await prisma.bOQSection.aggregate({
        where: { organizationId, projectId },
        _max: { sortOrder: true },
      });

      return await prisma.bOQSection.create({
        data: {
          organizationId,
          projectId,
          name,
          sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

// Export singleton instances
export const boqItemRepository = new BOQItemRepository();
export const boqSectionRepository = new BOQSectionRepository();
