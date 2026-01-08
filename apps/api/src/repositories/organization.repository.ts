import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Organization, OrganizationMember, Prisma } from '@prisma/client';

export interface CreateOrganizationData {
  name: string;
}

export interface UpdateOrganizationData {
  name?: string;
}

export interface OrganizationListOptions {
  skip?: number;
  take?: number;
  search?: string;
}

export interface AddMemberData {
  userId: string;
  role: 'ADMIN' | 'MANAGER' | 'ACCOUNTANT';
}

export interface UpdateMemberRoleData {
  role: 'ADMIN' | 'MANAGER' | 'ACCOUNTANT';
}

export class OrganizationRepository {
  async create(data: CreateOrganizationData): Promise<Organization> {
    try {
      return await prisma.organization.create({
        data: {
          name: data.name,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(id: string): Promise<Organization | null> {
    try {
      return await prisma.organization.findUnique({
        where: { id },
        include: {
          members: {
            include: {
              user: true,
            },
          },
          _count: {
            select: {
              projects: true,
              parties: true,
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
    options?: OrganizationListOptions
  ): Promise<{ organizations: Organization[]; total: number }> {
    try {
      const where: Prisma.OrganizationWhereInput = {
        ...(options?.search && {
          name: { contains: options.search, mode: 'insensitive' },
        }),
      };

      const [organizations, total] = await Promise.all([
        prisma.organization.findMany({
          where,
          skip: options?.skip,
          take: options?.take,
          include: {
            _count: {
              select: {
                members: true,
                projects: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.organization.count({ where }),
      ]);

      return { organizations, total };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async update(id: string, data: UpdateOrganizationData): Promise<Organization> {
    try {
      const existing = await prisma.organization.findUnique({
        where: { id },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.organization.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existing = await prisma.organization.findUnique({
        where: { id },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      await prisma.organization.delete({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Member management
  async addMember(organizationId: string, data: AddMemberData): Promise<OrganizationMember> {
    try {
      return await prisma.organizationMember.create({
        data: {
          organizationId,
          userId: data.userId,
          role: data.role,
        },
        include: {
          user: true,
          organization: true,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async getMembers(organizationId: string): Promise<OrganizationMember[]> {
    try {
      return await prisma.organizationMember.findMany({
        where: { organizationId },
        include: {
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async updateMemberRole(
    organizationId: string,
    userId: string,
    data: UpdateMemberRoleData
  ): Promise<OrganizationMember> {
    try {
      const existing = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: { organizationId, userId },
        },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.organizationMember.update({
        where: {
          organizationId_userId: { organizationId, userId },
        },
        data: { role: data.role },
        include: {
          user: true,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async removeMember(organizationId: string, userId: string): Promise<void> {
    try {
      const existing = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: { organizationId, userId },
        },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      await prisma.organizationMember.delete({
        where: {
          organizationId_userId: { organizationId, userId },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Find organizations for a user
  async findByUserId(userId: string): Promise<Organization[]> {
    try {
      const memberships = await prisma.organizationMember.findMany({
        where: { userId },
        include: {
          organization: {
            include: {
              _count: {
                select: {
                  projects: true,
                  members: true,
                },
              },
            },
          },
        },
      });

      return memberships.map((m) => m.organization);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const organizationRepository = new OrganizationRepository();
