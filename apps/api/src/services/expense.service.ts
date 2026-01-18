import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import {
  expenseRepository,
  type CreateExpenseData,
  type UpdateExpenseData,
  type ExpenseListOptions,
} from '../repositories/expense.repository';
import type { Expense, PaymentMode } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Extended create data that includes optional payment info
export interface CreateExpenseWithPaymentData extends CreateExpenseData {
  paidAmount?: number;
  paymentMode?: PaymentMode;
}

// Include object for expense queries (duplicated from repository for transaction use)
const expenseInclude = {
  project: true,
  party: true,
  stage: true,
  expenseType: true,
  materialType: true,
  labourType: true,
  subWorkType: true,
  payments: true,
} as const;

/**
 * Expense Service
 *
 * Handles business logic for expense operations, including:
 * - Creating expenses with optional linked payments (transaction)
 * - Delegating simple CRUD to repository
 */
export class ExpenseService {
  /**
   * Create an expense, optionally with a linked payment.
   * Uses a transaction when payment is included.
   */
  async create(organizationId: string, data: CreateExpenseWithPaymentData): Promise<Expense> {
    const { paidAmount, paymentMode, ...expenseData } = data;

    // If payment data provided, use transaction
    if (paidAmount !== undefined && paidAmount > 0 && paymentMode !== undefined) {
      return this.createWithPayment(organizationId, expenseData, paidAmount, paymentMode);
    }

    // Otherwise, simple create via repository
    return expenseRepository.create(organizationId, expenseData);
  }

  /**
   * Create expense with linked payment in a single transaction.
   */
  private async createWithPayment(
    organizationId: string,
    expenseData: CreateExpenseData,
    paidAmount: number,
    paymentMode: PaymentMode
  ): Promise<Expense> {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Create expense
        const expense = await tx.expense.create({
          data: {
            organizationId,
            projectId: expenseData.projectId,
            partyId: expenseData.partyId,
            stageId: expenseData.stageId,
            expenseTypeItemId: expenseData.expenseTypeItemId,
            materialTypeItemId: expenseData.materialTypeItemId,
            labourTypeItemId: expenseData.labourTypeItemId,
            subWorkTypeItemId: expenseData.subWorkTypeItemId,
            description: expenseData.description,
            rate: new Decimal(expenseData.rate),
            quantity: new Decimal(expenseData.quantity),
            expenseDate: expenseData.expenseDate,
            status: expenseData.status,
            notes: expenseData.notes,
          },
        });

        // 2. Create linked payment
        await tx.payment.create({
          data: {
            organizationId,
            projectId: expenseData.projectId,
            partyId: expenseData.partyId,
            expenseId: expense.id,
            type: 'OUT',
            paymentMode,
            amount: new Decimal(paidAmount),
            paymentDate: expenseData.expenseDate,
          },
        });

        // 3. Return expense with all relations
        return await tx.expense.findUniqueOrThrow({
          where: { id: expense.id },
          include: expenseInclude,
        });
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(organizationId: string, id: string) {
    return expenseRepository.findById(organizationId, id);
  }

  async findAll(organizationId: string, options?: ExpenseListOptions) {
    return expenseRepository.findAll(organizationId, options);
  }

  async update(organizationId: string, id: string, data: UpdateExpenseData) {
    return expenseRepository.update(organizationId, id, data);
  }

  async delete(organizationId: string, id: string) {
    return expenseRepository.delete(organizationId, id);
  }

  async getExpensesByCategory(organizationId: string, projectId?: string) {
    return expenseRepository.getExpensesByCategory(organizationId, projectId);
  }
}

export const expenseService = new ExpenseService();
