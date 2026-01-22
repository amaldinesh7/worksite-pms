import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Prisma } from '@prisma/client';

export interface CreateTeamMemberData {
  organizationId: string;
  name: string;
  phone?: string;
  email?: string;
  location?: string;
  roleId: string;
}

export interface UpdateTeamMemberData {
  name?: string;
  phone?: string;
  email?: string;
  location?: string;
  roleId?: string;
}

export interface TeamMemberListOptions {
  skip?: number;
  take?: number;
  search?: string;
  roleId?: string;
}

export interface TeamMemberWithRole {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  location: string | null;
  createdAt: Date;
  membership: {
    id: string;
    roleId: string;
    role: {
      id: string;
      name: string;
      isSystemRole: boolean;
    };
  };
}

export class TeamRepository {
  /**
   * Get all team members for an organization
   */
  async findAll(
    organizationId: string,
    options?: TeamMemberListOptions
  ): Promise<{ members: TeamMemberWithRole[]; total: number }> {
    try {
      const where: Prisma.OrganizationMemberWhereInput = {
        organizationId,
        ...(options?.roleId && { roleId: options.roleId }),
        ...(options?.search && {
          user: {
            OR: [
              { name: { contains: options.search, mode: 'insensitive' } },
              { phone: { contains: options.search, mode: 'insensitive' } },
              { email: { contains: options.search, mode: 'insensitive' } },
            ],
          },
        }),
      };

      const [memberships, total] = await Promise.all([
        prisma.organizationMember.findMany({
          where,
          skip: options?.skip,
          take: options?.take,
          include: {
            user: true,
            role: {
              select: {
                id: true,
                name: true,
                isSystemRole: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.organizationMember.count({ where }),
      ]);

      // Transform to TeamMemberWithRole format
      const members: TeamMemberWithRole[] = memberships.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        phone: m.user.phone,
        email: m.user.email,
        location: m.user.location,
        createdAt: m.user.createdAt,
        membership: {
          id: m.id,
          roleId: m.roleId,
          role: m.role,
        },
      }));

      return { members, total };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get a team member by ID
   */
  async findById(organizationId: string, userId: string): Promise<TeamMemberWithRole | null> {
    try {
      const membership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId,
          },
        },
        include: {
          user: true,
          role: {
            select: {
              id: true,
              name: true,
              isSystemRole: true,
            },
          },
        },
      });

      if (!membership) return null;

      return {
        id: membership.user.id,
        name: membership.user.name,
        phone: membership.user.phone,
        email: membership.user.email,
        location: membership.user.location,
        createdAt: membership.user.createdAt,
        membership: {
          id: membership.id,
          roleId: membership.roleId,
          role: membership.role,
        },
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Create a new team member
   */
  async create(data: CreateTeamMemberData): Promise<TeamMemberWithRole> {
    try {
      // Check if user already exists by phone or email
      let user = null;
      if (data.phone) {
        user = await prisma.user.findUnique({ where: { phone: data.phone } });
      }
      if (!user && data.email) {
        user = await prisma.user.findUnique({ where: { email: data.email } });
      }

      // Create user if doesn't exist
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: data.name,
            phone: data.phone,
            email: data.email,
            location: data.location,
          },
        });
      }

      // Check if user is already a member of this organization
      const existingMembership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: data.organizationId,
            userId: user.id,
          },
        },
      });

      if (existingMembership) {
        throw {
          statusCode: 400,
          message: 'User is already a member of this organization',
          code: 'MEMBER_EXISTS',
        };
      }

      // Create organization membership
      const membership = await prisma.organizationMember.create({
        data: {
          organizationId: data.organizationId,
          userId: user.id,
          roleId: data.roleId,
        },
        include: {
          user: true,
          role: {
            select: {
              id: true,
              name: true,
              isSystemRole: true,
            },
          },
        },
      });

      return {
        id: membership.user.id,
        name: membership.user.name,
        phone: membership.user.phone,
        email: membership.user.email,
        location: membership.user.location,
        createdAt: membership.user.createdAt,
        membership: {
          id: membership.id,
          roleId: membership.roleId,
          role: membership.role,
        },
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Update a team member
   */
  async update(
    organizationId: string,
    userId: string,
    data: UpdateTeamMemberData
  ): Promise<TeamMemberWithRole> {
    try {
      // Update user info
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          location: data.location,
        },
      });

      // Update role if provided
      if (data.roleId) {
        await prisma.organizationMember.update({
          where: {
            organizationId_userId: {
              organizationId,
              userId,
            },
          },
          data: {
            roleId: data.roleId,
          },
        });
      }

      // Fetch updated membership
      const membership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId,
          },
        },
        include: {
          role: {
            select: {
              id: true,
              name: true,
              isSystemRole: true,
            },
          },
        },
      });

      if (!membership) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        location: user.location,
        createdAt: user.createdAt,
        membership: {
          id: membership.id,
          roleId: membership.roleId,
          role: membership.role,
        },
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Remove a team member from organization
   */
  async delete(organizationId: string, userId: string): Promise<void> {
    try {
      // Check if membership exists
      const membership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId,
          },
        },
        include: {
          role: true,
        },
      });

      if (!membership) {
        throw handlePrismaError({ code: 'P2025' });
      }

      // Check if this is the last admin
      if (membership.role.isSystemRole && membership.role.name === 'Admin') {
        const adminCount = await prisma.organizationMember.count({
          where: {
            organizationId,
            role: {
              name: 'Admin',
              isSystemRole: true,
            },
          },
        });

        if (adminCount <= 1) {
          throw {
            statusCode: 400,
            message: 'Cannot remove the last admin from the organization',
            code: 'LAST_ADMIN',
          };
        }
      }

      // Delete the membership (not the user - they might be in other orgs)
      await prisma.organizationMember.delete({
        where: {
          organizationId_userId: {
            organizationId,
            userId,
          },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const teamRepository = new TeamRepository();
