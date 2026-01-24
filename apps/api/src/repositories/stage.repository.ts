import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Stage, Prisma, StageStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateStageData {
  projectId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  weight: number;
  status?: StageStatus;
  memberIds?: string[];
  partyIds?: string[];
}

export interface UpdateStageData {
  name?: string;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  budgetAmount?: number;
  weight?: number;
  status?: StageStatus;
  memberIds?: string[];
  partyIds?: string[];
}

export interface StageListOptions {
  skip?: number;
  take?: number;
  projectId?: string;
  status?: StageStatus;
}

// Include object for stage queries
const stageInclude = {
  project: true,
  memberAssignments: {
    include: {
      member: {
        include: {
          user: true,
          role: true,
        },
      },
    },
  },
  partyAssignments: {
    include: {
      party: true,
    },
  },
  _count: {
    select: {
      tasks: true,
      expenses: true,
    },
  },
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

      // Validate member IDs belong to organization
      if (data.memberIds && data.memberIds.length > 0) {
        const validMembers = await prisma.organizationMember.count({
          where: {
            id: { in: data.memberIds },
            organizationId,
          },
        });
        if (validMembers !== data.memberIds.length) {
          throw new Error('One or more member IDs are invalid');
        }
      }

      // Validate party IDs belong to organization (only SUBCONTRACTOR type for stages)
      if (data.partyIds && data.partyIds.length > 0) {
        const validParties = await prisma.party.count({
          where: {
            id: { in: data.partyIds },
            organizationId,
            type: 'SUBCONTRACTOR',
          },
        });
        if (validParties !== data.partyIds.length) {
          throw new Error('One or more party IDs are invalid or not subcontractors');
        }
      }

      return await prisma.stage.create({
        data: {
          organizationId,
          projectId: data.projectId,
          name: data.name,
          description: data.description,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          budgetAmount: new Decimal(data.budgetAmount),
          weight: new Decimal(data.weight),
          status: data.status || 'SCHEDULED',
          memberAssignments: data.memberIds?.length
            ? {
                create: data.memberIds.map((memberId) => ({ memberId })),
              }
            : undefined,
          partyAssignments: data.partyIds?.length
            ? {
                create: data.partyIds.map((partyId) => ({ partyId })),
              }
            : undefined,
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
          memberAssignments: {
            include: {
              member: {
                include: {
                  user: true,
                  role: true,
                },
              },
            },
          },
          partyAssignments: {
            include: {
              party: true,
            },
          },
          tasks: {
            take: 20,
            orderBy: { createdAt: 'asc' },
            include: {
              memberAssignments: {
                include: {
                  member: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
              partyAssignments: {
                include: {
                  party: true,
                },
              },
            },
          },
          expenses: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              tasks: true,
              expenses: true,
            },
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
        orderBy: { startDate: 'asc' },
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
        ...(options?.status && { status: options.status }),
      };

      const [stages, total] = await Promise.all([
        prisma.stage.findMany({
          where,
          skip: options?.skip,
          take: options?.take,
          include: stageInclude,
          orderBy: { startDate: 'asc' },
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
      // Verify stage exists and belongs to organization
      const existingStage = await prisma.stage.findFirst({
        where: { id, organizationId },
      });

      if (!existingStage) {
        throw handlePrismaError({ code: 'P2025' });
      }

      // Validate member IDs if provided
      if (data.memberIds !== undefined && data.memberIds.length > 0) {
        const validMembers = await prisma.organizationMember.count({
          where: {
            id: { in: data.memberIds },
            organizationId,
          },
        });
        if (validMembers !== data.memberIds.length) {
          throw new Error('One or more member IDs are invalid');
        }
      }

      // Validate party IDs if provided
      if (data.partyIds !== undefined && data.partyIds.length > 0) {
        const validParties = await prisma.party.count({
          where: {
            id: { in: data.partyIds },
            organizationId,
            type: 'SUBCONTRACTOR',
          },
        });
        if (validParties !== data.partyIds.length) {
          throw new Error('One or more party IDs are invalid or not subcontractors');
        }
      }

      // Use transaction to update stage and assignments atomically
      return await prisma.$transaction(async (tx) => {
        // Update member assignments if provided
        if (data.memberIds !== undefined) {
          // Delete existing assignments
          await tx.stageMemberAssignment.deleteMany({
            where: { stageId: id },
          });
          // Create new assignments
          if (data.memberIds.length > 0) {
            await tx.stageMemberAssignment.createMany({
              data: data.memberIds.map((memberId) => ({
                stageId: id,
                memberId,
              })),
            });
          }
        }

        // Update party assignments if provided
        if (data.partyIds !== undefined) {
          // Delete existing assignments
          await tx.stagePartyAssignment.deleteMany({
            where: { stageId: id },
          });
          // Create new assignments
          if (data.partyIds.length > 0) {
            await tx.stagePartyAssignment.createMany({
              data: data.partyIds.map((partyId) => ({
                stageId: id,
                partyId,
              })),
            });
          }
        }

        // Update stage
        return await tx.stage.update({
          where: { id },
          data: {
            ...(data.name && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.startDate && { startDate: new Date(data.startDate) }),
            ...(data.endDate && { endDate: new Date(data.endDate) }),
            ...(data.budgetAmount !== undefined && {
              budgetAmount: new Decimal(data.budgetAmount),
            }),
            ...(data.weight !== undefined && { weight: new Decimal(data.weight) }),
            ...(data.status && { status: data.status }),
          },
          include: stageInclude,
        });
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
    taskCount: number;
    completedTaskCount: number;
    taskProgress: number;
  }> {
    try {
      const stage = await prisma.stage.findFirst({
        where: { id: stageId, organizationId },
        select: { budgetAmount: true },
      });

      if (!stage) {
        throw handlePrismaError({ code: 'P2025' });
      }

      const [totalExpenses, taskStats] = await Promise.all([
        this.calculateExpensesTotal(organizationId, stageId),
        prisma.task.groupBy({
          by: ['status'],
          where: { stageId, organizationId },
          _count: true,
        }),
      ]);

      const budgetAmount = stage.budgetAmount.toNumber();
      const remaining = budgetAmount - totalExpenses;
      const percentUsed = budgetAmount > 0 ? (totalExpenses / budgetAmount) * 100 : 0;

      const taskCount = taskStats.reduce((sum, s) => sum + s._count, 0);
      const completedTaskCount =
        taskStats.find((s) => s.status === 'COMPLETED')?._count || 0;
      const taskProgress = taskCount > 0 ? (completedTaskCount / taskCount) * 100 : 0;

      return {
        budgetAmount,
        totalExpenses,
        remaining,
        percentUsed: Math.round(percentUsed * 100) / 100,
        taskCount,
        completedTaskCount,
        taskProgress: Math.round(taskProgress * 100) / 100,
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const stageRepository = new StageRepository();
