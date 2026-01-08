import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Project, Prisma } from '@prisma/client';

export interface CreateProjectData {
  name: string;
  clientName: string;
  location: string;
  startDate: Date;
  projectTypeItemId: string;
}

export interface UpdateProjectData {
  name?: string;
  clientName?: string;
  location?: string;
  startDate?: Date;
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
          clientName: data.clientName,
          location: data.location,
          startDate: data.startDate,
          projectTypeItemId: data.projectTypeItemId,
        },
        include: {
          projectType: true,
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
            { clientName: { contains: options.search, mode: 'insensitive' } },
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

  // Analytics: Total expenses per project
  async getProjectStats(
    organizationId: string,
    projectId: string
  ): Promise<{
    totalExpenses: number;
    totalPayments: number;
    credits: number;
  }> {
    try {
      const [expensesSum, paymentsSum] = await Promise.all([
        prisma.expense.aggregate({
          where: { organizationId, projectId },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: { organizationId, projectId },
          _sum: { amount: true },
        }),
      ]);

      const totalExpenses = expensesSum._sum.amount?.toNumber() || 0;
      const totalPayments = paymentsSum._sum.amount?.toNumber() || 0;
      const credits = totalExpenses - totalPayments;

      return {
        totalExpenses,
        totalPayments,
        credits,
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const projectRepository = new ProjectRepository();
