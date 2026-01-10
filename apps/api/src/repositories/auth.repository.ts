// Auth Repository - User lookup and creation for authentication

import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { User } from '@prisma/client';

export class AuthRepository {
  /**
   * Find user by phone number
   */
  async findByPhone(phone: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { phone },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Find user by ID with memberships
   */
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

  /**
   * Create a new user (called after OTP verification for new users)
   */
  async createUser(phone: string, name: string = 'User'): Promise<User> {
    try {
      return await prisma.user.create({
        data: {
          phone,
          name,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Find or create user by phone (used during OTP verification)
   */
  async findOrCreate(phone: string): Promise<{ user: User; isNewUser: boolean }> {
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
