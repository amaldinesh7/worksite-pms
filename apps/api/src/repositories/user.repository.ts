import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { User, Prisma } from '@prisma/client';

export interface CreateUserData {
  name: string;
  phone: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
}

export interface UserListOptions {
  skip?: number;
  take?: number;
  search?: string;
}

export class UserRepository {
  async create(data: CreateUserData): Promise<User> {
    try {
      return await prisma.user.create({
        data: {
          name: data.name,
          phone: data.phone,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          memberships: {
            include: {
              organization: true,
            },
          },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findByPhone(phone: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { phone },
        include: {
          memberships: {
            include: {
              organization: true,
            },
          },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findAll(options?: UserListOptions): Promise<{ users: User[]; total: number }> {
    try {
      const where: Prisma.UserWhereInput = {
        ...(options?.search && {
          OR: [
            { name: { contains: options.search, mode: 'insensitive' } },
            { phone: { contains: options.search, mode: 'insensitive' } },
          ],
        }),
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: options?.skip,
          take: options?.take,
          include: {
            _count: {
              select: {
                memberships: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      return { users, total };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    try {
      const existing = await prisma.user.findUnique({
        where: { id },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existing = await prisma.user.findUnique({
        where: { id },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get user's organizations with role
  async getUserOrganizations(userId: string) {
    try {
      return await prisma.organizationMember.findMany({
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
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const userRepository = new UserRepository();
