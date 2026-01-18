import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Expense, Prisma, ExpenseStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Pure expense data without payment info (payment logic moved to service)
export interface CreateExpenseData {
  projectId: string;
  partyId: string;
  stageId?: string;
  expenseTypeItemId: string;
  materialTypeItemId?: string;
  labourTypeItemId?: string;
  subWorkTypeItemId?: string;
  description?: string;
  rate: number;
  quantity: number;
  expenseDate: Date;
  status?: ExpenseStatus;
  notes?: string;
}

export interface UpdateExpenseData {
  partyId?: string;
  stageId?: string | null;
  expenseTypeItemId?: string;
  materialTypeItemId?: string | null;
  labourTypeItemId?: string | null;
  subWorkTypeItemId?: string | null;
  description?: string | null;
  rate?: number;
  quantity?: number;
  expenseDate?: Date;
  status?: ExpenseStatus;
  notes?: string | null;
}

export interface ExpenseListOptions {
  skip?: number;
  take?: number;
  projectId?: string;
  partyId?: string;
  stageId?: string;
  search?: string;
  status?: ExpenseStatus;
  startDate?: Date;
  endDate?: Date;
}

// Include object for expense queries
const expenseInclude = {
  project: true,
  party: true,
  stage: true,
  expenseType: true,
  materialType: true,
  labourType: true,
  subWorkType: true,
  payments: true,
} as const;

/**
 * Expense Repository - Pure data access layer.
 * Business logic (expense + payment transactions) is in ExpenseService.
 */
export class ExpenseRepository {
  /**
   * Create a single expense (no payment logic - that's in service).
   */
  async create(organizationId: string, data: CreateExpenseData): Promise<Expense> {
    try {
      return await prisma.expense.create({
        data: {
          organizationId,
          projectId: data.projectId,
          partyId: data.partyId,
          stageId: data.stageId,
          expenseTypeItemId: data.expenseTypeItemId,
          materialTypeItemId: data.materialTypeItemId,
          labourTypeItemId: data.labourTypeItemId,
          subWorkTypeItemId: data.subWorkTypeItemId,
          description: data.description,
          rate: new Decimal(data.rate),
          quantity: new Decimal(data.quantity),
          expenseDate: data.expenseDate,
          status: data.status,
          notes: data.notes,
        },
        include: expenseInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(organizationId: string, id: string): Promise<Expense | null> {
    try {
      return await prisma.expense.findFirst({
        where: {
          id,
          organizationId,
        },
        include: expenseInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findAll(
    organizationId: string,
    options?: ExpenseListOptions
  ): Promise<{ expenses: Expense[]; total: number }> {
    try {
      const where: Prisma.ExpenseWhereInput = {
        organizationId,
        ...(options?.projectId && { projectId: options.projectId }),
        ...(options?.partyId && { partyId: options.partyId }),
        ...(options?.stageId && { stageId: options.stageId }),
        ...(options?.status && { status: options.status }),
        ...(options?.search && {
          OR: [
            { description: { contains: options.search, mode: 'insensitive' } },
            { notes: { contains: options.search, mode: 'insensitive' } },
            { party: { name: { contains: options.search, mode: 'insensitive' } } },
          ],
        }),
        ...(options?.startDate || options?.endDate
          ? {
              expenseDate: {
                ...(options?.startDate && { gte: options.startDate }),
                ...(options?.endDate && { lte: options.endDate }),
              },
            }
          : {}),
      };

      const [expenses, total] = await Promise.all([
        prisma.expense.findMany({
          where,
          skip: options?.skip,
          take: options?.take,
          include: expenseInclude,
          orderBy: { expenseDate: 'desc' },
        }),
        prisma.expense.count({ where }),
      ]);

      return { expenses, total };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async update(organizationId: string, id: string, data: UpdateExpenseData): Promise<Expense> {
    try {
      // Use updateMany for atomic org-scoped update, then fetch result
      const result = await prisma.expense.updateMany({
        where: { id, organizationId },
        data: {
          ...data,
          rate: data.rate !== undefined ? new Decimal(data.rate) : undefined,
          quantity: data.quantity !== undefined ? new Decimal(data.quantity) : undefined,
        },
      });

      if (result.count === 0) {
        throw handlePrismaError({ code: 'P2025' });
      }

      // Fetch and return updated expense with relations
      return await prisma.expense.findUniqueOrThrow({
        where: { id },
        include: expenseInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      // Use deleteMany for atomic org-scoped delete
      const result = await prisma.expense.deleteMany({
        where: { id, organizationId },
      });

      if (result.count === 0) {
        throw handlePrismaError({ code: 'P2025' });
      }
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get expenses summary by type
  async getExpensesByCategory(
    organizationId: string,
    projectId?: string
  ): Promise<Array<{ categoryId: string; categoryName: string; total: number }>> {
    try {
      const expenses = await prisma.expense.findMany({
        where: {
          organizationId,
          ...(projectId && { projectId }),
        },
        select: {
          expenseTypeItemId: true,
          rate: true,
          quantity: true,
        },
      });

      // Group and sum manually
      const categoryTotals = new Map<string, number>();
      for (const expense of expenses) {
        const total = expense.rate.toNumber() * expense.quantity.toNumber();
        const current = categoryTotals.get(expense.expenseTypeItemId) || 0;
        categoryTotals.set(expense.expenseTypeItemId, current + total);
      }

      const categoryIds = Array.from(categoryTotals.keys());
      const categories = await prisma.categoryItem.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true },
      });

      const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

      return Array.from(categoryTotals.entries()).map(([categoryId, total]) => ({
        categoryId,
        categoryName: categoryMap.get(categoryId) || 'Unknown',
        total,
      }));
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const expenseRepository = new ExpenseRepository();
