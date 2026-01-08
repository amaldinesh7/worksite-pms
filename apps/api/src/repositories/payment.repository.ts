import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Payment, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreatePaymentData {
  projectId: string;
  partyId?: string;
  amount: number;
  paymentDate: Date;
  notes?: string;
}

export interface UpdatePaymentData {
  partyId?: string | null;
  amount?: number;
  paymentDate?: Date;
  notes?: string | null;
}

export interface PaymentListOptions {
  skip?: number;
  take?: number;
  projectId?: string;
  partyId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class PaymentRepository {
  async create(organizationId: string, data: CreatePaymentData): Promise<Payment> {
    try {
      return await prisma.payment.create({
        data: {
          organizationId,
          projectId: data.projectId,
          partyId: data.partyId,
          amount: new Decimal(data.amount),
          paymentDate: data.paymentDate,
          notes: data.notes,
        },
        include: {
          project: true,
          party: true,
        },
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
        include: {
          project: true,
          party: true,
        },
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
          include: {
            project: true,
            party: true,
          },
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
      const existing = await prisma.payment.findFirst({
        where: { id, organizationId },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.payment.update({
        where: { id },
        data: {
          ...data,
          amount: data.amount !== undefined ? new Decimal(data.amount) : undefined,
        },
        include: {
          project: true,
          party: true,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      const existing = await prisma.payment.findFirst({
        where: { id, organizationId },
      });

      if (!existing) {
        throw handlePrismaError({ code: 'P2025' });
      }

      await prisma.payment.delete({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get total payments summary
  async getPaymentsSummary(
    organizationId: string,
    projectId?: string
  ): Promise<{ total: number; count: number }> {
    try {
      const result = await prisma.payment.aggregate({
        where: {
          organizationId,
          ...(projectId && { projectId }),
        },
        _sum: { amount: true },
        _count: true,
      });

      return {
        total: result._sum.amount?.toNumber() || 0,
        count: result._count,
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const paymentRepository = new PaymentRepository();
