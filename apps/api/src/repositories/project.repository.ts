import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Project, ProjectStatus, Prisma } from '@prisma/client';

export interface CreateProjectData {
  name: string;
  clientId?: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  amount?: number;
  projectTypeItemId: string;
  area?: string;
  projectPicture?: string;
  status?: ProjectStatus;
  memberIds?: string[];
}

export interface UpdateProjectData {
  name?: string;
  clientId?: string | null;
  location?: string;
  startDate?: Date;
  endDate?: Date | null;
  amount?: number | null;
  projectTypeItemId?: string;
  area?: string | null;
  projectPicture?: string | null;
  status?: ProjectStatus;
  memberIds?: string[];
}

export interface ProjectListOptions {
  skip?: number;
  take?: number;
  search?: string;
  status?: ProjectStatus;
}

// Include object for project queries
const projectInclude = {
  projectType: true,
  client: true,
  stages: true,
  projectAccess: {
    include: {
      member: {
        include: {
          user: true,
        },
      },
    },
  },
  _count: {
    select: {
      expenses: true,
      payments: true,
    },
  },
} as const;

// Lighter include for list queries
const projectListInclude = {
  projectType: true,
  client: true,
  projectAccess: {
    include: {
      member: {
        include: {
          user: true,
        },
      },
    },
  },
  _count: {
    select: {
      expenses: true,
      payments: true,
    },
  },
} as const;

export class ProjectRepository {
  async create(organizationId: string, data: CreateProjectData): Promise<Project> {
    try {
      const { memberIds, ...projectData } = data;

      // Use transaction to create project and member assignments atomically
      return await prisma.$transaction(async (tx) => {
        // Create the project
        const project = await tx.project.create({
          data: {
            organizationId,
            name: projectData.name,
            clientId: projectData.clientId,
            location: projectData.location,
            startDate: projectData.startDate,
            endDate: projectData.endDate,
            amount: projectData.amount,
            projectTypeItemId: projectData.projectTypeItemId,
            area: projectData.area,
            projectPicture: projectData.projectPicture,
            status: projectData.status || 'ACTIVE',
          },
        });

        // Create member assignments if provided
        if (memberIds && memberIds.length > 0) {
          await tx.projectAccess.createMany({
            data: memberIds.map((memberId) => ({
              projectId: project.id,
              memberId,
            })),
          });
        }

        // Return project with includes
        return await tx.project.findUniqueOrThrow({
          where: { id: project.id },
          include: projectInclude,
        });
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(organizationId: string, id: string): Promise<Project | null> {
    try {
      return await prisma.project.findFirst({
        where: {
          id,
          organizationId,
        },
        include: projectInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findAll(
    organizationId: string,
    options?: ProjectListOptions
  ): Promise<{
    projects: Project[];
    total: number;
    counts: { all: number; active: number; onHold: number; completed: number };
  }> {
    try {
      const where: Prisma.ProjectWhereInput = {
        organizationId,
        ...(options?.search && {
          OR: [
            { name: { contains: options.search, mode: 'insensitive' } },
            { client: { name: { contains: options.search, mode: 'insensitive' } } },
          ],
        }),
        ...(options?.status && { status: options.status }),
      };

      const [projects, total, allCount, activeCount, onHoldCount, completedCount] =
        await Promise.all([
          prisma.project.findMany({
            where,
            skip: options?.skip,
            take: options?.take,
            include: projectListInclude,
            orderBy: { updatedAt: 'desc' },
          }),
          prisma.project.count({ where }),
          prisma.project.count({ where: { organizationId } }),
          prisma.project.count({ where: { organizationId, status: 'ACTIVE' } }),
          prisma.project.count({ where: { organizationId, status: 'ON_HOLD' } }),
          prisma.project.count({ where: { organizationId, status: 'COMPLETED' } }),
        ]);

      return {
        projects,
        total,
        counts: {
          all: allCount,
          active: activeCount,
          onHold: onHoldCount,
          completed: completedCount,
        },
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async update(organizationId: string, id: string, data: UpdateProjectData): Promise<Project> {
    try {
      const { memberIds, ...projectData } = data;

      // Verify project exists in organization
      const existingProject = await prisma.project.findFirst({
        where: { id, organizationId },
      });

      if (!existingProject) {
        throw handlePrismaError({ code: 'P2025' });
      }

      // Use transaction to update project and member assignments atomically
      return await prisma.$transaction(async (tx) => {
        // Update member assignments if provided
        if (memberIds !== undefined) {
          // Delete existing assignments
          await tx.projectAccess.deleteMany({
            where: { projectId: id },
          });
          // Create new assignments
          if (memberIds.length > 0) {
            await tx.projectAccess.createMany({
              data: memberIds.map((memberId) => ({
                projectId: id,
                memberId,
              })),
            });
          }
        }

        // Update project fields (only if there are fields to update)
        if (Object.keys(projectData).length > 0) {
          await tx.project.update({
            where: { id },
            data: projectData,
          });
        }

        // Return project with includes
        return await tx.project.findUniqueOrThrow({
          where: { id },
          include: projectInclude,
        });
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      // Atomic org-scoped delete
      const result = await prisma.project.deleteMany({
        where: { id, organizationId },
      });

      if (result.count === 0) {
        throw handlePrismaError({ code: 'P2025' });
      }
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Helper to calculate total expenses (rate * quantity)
  private async calculateExpensesTotal(organizationId: string, projectId: string): Promise<number> {
    const expenses = await prisma.expense.findMany({
      where: { organizationId, projectId },
      select: { rate: true, quantity: true },
    });

    return expenses.reduce((sum, exp) => {
      return sum + exp.rate.toNumber() * exp.quantity.toNumber();
    }, 0);
  }

  // Analytics: Total expenses per project
  async getProjectStats(
    organizationId: string,
    projectId: string
  ): Promise<{
    totalExpenses: number;
    totalPayments: number;
    totalPaymentsIn: number;
    totalPaymentsOut: number;
    balance: number;
  }> {
    try {
      const [totalExpenses, paymentsInSum, paymentsOutSum] = await Promise.all([
        this.calculateExpensesTotal(organizationId, projectId),
        prisma.payment.aggregate({
          where: { organizationId, projectId, type: 'IN' },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: { organizationId, projectId, type: 'OUT' },
          _sum: { amount: true },
        }),
      ]);

      const totalPaymentsIn = paymentsInSum._sum?.amount?.toNumber() || 0;
      const totalPaymentsOut = paymentsOutSum._sum?.amount?.toNumber() || 0;
      const totalPayments = totalPaymentsIn + totalPaymentsOut;
      const balance = totalPaymentsIn - totalExpenses;

      return {
        totalExpenses,
        totalPayments,
        totalPaymentsIn,
        totalPaymentsOut,
        balance,
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // ============================================
  // Project Members Management
  // ============================================

  async addMember(organizationId: string, projectId: string, memberId: string) {
    try {
      // Verify project exists in organization
      const project = await prisma.project.findFirst({
        where: { id: projectId, organizationId },
      });

      if (!project) {
        throw handlePrismaError({ code: 'P2025' });
      }

      // Verify member belongs to organization
      const member = await prisma.organizationMember.findFirst({
        where: { id: memberId, organizationId },
      });

      if (!member) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.projectAccess.create({
        data: {
          memberId,
          projectId,
        },
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async removeMember(organizationId: string, projectId: string, memberId: string): Promise<void> {
    try {
      // Verify project exists in organization
      const project = await prisma.project.findFirst({
        where: { id: projectId, organizationId },
      });

      if (!project) {
        throw handlePrismaError({ code: 'P2025' });
      }

      // Atomic delete using composite key
      const result = await prisma.projectAccess.deleteMany({
        where: {
          memberId,
          projectId,
        },
      });

      if (result.count === 0) {
        throw handlePrismaError({ code: 'P2025' });
      }
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async getProjectMembers(organizationId: string, projectId: string) {
    try {
      const project = await prisma.project.findFirst({
        where: { id: projectId, organizationId },
      });

      if (!project) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.projectAccess.findMany({
        where: { projectId },
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Calculate progress based on expenses vs budget (stages)
  async calculateProgress(organizationId: string, projectId: string): Promise<number> {
    try {
      const [totalBudget, totalExpenses] = await Promise.all([
        prisma.stage.aggregate({
          where: { organizationId, projectId },
          _sum: { budgetAmount: true },
        }),
        this.calculateExpensesTotal(organizationId, projectId),
      ]);

      const budget = totalBudget._sum.budgetAmount?.toNumber() || 0;
      if (budget === 0) return 0;

      const progress = Math.min((totalExpenses / budget) * 100, 100);
      return Math.round(progress);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const projectRepository = new ProjectRepository();
