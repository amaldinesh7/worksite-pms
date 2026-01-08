import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Expense, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateExpenseData {
  projectId: string;
  partyId: string;
  stageId?: string;
  expenseCategoryItemId: string;
  materialTypeItemId?: string;
  labourTypeItemId?: string;
  subWorkTypeItemId?: string;
  amount: number;
  expenseDate: Date;
  paymentMode: string;
  notes?: string;
}

export interface UpdateExpenseData {
  partyId?: string;
  stageId?: string | null;
  expenseCategoryItemId?: string;
  materialTypeItemId?: string | null;
  labourTypeItemId?: string | null;
  subWorkTypeItemId?: string | null;
  amount?: number;
  expenseDate?: Date;
  paymentMode?: string;
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

export class ExpenseRepository {
  async create(organizationId: string, data: CreateExpenseData): Promise<Expense> {
    try {
      return await prisma.expense.create({
        data: {
          organizationId,
          projectId: data.projectId,
          partyId: data.partyId,
          stageId: data.stageId,
          expenseCategoryItemId: data.expenseCategoryItemId,
          materialTypeItemId: data.materialTypeItemId,
          labourTypeItemId: data.labourTypeItemId,
          subWorkTypeItemId: data.subWorkTypeItemId,
          amount: new Decimal(data.amount),
          expenseDate: data.expenseDate,
          paymentMode: data.paymentMode,
          notes: data.notes,
        },
        include: {
          project: true,
          party: true,
          stage: true,
          expenseCategory: true,
          materialType: true,
          labourType: true,
          subWorkType: true,
        },
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
        include: {
          project: true,
          party: true,
          stage: true,
          expenseCategory: true,
          materialType: true,
          labourType: true,
          subWorkType: true,
        },
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
          amount: data.amount !== undefined ? new Decimal(data.amount) : undefined,
        },
        include: {
          project: true,
          party: true,
          stage: true,
          expenseCategory: true,
          materialType: true,
          labourType: true,
          subWorkType: true,
        },
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
  async getExpensesByCategory(
    organizationId: string,
    projectId?: string
  ): Promise<Array<{ categoryId: string; categoryName: string; total: number }>> {
    try {
      const expenses = await prisma.expense.groupBy({
        by: ['expenseCategoryItemId'],
        where: {
          organizationId,
          ...(projectId && { projectId }),
        },
        _sum: {
          amount: true,
        },
      });

      const categoryIds = expenses.map((e) => e.expenseCategoryItemId);
      const categories = await prisma.categoryItem.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true },
      });

      const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

      return expenses.map((e) => ({
        categoryId: e.expenseCategoryItemId,
        categoryName: categoryMap.get(e.expenseCategoryItemId) || 'Unknown',
        total: e._sum.amount?.toNumber() || 0,
      }));
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const expenseRepository = new ExpenseRepository();
