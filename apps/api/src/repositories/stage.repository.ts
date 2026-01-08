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
        include: {
          project: true,
        },
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
        include: {
          project: true,
        },
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
          include: {
            project: true,
          },
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
      const existing = await prisma.stage.findFirst({
        where: { id, organizationId },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.stage.update({
        where: { id },
        data: {
          ...data,
          budgetAmount:
            data.budgetAmount !== undefined ? new Decimal(data.budgetAmount) : undefined,
        },
        include: {
          project: true,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      const existing = await prisma.stage.findFirst({
        where: { id, organizationId },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      await prisma.stage.delete({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
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

      const expensesSum = await prisma.expense.aggregate({
        where: { organizationId, stageId },
        _sum: { amount: true },
      });

      const budgetAmount = stage.budgetAmount.toNumber();
      const totalExpenses = expensesSum._sum.amount?.toNumber() || 0;
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
