import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Payment, Prisma, PaymentType, PaymentMode, PartyType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreatePaymentData {
  projectId: string;
  partyId?: string;
  expenseId?: string;
  recordedById?: string;
  type: PaymentType;
  paymentMode: PaymentMode;
  amount: number;
  paymentDate: Date;
  referenceNumber?: string;
  notes?: string;
}

export interface UpdatePaymentData {
  partyId?: string | null;
  expenseId?: string | null;
  recordedById?: string | null;
  type?: PaymentType;
  paymentMode?: PaymentMode;
  amount?: number;
  paymentDate?: Date;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface PaymentListOptions {
  skip?: number;
  take?: number;
  projectId?: string;
  partyId?: string;
  expenseId?: string;
  type?: PaymentType;
  partyType?: PartyType;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'paymentDate' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectPaymentSummary {
  projectBudget: number;
  totalReceived: number;
  totalPending: number;
  receivedPercentage: number;
}

// Include object for payment queries
const paymentInclude = {
  project: true,
  party: true,
  expense: true,
  recordedBy: {
    include: {
      user: true,
      role: true,
    },
  },
} as const;

export class PaymentRepository {
  async create(organizationId: string, data: CreatePaymentData): Promise<Payment> {
    try {
      return await prisma.payment.create({
        data: {
          organizationId,
          projectId: data.projectId,
          partyId: data.partyId,
          expenseId: data.expenseId,
          recordedById: data.recordedById,
          type: data.type,
          paymentMode: data.paymentMode,
          amount: new Decimal(data.amount),
          paymentDate: data.paymentDate,
          referenceNumber: data.referenceNumber,
          notes: data.notes,
        },
        include: paymentInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(organizationId: string, id: string): Promise<Payment | null> {
    try {
      return await prisma.payment.findFirst({
        where: {
          id,
          organizationId,
        },
        include: paymentInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findAll(
    organizationId: string,
    options?: PaymentListOptions
  ): Promise<{ payments: Payment[]; total: number }> {
    try {
      const where: Prisma.PaymentWhereInput = {
        organizationId,
        ...(options?.projectId && { projectId: options.projectId }),
        ...(options?.partyId && { partyId: options.partyId }),
        ...(options?.expenseId && { expenseId: options.expenseId }),
        ...(options?.type && { type: options.type }),
        ...(options?.partyType && { party: { type: options.partyType } }),
        ...(options?.startDate || options?.endDate
          ? {
              paymentDate: {
                ...(options?.startDate && { gte: options.startDate }),
                ...(options?.endDate && { lte: options.endDate }),
              },
            }
          : {}),
      };

      const sortBy = options?.sortBy || 'paymentDate';
      const sortOrder = options?.sortOrder || 'desc';

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip: options?.skip,
          take: options?.take,
          include: paymentInclude,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.payment.count({ where }),
      ]);

      return { payments, total };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async update(organizationId: string, id: string, data: UpdatePaymentData): Promise<Payment> {
    try {
      // Atomic org-scoped update
      const result = await prisma.payment.updateMany({
        where: { id, organizationId },
        data: {
          partyId: data.partyId,
          expenseId: data.expenseId,
          recordedById: data.recordedById,
          type: data.type,
          paymentMode: data.paymentMode,
          amount: data.amount !== undefined ? new Decimal(data.amount) : undefined,
          paymentDate: data.paymentDate,
          referenceNumber: data.referenceNumber,
          notes: data.notes,
        },
      });

      if (result.count === 0) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.payment.findUniqueOrThrow({
        where: { id },
        include: paymentInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      // Atomic org-scoped delete
      const result = await prisma.payment.deleteMany({
        where: { id, organizationId },
      });

      if (result.count === 0) {
        throw handlePrismaError({ code: 'P2025' });
      }
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get total payments summary with optional type filter
  async getPaymentsSummary(
    organizationId: string,
    projectId?: string,
    type?: PaymentType
  ): Promise<{ total: number; count: number; totalIn: number; totalOut: number }> {
    try {
      const baseWhere = {
        organizationId,
        ...(projectId && { projectId }),
      };

      // If type is specified, return simple summary
      if (type) {
        const result = await prisma.payment.aggregate({
          where: { ...baseWhere, type },
          _sum: { amount: true },
          _count: true,
        });

        return {
          total: result._sum.amount?.toNumber() || 0,
          count: result._count,
          totalIn: type === 'IN' ? result._sum.amount?.toNumber() || 0 : 0,
          totalOut: type === 'OUT' ? result._sum.amount?.toNumber() || 0 : 0,
        };
      }

      // Get both IN and OUT totals
      const [inResult, outResult] = await Promise.all([
        prisma.payment.aggregate({
          where: { ...baseWhere, type: 'IN' },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.payment.aggregate({
          where: { ...baseWhere, type: 'OUT' },
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      const totalIn = inResult._sum.amount?.toNumber() || 0;
      const totalOut = outResult._sum.amount?.toNumber() || 0;

      return {
        total: totalIn + totalOut,
        count: inResult._count + outResult._count,
        totalIn,
        totalOut,
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get project payment summary (for client payments tab)
  async getProjectPaymentSummary(
    organizationId: string,
    projectId: string
  ): Promise<ProjectPaymentSummary> {
    try {
      // Get project budget
      const project = await prisma.project.findFirst({
        where: { id: projectId, organizationId },
        select: { amount: true },
      });

      const projectBudget = project?.amount?.toNumber() || 0;

      // Get total received (type = IN)
      const receivedResult = await prisma.payment.aggregate({
        where: {
          organizationId,
          projectId,
          type: 'IN',
        },
        _sum: { amount: true },
      });

      const totalReceived = receivedResult._sum.amount?.toNumber() || 0;
      const totalPending = Math.max(0, projectBudget - totalReceived);
      const receivedPercentage = projectBudget > 0 ? (totalReceived / projectBudget) * 100 : 0;

      return {
        projectBudget,
        totalReceived,
        totalPending,
        receivedPercentage: Math.min(100, receivedPercentage),
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get client payments for a project (type = IN)
  async getClientPayments(
    organizationId: string,
    projectId: string,
    options?: Omit<PaymentListOptions, 'projectId' | 'type'>
  ): Promise<{ payments: Payment[]; total: number }> {
    return this.findAll(organizationId, {
      ...options,
      projectId,
      type: 'IN',
    });
  }

  // Get party payments for a project (type = OUT)
  async getPartyPayments(
    organizationId: string,
    projectId: string,
    options?: Omit<PaymentListOptions, 'projectId' | 'type'>
  ): Promise<{ payments: Payment[]; total: number }> {
    return this.findAll(organizationId, {
      ...options,
      projectId,
      type: 'OUT',
    });
  }

  // Get outstanding amount for a party in a project
  async getPartyOutstanding(
    organizationId: string,
    projectId: string,
    partyId: string
  ): Promise<number> {
    try {
      // Calculate total expense amount (sum of rate * quantity)
      const expenses = await prisma.expense.findMany({
        where: {
          organizationId,
          projectId,
          partyId,
        },
        select: {
          rate: true,
          quantity: true,
        },
      });

      const totalExpenses = expenses.reduce(
        (sum, exp) => sum + exp.rate.toNumber() * exp.quantity.toNumber(),
        0
      );

      // Get total payments to this party for this project
      const paymentResult = await prisma.payment.aggregate({
        where: {
          organizationId,
          projectId,
          partyId,
          type: 'OUT',
        },
        _sum: { amount: true },
      });

      const totalPayments = paymentResult._sum.amount?.toNumber() || 0;

      return Math.max(0, totalExpenses - totalPayments);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get unpaid expenses for a party in a project (for "pay against" dropdown)
  async getPartyUnpaidExpenses(
    organizationId: string,
    projectId: string,
    partyId: string
  ): Promise<
    Array<{
      id: string;
      description: string | null;
      totalAmount: number;
      paidAmount: number;
      outstanding: number;
      expenseDate: Date;
    }>
  > {
    try {
      const expenses = await prisma.expense.findMany({
        where: {
          organizationId,
          projectId,
          partyId,
        },
        include: {
          payments: {
            where: { type: 'OUT' },
            select: { amount: true },
          },
          expenseType: true,
        },
        orderBy: { expenseDate: 'desc' },
      });

      return expenses
        .map((expense) => {
          const totalAmount = expense.rate.toNumber() * expense.quantity.toNumber();
          const paidAmount = expense.payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);
          const outstanding = totalAmount - paidAmount;

          return {
            id: expense.id,
            description: expense.description || expense.expenseType.name,
            totalAmount,
            paidAmount,
            outstanding,
            expenseDate: expense.expenseDate,
          };
        })
        .filter((exp) => exp.outstanding > 0);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const paymentRepository = new PaymentRepository();
