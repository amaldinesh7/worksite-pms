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
  hasCredit?: boolean;
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
  ): Promise<{
    parties: (Party & { credit: number; _count?: { projectsAsClient: number } })[];
    total: number;
  }> {
    try {
      const where: Prisma.PartyWhereInput = {
        organizationId,
        ...(options?.search && {
          name: { contains: options.search, mode: 'insensitive' },
        }),
        ...(options?.type && { type: options.type }),
      };

      // Include projectsAsClient count for CLIENT type
      const includeProjectsCount = options?.type === 'CLIENT';

      // If hasCredit filter is enabled, we need to calculate credit for each party
      if (options?.hasCredit) {
        // Get all matching parties first
        const allParties = await prisma.party.findMany({
          where,
          orderBy: { name: 'asc' },
          ...(includeProjectsCount && {
            include: { _count: { select: { projectsAsClient: true } } },
          }),
        });

        // Calculate credit for all parties in parallel (fixes N+1)
        const partiesWithCredits = await Promise.all(
          allParties.map(async (party) => ({
            ...party,
            credit: await this.getPartyCredit(organizationId, party.id),
          }))
        );

        // Filter to only parties with positive credit
        const partiesWithCredit = partiesWithCredits.filter((p) => p.credit > 0);

        // Apply pagination manually
        const total = partiesWithCredit.length;
        const skip = options?.skip ?? 0;
        const take = options?.take ?? total;
        const paginatedParties = partiesWithCredit.slice(skip, skip + take);

        return { parties: paginatedParties, total };
      }

      const [parties, total] = await Promise.all([
        prisma.party.findMany({
          where,
          skip: options?.skip,
          take: options?.take,
          orderBy: { name: 'asc' },
          ...(includeProjectsCount && {
            include: { _count: { select: { projectsAsClient: true } } },
          }),
        }),
        prisma.party.count({ where }),
      ]);

      // Calculate credit for each party
      const partiesWithCredit = await Promise.all(
        parties.map(async (party) => {
          const credit = await this.getPartyCredit(organizationId, party.id);
          return { ...party, credit };
        })
      );

      return { parties: partiesWithCredit, total };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Helper to calculate credit (expenses - payments) for a party
  private async getPartyCredit(organizationId: string, partyId: string): Promise<number> {
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

    return totalExpenses - totalPayments;
  }

  async update(organizationId: string, id: string, data: UpdatePartyData): Promise<Party> {
    try {
      // Atomic org-scoped update
      const result = await prisma.party.updateMany({
        where: { id, organizationId },
        data,
      });

      if (result.count === 0) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.party.findUniqueOrThrow({ where: { id } });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      // Atomic org-scoped delete
      const result = await prisma.party.deleteMany({
        where: { id, organizationId },
      });

      if (result.count === 0) {
        throw handlePrismaError({ code: 'P2025' });
      }
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

  // Get projects associated with a party (via expenses) with credit calculations
  async getPartyProjects(
    organizationId: string,
    partyId: string,
    options?: { skip?: number; take?: number }
  ): Promise<{
    projects: Array<{
      id: string;
      name: string;
      totalExpenses: number;
      totalPayments: number;
      credit: number;
    }>;
    totals: {
      totalPaid: number;
      totalCredit: number;
    };
    total: number;
  }> {
    try {
      // Get all expenses for this party grouped by project
      const expenses = await prisma.expense.findMany({
        where: { organizationId, partyId },
        select: {
          projectId: true,
          rate: true,
          quantity: true,
          project: {
            select: { id: true, name: true },
          },
        },
      });

      // Get all payments for this party grouped by project
      const payments = await prisma.payment.findMany({
        where: { organizationId, partyId },
        select: {
          projectId: true,
          amount: true,
        },
      });

      // Build project map with expenses
      const projectMap = new Map<
        string,
        { id: string; name: string; totalExpenses: number; totalPayments: number }
      >();

      for (const expense of expenses) {
        const expenseAmount = expense.rate.toNumber() * expense.quantity.toNumber();
        const existing = projectMap.get(expense.projectId);
        if (existing) {
          existing.totalExpenses += expenseAmount;
        } else {
          projectMap.set(expense.projectId, {
            id: expense.project.id,
            name: expense.project.name,
            totalExpenses: expenseAmount,
            totalPayments: 0,
          });
        }
      }

      // Add payments to project map
      for (const payment of payments) {
        const existing = projectMap.get(payment.projectId);
        if (existing) {
          existing.totalPayments += payment.amount.toNumber();
        }
      }

      // Convert to array and calculate credits
      const allProjects = Array.from(projectMap.values()).map((p) => ({
        ...p,
        credit: p.totalExpenses - p.totalPayments,
      }));

      // Sort by credit (highest first)
      allProjects.sort((a, b) => b.credit - a.credit);

      // Calculate totals
      const totals = allProjects.reduce(
        (acc, p) => ({
          totalPaid: acc.totalPaid + p.totalPayments,
          totalCredit: acc.totalCredit + p.credit,
        }),
        { totalPaid: 0, totalCredit: 0 }
      );

      // Apply pagination
      const total = allProjects.length;
      const paginatedProjects = options?.take
        ? allProjects.slice(options.skip || 0, (options.skip || 0) + options.take)
        : allProjects;

      return {
        projects: paginatedProjects,
        totals,
        total,
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get transactions (payments or expenses) for a party, optionally filtered by project
  async getPartyTransactions(
    organizationId: string,
    partyId: string,
    options: {
      type: 'payments' | 'expenses';
      projectId?: string;
      skip?: number;
      take?: number;
    }
  ): Promise<{
    transactions: Array<{
      id: string;
      date: Date;
      title: string;
      amount: number;
      projectId: string;
      projectName: string;
    }>;
    total: number;
  }> {
    try {
      if (options.type === 'payments') {
        const where: Prisma.PaymentWhereInput = {
          organizationId,
          partyId,
          type: 'OUT', // Only outgoing payments to parties
          ...(options.projectId && { projectId: options.projectId }),
        };

        const [payments, total] = await Promise.all([
          prisma.payment.findMany({
            where,
            skip: options.skip,
            take: options.take,
            orderBy: { paymentDate: 'desc' },
            include: {
              project: { select: { id: true, name: true } },
              expense: { select: { expenseType: { select: { name: true } } } },
            },
          }),
          prisma.payment.count({ where }),
        ]);

        return {
          transactions: payments.map((p) => ({
            id: p.id,
            date: p.paymentDate,
            title: p.expense?.expenseType?.name || p.project?.name || 'Unknown',
            amount: p.amount.toNumber(),
            projectId: p.project?.id || '',
            projectName: p.project?.name || 'Unknown',
          })),
          total,
        };
      } else {
        // Expenses (purchases for vendors, wages for labour/subcontractor)
        const where: Prisma.ExpenseWhereInput = {
          organizationId,
          partyId,
          ...(options.projectId && { projectId: options.projectId }),
        };

        const [expenses, total] = await Promise.all([
          prisma.expense.findMany({
            where,
            skip: options.skip,
            take: options.take,
            orderBy: { expenseDate: 'desc' },
            include: {
              project: { select: { id: true, name: true } },
              expenseType: { select: { name: true } },
            },
          }),
          prisma.expense.count({ where }),
        ]);

        return {
          transactions: expenses.map((e) => ({
            id: e.id,
            date: e.expenseDate,
            title: e.expenseType?.name || e.project?.name || 'Unknown',
            amount: e.rate.toNumber() * e.quantity.toNumber(),
            projectId: e.project?.id || '',
            projectName: e.project?.name || 'Unknown',
          })),
          total,
        };
      }
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get projects where this party is the client
  async getClientProjects(
    organizationId: string,
    clientId: string
  ): Promise<
    Array<{
      id: string;
      name: string;
      status: string;
      location: string;
      startDate: Date;
      endDate: Date | null;
      amount: number | null;
    }>
  > {
    try {
      const projects = await prisma.project.findMany({
        where: {
          organizationId,
          clientId,
        },
        select: {
          id: true,
          name: true,
          status: true,
          location: true,
          startDate: true,
          endDate: true,
          amount: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      return projects.map((p) => ({
        ...p,
        amount: p.amount?.toNumber() ?? null,
      }));
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const partyRepository = new PartyRepository();
