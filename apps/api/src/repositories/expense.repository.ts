import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Expense, Prisma, PaymentMode } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateExpenseData {
  projectId: string;
  partyId: string;
  stageId?: string;
  expenseCategoryItemId: string;
  materialTypeItemId?: string;
  labourTypeItemId?: string;
  subWorkTypeItemId?: string;
  rate: number;
  quantity: number;
  expenseDate: Date;
  notes?: string;
  // Optional payment data
  paidAmount?: number;
  paymentMode?: PaymentMode;
}

export interface UpdateExpenseData {
  partyId?: string;
  stageId?: string | null;
  expenseCategoryItemId?: string;
  materialTypeItemId?: string | null;
  labourTypeItemId?: string | null;
  subWorkTypeItemId?: string | null;
  rate?: number;
  quantity?: number;
  expenseDate?: Date;
  notes?: string | null;
}

export interface ExpenseListOptions {
  skip?: number;
  take?: number;
  projectId?: string;
  partyId?: string;
  stageId?: string;
  startDate?: Date;
  endDate?: Date;
}

// Include object for expense queries
const expenseInclude = {
  project: true,
  party: true,
  stage: true,
  expenseCategory: true,
  materialType: true,
  labourType: true,
  subWorkType: true,
  payments: true,
} as const;

export class ExpenseRepository {
  async create(organizationId: string, data: CreateExpenseData): Promise<Expense> {
    try {
      const { paidAmount, paymentMode, ...expenseData } = data;

      // Use transaction if payment needs to be created
      if (paidAmount !== undefined && paymentMode !== undefined) {
        return await prisma.$transaction(async (tx) => {
          // Create expense
          const expense = await tx.expense.create({
            data: {
              organizationId,
              projectId: expenseData.projectId,
              partyId: expenseData.partyId,
              stageId: expenseData.stageId,
              expenseCategoryItemId: expenseData.expenseCategoryItemId,
              materialTypeItemId: expenseData.materialTypeItemId,
              labourTypeItemId: expenseData.labourTypeItemId,
              subWorkTypeItemId: expenseData.subWorkTypeItemId,
              rate: new Decimal(expenseData.rate),
              quantity: new Decimal(expenseData.quantity),
              expenseDate: expenseData.expenseDate,
              notes: expenseData.notes,
            },
          });

          // Create linked payment
          await tx.payment.create({
            data: {
              organizationId,
              projectId: expenseData.projectId,
              partyId: expenseData.partyId,
              expenseId: expense.id,
              type: 'OUT',
              paymentMode,
              amount: new Decimal(paidAmount),
              paymentDate: expenseData.expenseDate,
            },
          });

          // Return expense with all relations
          return await tx.expense.findUniqueOrThrow({
            where: { id: expense.id },
            include: expenseInclude,
          });
        });
      }

      // Create expense without payment
      return await prisma.expense.create({
        data: {
          organizationId,
          projectId: expenseData.projectId,
          partyId: expenseData.partyId,
          stageId: expenseData.stageId,
          expenseCategoryItemId: expenseData.expenseCategoryItemId,
          materialTypeItemId: expenseData.materialTypeItemId,
          labourTypeItemId: expenseData.labourTypeItemId,
          subWorkTypeItemId: expenseData.subWorkTypeItemId,
          rate: new Decimal(expenseData.rate),
          quantity: new Decimal(expenseData.quantity),
          expenseDate: expenseData.expenseDate,
          notes: expenseData.notes,
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
          include: {
            project: true,
            party: true,
            stage: true,
            expenseCategory: true,
            payments: true,
          },
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
      const existing = await prisma.expense.findFirst({
        where: { id, organizationId },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.expense.update({
        where: { id },
        data: {
          ...data,
          rate: data.rate !== undefined ? new Decimal(data.rate) : undefined,
          quantity: data.quantity !== undefined ? new Decimal(data.quantity) : undefined,
        },
        include: expenseInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      const existing = await prisma.expense.findFirst({
        where: { id, organizationId },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      await prisma.expense.delete({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get expenses summary by category
  // Note: Now calculates total as sum of (rate * quantity) for each expense
  async getExpensesByCategory(
    organizationId: string,
    projectId?: string
  ): Promise<Array<{ categoryId: string; categoryName: string; total: number }>> {
    try {
      // Since we can't use computed fields in groupBy, we need to fetch and calculate
      const expenses = await prisma.expense.findMany({
        where: {
          organizationId,
          ...(projectId && { projectId }),
        },
        select: {
          expenseCategoryItemId: true,
          rate: true,
          quantity: true,
        },
      });

      // Group and sum manually
      const categoryTotals = new Map<string, number>();
      for (const expense of expenses) {
        const total = expense.rate.toNumber() * expense.quantity.toNumber();
        const current = categoryTotals.get(expense.expenseCategoryItemId) || 0;
        categoryTotals.set(expense.expenseCategoryItemId, current + total);
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
