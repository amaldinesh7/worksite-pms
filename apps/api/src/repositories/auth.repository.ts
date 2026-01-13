// Auth Repository - User lookup and creation for authentication

import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { User, Organization, OrganizationMember } from '@prisma/client';

// Type for user with organization membership
export type UserWithMembership = User & {
  memberships: (OrganizationMember & {
    organization: Organization;
  })[];
};

export class AuthRepository {
  /**
   * Find user by phone number with organization memberships
   */
  async findByPhone(phone: string): Promise<UserWithMembership | null> {
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

  /**
   * Find user by ID with memberships
   */
  async findById(id: string): Promise<UserWithMembership | null> {
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

  /**
   * Create a new user (called after OTP verification for new users)
   */
  async createUser(phone: string, name: string = 'User'): Promise<UserWithMembership> {
    try {
      return await prisma.user.create({
        data: {
          phone,
          name,
        },
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

  /**
   * Find or create user by phone (used during OTP verification)
   * Returns user with organization membership info
   */
  async findOrCreate(phone: string): Promise<{ user: UserWithMembership; isNewUser: boolean }> {
    try {
      const existingUser = await this.findByPhone(phone);

      if (existingUser) {
        return { user: existingUser, isNewUser: false };
      }

      // Create new user with default name
      const newUser = await this.createUser(phone);
      return { user: newUser, isNewUser: true };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const authRepository = new AuthRepository();
