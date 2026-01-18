import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Stage, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateStageData {
  projectId: string;
  name: string;
  budgetAmount: number;
}

export interface UpdateStageData {
  name?: string;
  budgetAmount?: number;
}

export interface StageListOptions {
  skip?: number;
  take?: number;
  projectId?: string;
}

// Include object for stage queries
const stageInclude = {
  project: true,
} as const;

export class StageRepository {
  async create(organizationId: string, data: CreateStageData): Promise<Stage> {
    try {
      // Verify project belongs to organization
      const project = await prisma.project.findFirst({
        where: {
          id: data.projectId,
          organizationId,
        },
      });

      if (!project) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.stage.create({
        data: {
          organizationId,
          projectId: data.projectId,
          name: data.name,
          budgetAmount: new Decimal(data.budgetAmount),
        },
        include: stageInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(organizationId: string, id: string): Promise<Stage | null> {
    try {
      return await prisma.stage.findFirst({
        where: {
          id,
          organizationId,
        },
        include: {
          project: true,
          expenses: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findByProject(organizationId: string, projectId: string): Promise<Stage[]> {
    try {
      return await prisma.stage.findMany({
        where: {
          organizationId,
          projectId,
        },
        include: stageInclude,
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findAll(
    organizationId: string,
    options?: StageListOptions
  ): Promise<{ stages: Stage[]; total: number }> {
    try {
      const where: Prisma.StageWhereInput = {
        organizationId,
        ...(options?.projectId && { projectId: options.projectId }),
      };

      const [stages, total] = await Promise.all([
        prisma.stage.findMany({
          where,
          skip: options?.skip,
          take: options?.take,
          include: stageInclude,
          orderBy: { createdAt: 'asc' },
        }),
        prisma.stage.count({ where }),
      ]);

      return { stages, total };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async update(organizationId: string, id: string, data: UpdateStageData): Promise<Stage> {
    try {
      // Atomic org-scoped update
      const result = await prisma.stage.updateMany({
        where: { id, organizationId },
        data: {
          ...data,
          budgetAmount: data.budgetAmount !== undefined ? new Decimal(data.budgetAmount) : undefined,
        },
      });

      if (result.count === 0) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.stage.findUniqueOrThrow({
        where: { id },
        include: stageInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      // Atomic org-scoped delete
      const result = await prisma.stage.deleteMany({
        where: { id, organizationId },
      });

      if (result.count === 0) {
        throw handlePrismaError({ code: 'P2025' });
      }
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Helper to calculate total expenses (rate * quantity) for a stage
  private async calculateExpensesTotal(organizationId: string, stageId: string): Promise<number> {
    const expenses = await prisma.expense.findMany({
      where: { organizationId, stageId },
      select: { rate: true, quantity: true },
    });

    return expenses.reduce((sum, exp) => {
      return sum + exp.rate.toNumber() * exp.quantity.toNumber();
    }, 0);
  }

  // Get stage statistics
  async getStageStats(
    organizationId: string,
    stageId: string
  ): Promise<{
    budgetAmount: number;
    totalExpenses: number;
    remaining: number;
    percentUsed: number;
  }> {
    try {
      const stage = await prisma.stage.findFirst({
        where: { id: stageId, organizationId },
        select: { budgetAmount: true },
      });

      if (!stage) {
        throw handlePrismaError({ code: 'P2025' });
      }

      const totalExpenses = await this.calculateExpensesTotal(organizationId, stageId);

      const budgetAmount = stage.budgetAmount.toNumber();
      const remaining = budgetAmount - totalExpenses;
      const percentUsed = budgetAmount > 0 ? (totalExpenses / budgetAmount) * 100 : 0;

      return {
        budgetAmount,
        totalExpenses,
        remaining,
        percentUsed: Math.round(percentUsed * 100) / 100,
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const stageRepository = new StageRepository();
