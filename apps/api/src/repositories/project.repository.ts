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
}

export interface ProjectListOptions {
  skip?: number;
  take?: number;
  search?: string;
  status?: ProjectStatus;
}

export class ProjectRepository {
  async create(organizationId: string, data: CreateProjectData): Promise<Project> {
    try {
      return await prisma.project.create({
        data: {
          organizationId,
          name: data.name,
          clientId: data.clientId,
          location: data.location,
          startDate: data.startDate,
          endDate: data.endDate,
          amount: data.amount,
          projectTypeItemId: data.projectTypeItemId,
          area: data.area,
          projectPicture: data.projectPicture,
          status: data.status || 'ACTIVE',
        },
        include: {
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
        },
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
          organizationId, // Organization scoping!
        },
        include: {
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
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findAll(
    organizationId: string,
    options?: ProjectListOptions
  ): Promise<{ projects: Project[]; total: number; counts: { all: number; active: number; onHold: number; completed: number } }> {
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

      const [projects, total, allCount, activeCount, onHoldCount, completedCount] = await Promise.all([
        prisma.project.findMany({
          where,
          skip: options?.skip,
          take: options?.take,
          include: {
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
          },
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
      // First check if project exists in this organization
      const existing = await prisma.project.findFirst({
        where: { id, organizationId },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.project.update({
        where: { id },
        data,
        include: {
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
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      // First check if project exists in this organization
      const existing = await prisma.project.findFirst({
        where: { id, organizationId },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      await prisma.project.delete({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Helper to calculate total expenses (rate * quantity)
  private async calculateExpensesTotal(
    organizationId: string,
    projectId: string
  ): Promise<number> {
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
      const balance = totalPaymentsIn - totalExpenses; // Money received - total expense value

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

      const access = await prisma.projectAccess.findUnique({
        where: {
          memberId_projectId: {
            memberId,
            projectId,
          },
        },
      });

      if (!access) {
        throw handlePrismaError({ code: 'P2025' });
      }

      await prisma.projectAccess.delete({
        where: { id: access.id },
      });
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
