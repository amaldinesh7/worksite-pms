import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Project, Prisma } from '@prisma/client';

export interface CreateProjectData {
  name: string;
  clientId?: string;
  location: string;
  startDate: Date;
  amount?: number;
  projectTypeItemId: string;
}

export interface UpdateProjectData {
  name?: string;
  clientId?: string | null;
  location?: string;
  startDate?: Date;
  amount?: number | null;
  projectTypeItemId?: string;
}

export interface ProjectListOptions {
  skip?: number;
  take?: number;
  search?: string;
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
          amount: data.amount,
          projectTypeItemId: data.projectTypeItemId,
        },
        include: {
          projectType: true,
          client: true,
          stages: true,
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
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findAll(
    organizationId: string,
    options?: ProjectListOptions
  ): Promise<{ projects: Project[]; total: number }> {
    try {
      const where: Prisma.ProjectWhereInput = {
        organizationId,
        ...(options?.search && {
          OR: [
            { name: { contains: options.search, mode: 'insensitive' } },
            { client: { name: { contains: options.search, mode: 'insensitive' } } },
          ],
        }),
      };

      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where,
          skip: options?.skip,
          take: options?.take,
          include: {
            projectType: true,
            client: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.project.count({ where }),
      ]);

      return { projects, total };
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
}

export const projectRepository = new ProjectRepository();
