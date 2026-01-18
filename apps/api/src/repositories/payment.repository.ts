import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Payment, Prisma, PaymentType, PaymentMode } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreatePaymentData {
  projectId: string;
  partyId?: string;
  expenseId?: string;
  type: PaymentType;
  paymentMode: PaymentMode;
  amount: number;
  paymentDate: Date;
  notes?: string;
}

export interface UpdatePaymentData {
  partyId?: string | null;
  expenseId?: string | null;
  type?: PaymentType;
  paymentMode?: PaymentMode;
  amount?: number;
  paymentDate?: Date;
  notes?: string | null;
}

export interface PaymentListOptions {
  skip?: number;
  take?: number;
  projectId?: string;
  partyId?: string;
  expenseId?: string;
  type?: PaymentType;
  startDate?: Date;
  endDate?: Date;
}

// Include object for payment queries
const paymentInclude = {
  project: true,
  party: true,
  expense: true,
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
          type: data.type,
          paymentMode: data.paymentMode,
          amount: new Decimal(data.amount),
          paymentDate: data.paymentDate,
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
        ...(options?.startDate || options?.endDate
          ? {
              paymentDate: {
                ...(options?.startDate && { gte: options.startDate }),
                ...(options?.endDate && { lte: options.endDate }),
              },
            }
          : {}),
      };

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip: options?.skip,
          take: options?.take,
          include: paymentInclude,
          orderBy: { paymentDate: 'desc' },
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
          ...data,
          amount: data.amount !== undefined ? new Decimal(data.amount) : undefined,
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
}

export const paymentRepository = new PaymentRepository();
