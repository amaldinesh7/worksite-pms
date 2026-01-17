import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Party, PartyType, Prisma } from '@prisma/client';

export interface CreatePartyData {
  name: string;
  phone?: string;
  location: string;
  type: PartyType;
}

export interface UpdatePartyData {
  name?: string;
  phone?: string;
  location?: string;
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
          location: data.location,
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
      // Calculate expenses total (rate * quantity)
      const expenses = await prisma.expense.findMany({
        where: { organizationId, partyId },
        select: { rate: true, quantity: true },
      });
      const totalExpenses = expenses.reduce(
        (sum, exp) => sum + exp.rate.toNumber() * exp.quantity.toNumber(),
        0
      );

      const paymentsSum = await prisma.payment.aggregate({
        where: { organizationId, partyId },
        _sum: { amount: true },
      });
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

  // Get summary of all parties by type (for stats cards)
  async getSummary(organizationId: string): Promise<{
    totalVendors: number;
    totalLabours: number;
    totalSubcontractors: number;
    vendorsBalance: number;
    laboursBalance: number;
    subcontractorsBalance: number;
  }> {
    try {
      // Get counts by type
      const [vendorCount, labourCount, subcontractorCount] = await Promise.all([
        prisma.party.count({ where: { organizationId, type: 'VENDOR' } }),
        prisma.party.count({ where: { organizationId, type: 'LABOUR' } }),
        prisma.party.count({ where: { organizationId, type: 'SUBCONTRACTOR' } }),
      ]);

      // Get balances by type (expenses - payments)
      const getBalanceByType = async (type: PartyType): Promise<number> => {
        const parties = await prisma.party.findMany({
          where: { organizationId, type },
          select: { id: true },
        });

        if (parties.length === 0) return 0;

        const partyIds = parties.map((p) => p.id);

        // Calculate expenses total (rate * quantity)
        const expenses = await prisma.expense.findMany({
          where: { organizationId, partyId: { in: partyIds } },
          select: { rate: true, quantity: true },
        });
        const totalExpenses = expenses.reduce(
          (sum, exp) => sum + exp.rate.toNumber() * exp.quantity.toNumber(),
          0
        );

        const paymentsSum = await prisma.payment.aggregate({
          where: { organizationId, partyId: { in: partyIds } },
          _sum: { amount: true },
        });
        const totalPayments = paymentsSum._sum.amount?.toNumber() || 0;
        return totalExpenses - totalPayments;
      };

      const [vendorsBalance, laboursBalance, subcontractorsBalance] = await Promise.all([
        getBalanceByType('VENDOR'),
        getBalanceByType('LABOUR'),
        getBalanceByType('SUBCONTRACTOR'),
      ]);

      return {
        totalVendors: vendorCount,
        totalLabours: labourCount,
        totalSubcontractors: subcontractorCount,
        vendorsBalance,
        laboursBalance,
        subcontractorsBalance,
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const partyRepository = new PartyRepository();
