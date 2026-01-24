import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { MemberAdvance, Prisma, PaymentMode } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateMemberAdvanceData {
  projectId: string;
  memberId: string;
  amount: number;
  purpose: string;
  paymentMode: PaymentMode;
  advanceDate: Date;
  expectedSettlementDate?: Date;
  notes?: string;
}

export interface UpdateMemberAdvanceData {
  amount?: number;
  purpose?: string;
  paymentMode?: PaymentMode;
  advanceDate?: Date;
  expectedSettlementDate?: Date | null;
  notes?: string | null;
}

export interface MemberAdvanceListOptions {
  skip?: number;
  take?: number;
  projectId?: string;
  memberId?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'advanceDate' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface MemberAdvanceSummary {
  memberId: string;
  memberName: string;
  memberRole: string;
  totalAdvanceGiven: number;
  expensesLogged: number;
  balance: number;
}

export interface MemberProjectBalance {
  projectId: string;
  projectName: string;
  balance: number;
}

// Include object for member advance queries
const memberAdvanceInclude = {
  project: true,
  member: {
    include: {
      user: true,
      role: true,
    },
  },
} as const;

export class MemberAdvanceRepository {
  async create(organizationId: string, data: CreateMemberAdvanceData): Promise<MemberAdvance> {
    try {
      return await prisma.memberAdvance.create({
        data: {
          organizationId,
          projectId: data.projectId,
          memberId: data.memberId,
          amount: new Decimal(data.amount),
          purpose: data.purpose,
          paymentMode: data.paymentMode,
          advanceDate: data.advanceDate,
          expectedSettlementDate: data.expectedSettlementDate,
          notes: data.notes,
        },
        include: memberAdvanceInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(organizationId: string, id: string): Promise<MemberAdvance | null> {
    try {
      return await prisma.memberAdvance.findFirst({
        where: {
          id,
          organizationId,
        },
        include: memberAdvanceInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findAll(
    organizationId: string,
    options?: MemberAdvanceListOptions
  ): Promise<{ advances: MemberAdvance[]; total: number }> {
    try {
      const where: Prisma.MemberAdvanceWhereInput = {
        organizationId,
        ...(options?.projectId && { projectId: options.projectId }),
        ...(options?.memberId && { memberId: options.memberId }),
        ...(options?.startDate || options?.endDate
          ? {
              advanceDate: {
                ...(options?.startDate && { gte: options.startDate }),
                ...(options?.endDate && { lte: options.endDate }),
              },
            }
          : {}),
      };

      const sortBy = options?.sortBy || 'advanceDate';
      const sortOrder = options?.sortOrder || 'desc';

      const [advances, total] = await Promise.all([
        prisma.memberAdvance.findMany({
          where,
          skip: options?.skip,
          take: options?.take,
          include: memberAdvanceInclude,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.memberAdvance.count({ where }),
      ]);

      return { advances, total };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async update(
    organizationId: string,
    id: string,
    data: UpdateMemberAdvanceData
  ): Promise<MemberAdvance> {
    try {
      const result = await prisma.memberAdvance.updateMany({
        where: { id, organizationId },
        data: {
          amount: data.amount !== undefined ? new Decimal(data.amount) : undefined,
          purpose: data.purpose,
          paymentMode: data.paymentMode,
          advanceDate: data.advanceDate,
          expectedSettlementDate: data.expectedSettlementDate,
          notes: data.notes,
        },
      });

      if (result.count === 0) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.memberAdvance.findUniqueOrThrow({
        where: { id },
        include: memberAdvanceInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      const result = await prisma.memberAdvance.deleteMany({
        where: { id, organizationId },
      });

      if (result.count === 0) {
        throw handlePrismaError({ code: 'P2025' });
      }
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get member advance summary for a specific member in a project
  async getMemberAdvanceSummary(
    organizationId: string,
    projectId: string,
    memberId: string
  ): Promise<MemberAdvanceSummary | null> {
    try {
      // Get member details
      const member = await prisma.organizationMember.findFirst({
        where: {
          id: memberId,
          organizationId,
        },
        include: {
          user: true,
          role: true,
        },
      });

      if (!member) {
        return null;
      }

      // Get total advances given to this member for this project
      const advanceResult = await prisma.memberAdvance.aggregate({
        where: {
          organizationId,
          projectId,
          memberId,
        },
        _sum: { amount: true },
      });

      const totalAdvanceGiven = advanceResult._sum.amount?.toNumber() || 0;

      // For now, expenses logged is 0 since we're not auto-linking
      // In the future, this could track expenses logged by this member
      const expensesLogged = 0;

      const balance = totalAdvanceGiven - expensesLogged;

      return {
        memberId: member.id,
        memberName: member.user.name,
        memberRole: member.role.name,
        totalAdvanceGiven,
        expensesLogged,
        balance,
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get all members with advances in a project
  async getProjectMemberAdvanceSummaries(
    organizationId: string,
    projectId: string
  ): Promise<MemberAdvanceSummary[]> {
    try {
      // Get all unique members who have received advances for this project
      const advances = await prisma.memberAdvance.findMany({
        where: {
          organizationId,
          projectId,
        },
        include: {
          member: {
            include: {
              user: true,
              role: true,
            },
          },
        },
      });

      // Group by member and calculate totals
      const memberMap = new Map<string, MemberAdvanceSummary>();

      for (const advance of advances) {
        const existing = memberMap.get(advance.memberId);
        const amount = advance.amount.toNumber();

        if (existing) {
          existing.totalAdvanceGiven += amount;
          existing.balance = existing.totalAdvanceGiven - existing.expensesLogged;
        } else {
          memberMap.set(advance.memberId, {
            memberId: advance.memberId,
            memberName: advance.member.user.name,
            memberRole: advance.member.role.name,
            totalAdvanceGiven: amount,
            expensesLogged: 0,
            balance: amount,
          });
        }
      }

      return Array.from(memberMap.values());
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get project members who can receive advances (for dropdown)
  async getProjectMembers(
    organizationId: string,
    projectId: string
  ): Promise<Array<{ id: string; name: string; role: string }>> {
    try {
      const projectAccess = await prisma.projectAccess.findMany({
        where: {
          projectId,
          member: {
            organizationId,
          },
        },
        include: {
          member: {
            include: {
              user: true,
              role: true,
            },
          },
        },
      });

      return projectAccess.map((access) => ({
        id: access.member.id,
        name: access.member.user.name,
        role: access.member.role.name,
      }));
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get member balances across all projects (for team directory)
  async getMemberBalancesAcrossProjects(
    organizationId: string,
    memberId: string
  ): Promise<MemberProjectBalance[]> {
    try {
      // Get all advances for this member grouped by project
      const advances = await prisma.memberAdvance.findMany({
        where: {
          organizationId,
          memberId,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Group by project and calculate totals
      const projectMap = new Map<string, MemberProjectBalance>();

      for (const advance of advances) {
        const existing = projectMap.get(advance.projectId);
        const amount = advance.amount.toNumber();

        if (existing) {
          existing.balance += amount;
        } else {
          projectMap.set(advance.projectId, {
            projectId: advance.projectId,
            projectName: advance.project.name,
            balance: amount,
          });
        }
      }

      return Array.from(projectMap.values());
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get total balance for a member across all projects
  async getMemberTotalBalance(organizationId: string, memberId: string): Promise<number> {
    try {
      const result = await prisma.memberAdvance.aggregate({
        where: {
          organizationId,
          memberId,
        },
        _sum: { amount: true },
      });

      return result._sum.amount?.toNumber() || 0;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Get total balances for multiple members in a single batch query
  async getMemberTotalBalancesBatch(
    organizationId: string,
    memberIds: string[]
  ): Promise<Record<string, number>> {
    try {
      // Use groupBy to get all balances in a single query
      const results = await prisma.memberAdvance.groupBy({
        by: ['memberId'],
        where: {
          organizationId,
          memberId: { in: memberIds },
        },
        _sum: { amount: true },
      });

      // Build a map of memberId -> balance
      const balanceMap: Record<string, number> = {};

      // Initialize all memberIds with 0
      for (const memberId of memberIds) {
        balanceMap[memberId] = 0;
      }

      // Fill in actual balances from query results
      for (const result of results) {
        balanceMap[result.memberId] = result._sum.amount?.toNumber() || 0;
      }

      return balanceMap;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const memberAdvanceRepository = new MemberAdvanceRepository();
