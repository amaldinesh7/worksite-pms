import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Party, PartyType, Prisma } from '@prisma/client';

export interface CreatePartyData {
  name: string;
  phone?: string;
  type: PartyType;
}

export interface UpdatePartyData {
  name?: string;
  phone?: string;
  type?: PartyType;
}

export interface PartyListOptions {
  skip?: number;
  take?: number;
  search?: string;
  type?: PartyType;
}

export class PartyRepository {
  async create(organizationId: string, data: CreatePartyData): Promise<Party> {
    try {
      return await prisma.party.create({
        data: {
          organizationId,
          name: data.name,
          phone: data.phone,
          type: data.type,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(organizationId: string, id: string): Promise<Party | null> {
    try {
      return await prisma.party.findFirst({
        where: {
          id,
          organizationId,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findAll(
    organizationId: string,
    options?: PartyListOptions
  ): Promise<{ parties: Party[]; total: number }> {
    try {
      const where: Prisma.PartyWhereInput = {
        organizationId,
        ...(options?.search && {
          OR: [
            { name: { contains: options.search, mode: 'insensitive' } },
            { phone: { contains: options.search, mode: 'insensitive' } },
          ],
        }),
        ...(options?.type && { type: options.type }),
      };

      const [parties, total] = await Promise.all([
        prisma.party.findMany({
          where,
          skip: options?.skip,
          take: options?.take,
          orderBy: { name: 'asc' },
        }),
        prisma.party.count({ where }),
      ]);

      return { parties, total };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async update(organizationId: string, id: string, data: UpdatePartyData): Promise<Party> {
    try {
      const existing = await prisma.party.findFirst({
        where: { id, organizationId },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.party.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      const existing = await prisma.party.findFirst({
        where: { id, organizationId },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      await prisma.party.delete({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get party statistics (total expenses, payments, balance)
  async getPartyStats(
    organizationId: string,
    partyId: string
  ): Promise<{
    totalExpenses: number;
    totalPayments: number;
    balance: number;
  }> {
    try {
      const [expensesSum, paymentsSum] = await Promise.all([
        prisma.expense.aggregate({
          where: { organizationId, partyId },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: { organizationId, partyId },
          _sum: { amount: true },
        }),
      ]);

      const totalExpenses = expensesSum._sum.amount?.toNumber() || 0;
      const totalPayments = paymentsSum._sum.amount?.toNumber() || 0;
      const balance = totalExpenses - totalPayments;

      return {
        totalExpenses,
        totalPayments,
        balance,
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const partyRepository = new PartyRepository();
