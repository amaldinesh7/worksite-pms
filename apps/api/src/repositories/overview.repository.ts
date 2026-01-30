import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { PartyType } from '@prisma/client';

/**
 * Overview Repository - Aggregates dashboard data
 */

export interface ProjectPL {
  id: string;
  name: string;
  clientName: string | null;
  budget: number;
  spent: number;
  remaining: number;
  healthPercent: number;
  status: string;
  isOverdue: boolean;
}

export interface KPIStats {
  activeProjects: number;
  outstandingReceivables: number;
  outstandingPayables: number;
  attentionNeeded: number;
}

export interface ProjectStatusBreakdown {
  active: number;
  onHold: number;
  completed: number;
}

export interface TodayTask {
  id: string;
  name: string;
  projectName: string;
  projectId: string;
  stageName: string;
  status: string;
  assignees: Array<{
    id: string;
    name: string;
    avatar: string | null;
  }>;
}

export interface CreditsSummary {
  vendors: { count: number; balance: number };
  labours: { count: number; balance: number };
  subcontractors: { count: number; balance: number };
  total: number;
}

export interface OutstandingItem {
  id: string;
  name: string;
  type: PartyType;
  amount: number;
  ageDays: number;
}

export interface Alert {
  type: 'budget_overrun' | 'approaching_limit' | 'overdue_stage' | 'pending_expense';
  count: number;
  items: Array<{
    id: string;
    name: string;
    detail: string;
  }>;
}

export interface OverviewData {
  kpiStats: KPIStats;
  projectStatusBreakdown: ProjectStatusBreakdown;
  projectsPL: ProjectPL[];
  todayTasks: TodayTask[];
  creditsSummary: CreditsSummary;
  outstandingPayables: OutstandingItem[];
  outstandingReceivables: OutstandingItem[];
  alerts: Alert[];
  recentProjects: Array<{
    id: string;
    name: string;
    clientName: string | null;
    status: string;
    progress: number;
    updatedAt: Date;
  }>;
}

export class OverviewRepository {
  /**
   * Get KPI statistics for the dashboard header
   */
  async getKPIStats(organizationId: string): Promise<KPIStats> {
    try {
      const [activeProjects, projects] = await Promise.all([
        prisma.project.count({ where: { organizationId, status: 'ACTIVE' } }),
        prisma.project.findMany({
          where: { organizationId },
          select: { id: true, amount: true, status: true },
        }),
      ]);

      // Calculate outstanding receivables (project budget - payments IN)
      let totalReceivables = 0;
      for (const project of projects) {
        if (project.status === 'COMPLETED') continue;
        const budget = project.amount?.toNumber() || 0;
        const paymentsIn = await prisma.payment.aggregate({
          where: { organizationId, projectId: project.id, type: 'IN' },
          _sum: { amount: true },
        });
        const received = paymentsIn._sum.amount?.toNumber() || 0;
        totalReceivables += Math.max(0, budget - received);
      }

      // Calculate outstanding payables (expenses - payments OUT)
      const expenses = await prisma.expense.findMany({
        where: { organizationId },
        select: { rate: true, quantity: true },
      });
      const totalExpenses = expenses.reduce(
        (sum, e) => sum + e.rate.toNumber() * e.quantity.toNumber(),
        0
      );

      const paymentsOut = await prisma.payment.aggregate({
        where: { organizationId, type: 'OUT' },
        _sum: { amount: true },
      });
      const totalPaymentsOut = paymentsOut._sum.amount?.toNumber() || 0;
      const outstandingPayables = Math.max(0, totalExpenses - totalPaymentsOut);

      // Count projects needing attention (over budget or overdue stages)
      const attentionNeeded = await this.countProjectsNeedingAttention(organizationId);

      return {
        activeProjects,
        outstandingReceivables: totalReceivables,
        outstandingPayables,
        attentionNeeded,
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get project status breakdown for donut chart
   */
  async getProjectStatusBreakdown(organizationId: string): Promise<ProjectStatusBreakdown> {
    try {
      const [active, onHold, completed] = await Promise.all([
        prisma.project.count({ where: { organizationId, status: 'ACTIVE' } }),
        prisma.project.count({ where: { organizationId, status: 'ON_HOLD' } }),
        prisma.project.count({ where: { organizationId, status: 'COMPLETED' } }),
      ]);

      return { active, onHold, completed };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get Project P/L data for the main table
   */
  async getProjectsPL(organizationId: string): Promise<ProjectPL[]> {
    try {
      const projects = await prisma.project.findMany({
        where: { organizationId },
        include: {
          client: { select: { name: true } },
          stages: { select: { endDate: true, status: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });

      const projectsPL: ProjectPL[] = [];

      for (const project of projects) {
        const budget = project.amount?.toNumber() || 0;

        // Calculate total spent (expenses)
        const expenses = await prisma.expense.findMany({
          where: { organizationId, projectId: project.id },
          select: { rate: true, quantity: true },
        });
        const spent = expenses.reduce(
          (sum, e) => sum + e.rate.toNumber() * e.quantity.toNumber(),
          0
        );

        const remaining = budget - spent;
        const healthPercent = budget > 0 ? Math.round((spent / budget) * 100) : 0;

        // Check if any active stage is overdue
        const now = new Date();
        const isOverdue = project.stages.some(
          (s) => s.status !== 'COMPLETED' && new Date(s.endDate) < now
        );

        projectsPL.push({
          id: project.id,
          name: project.name,
          clientName: project.client?.name || null,
          budget,
          spent,
          remaining,
          healthPercent,
          status: project.status,
          isOverdue,
        });
      }

      // Sort by health percent descending (worst first)
      return projectsPL.sort((a, b) => b.healthPercent - a.healthPercent);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get today's tasks
   */
  async getTodayTasks(organizationId: string): Promise<TodayTask[]> {
    try {
      // Get tasks that are in progress or not started
      const tasks = await prisma.task.findMany({
        where: {
          organizationId,
          status: { in: ['IN_PROGRESS', 'NOT_STARTED'] },
        },
        include: {
          stage: {
            include: {
              project: true,
            },
          },
          memberAssignments: {
            include: {
              member: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      return tasks.map((task) => ({
        id: task.id,
        name: task.name,
        projectName: task.stage.project.name,
        projectId: task.stage.project.id,
        stageName: task.stage.name,
        status: task.status,
        assignees: task.memberAssignments.map((ma) => ({
          id: ma.member.user.id,
          name: ma.member.user.name,
          avatar: null, // User model doesn't have profilePicture
        })),
      }));
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get credits summary by party type
   */
  async getCreditsSummary(organizationId: string): Promise<CreditsSummary> {
    try {
      const getBalanceByType = async (
        type: PartyType
      ): Promise<{ count: number; balance: number }> => {
        const parties = await prisma.party.findMany({
          where: { organizationId, type },
          select: { id: true },
        });

        const count = parties.length;
        if (count === 0) return { count: 0, balance: 0 };

        const partyIds = parties.map((p) => p.id);

        // Calculate expenses total
        const expenses = await prisma.expense.findMany({
          where: { organizationId, partyId: { in: partyIds } },
          select: { rate: true, quantity: true },
        });
        const totalExpenses = expenses.reduce(
          (sum, e) => sum + e.rate.toNumber() * e.quantity.toNumber(),
          0
        );

        // Calculate payments total
        const paymentsSum = await prisma.payment.aggregate({
          where: { organizationId, partyId: { in: partyIds } },
          _sum: { amount: true },
        });
        const totalPayments = paymentsSum._sum.amount?.toNumber() || 0;

        return { count, balance: Math.max(0, totalExpenses - totalPayments) };
      };

      const [vendors, labours, subcontractors] = await Promise.all([
        getBalanceByType('VENDOR'),
        getBalanceByType('LABOUR'),
        getBalanceByType('SUBCONTRACTOR'),
      ]);

      return {
        vendors,
        labours,
        subcontractors,
        total: vendors.balance + labours.balance + subcontractors.balance,
      };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get outstanding payables (top 5 by amount)
   */
  async getOutstandingPayables(organizationId: string): Promise<OutstandingItem[]> {
    try {
      const parties = await prisma.party.findMany({
        where: { organizationId, type: { in: ['VENDOR', 'LABOUR', 'SUBCONTRACTOR'] } },
        select: { id: true, name: true, type: true },
      });

      const outstandingItems: OutstandingItem[] = [];

      for (const party of parties) {
        // Calculate expenses
        const expenses = await prisma.expense.findMany({
          where: { organizationId, partyId: party.id },
          select: { rate: true, quantity: true, expenseDate: true },
          orderBy: { expenseDate: 'asc' },
        });

        if (expenses.length === 0) continue;

        const totalExpenses = expenses.reduce(
          (sum, e) => sum + e.rate.toNumber() * e.quantity.toNumber(),
          0
        );

        // Calculate payments
        const paymentsSum = await prisma.payment.aggregate({
          where: { organizationId, partyId: party.id },
          _sum: { amount: true },
        });
        const totalPayments = paymentsSum._sum.amount?.toNumber() || 0;

        const outstanding = totalExpenses - totalPayments;
        if (outstanding <= 0) continue;

        // Calculate age from oldest expense
        const oldestExpense = expenses[0];
        const ageDays = Math.floor(
          (Date.now() - oldestExpense.expenseDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        outstandingItems.push({
          id: party.id,
          name: party.name,
          type: party.type,
          amount: outstanding,
          ageDays,
        });
      }

      // Sort by amount descending and return top 5
      return outstandingItems.sort((a, b) => b.amount - a.amount).slice(0, 5);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get outstanding receivables (top 5 by amount)
   */
  async getOutstandingReceivables(organizationId: string): Promise<OutstandingItem[]> {
    try {
      const projects = await prisma.project.findMany({
        where: { organizationId, status: { not: 'COMPLETED' } },
        include: { client: { select: { id: true, name: true, type: true } } },
      });

      const receivables: OutstandingItem[] = [];

      for (const project of projects) {
        const budget = project.amount?.toNumber() || 0;
        if (budget === 0) continue;

        // Get payments received
        const paymentsIn = await prisma.payment.aggregate({
          where: { organizationId, projectId: project.id, type: 'IN' },
          _sum: { amount: true },
        });
        const received = paymentsIn._sum.amount?.toNumber() || 0;
        const outstanding = budget - received;

        if (outstanding <= 0) continue;

        // Calculate age from project start
        const ageDays = Math.floor(
          (Date.now() - project.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        receivables.push({
          id: project.id,
          name: project.client?.name || project.name,
          type: 'CLIENT',
          amount: outstanding,
          ageDays,
        });
      }

      // Sort by amount descending and return top 5
      return receivables.sort((a, b) => b.amount - a.amount).slice(0, 5);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get alerts for the alerts panel
   */
  async getAlerts(organizationId: string): Promise<Alert[]> {
    try {
      const alerts: Alert[] = [];

      // 1. Budget overruns (spent > budget)
      const budgetOverruns = await this.getProjectsOverBudget(organizationId);
      if (budgetOverruns.length > 0) {
        alerts.push({
          type: 'budget_overrun',
          count: budgetOverruns.length,
          items: budgetOverruns,
        });
      }

      // 2. Approaching limit (80-99% budget)
      const approachingLimit = await this.getProjectsApproachingLimit(organizationId);
      if (approachingLimit.length > 0) {
        alerts.push({
          type: 'approaching_limit',
          count: approachingLimit.length,
          items: approachingLimit,
        });
      }

      // 3. Overdue stages
      const overdueStages = await this.getOverdueStages(organizationId);
      if (overdueStages.length > 0) {
        alerts.push({
          type: 'overdue_stage',
          count: overdueStages.length,
          items: overdueStages,
        });
      }

      // 4. Pending expenses (status = PENDING)
      const pendingExpenses = await prisma.expense.count({
        where: { organizationId, status: 'PENDING' },
      });
      if (pendingExpenses > 0) {
        alerts.push({
          type: 'pending_expense',
          count: pendingExpenses,
          items: [],
        });
      }

      return alerts;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get recent projects (last 5 updated)
   */
  async getRecentProjects(organizationId: string) {
    try {
      const projects = await prisma.project.findMany({
        where: { organizationId },
        include: {
          client: { select: { name: true } },
          stages: { select: { budgetAmount: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      });

      const result = [];

      for (const project of projects) {
        // Calculate progress based on expenses vs total stage budget
        const totalBudget = project.stages.reduce(
          (sum, s) => sum + (s.budgetAmount?.toNumber() || 0),
          0
        );

        const expenses = await prisma.expense.findMany({
          where: { organizationId, projectId: project.id },
          select: { rate: true, quantity: true },
        });
        const totalExpenses = expenses.reduce(
          (sum, e) => sum + e.rate.toNumber() * e.quantity.toNumber(),
          0
        );

        const progress =
          totalBudget > 0 ? Math.min(Math.round((totalExpenses / totalBudget) * 100), 100) : 0;

        result.push({
          id: project.id,
          name: project.name,
          clientName: project.client?.name || null,
          status: project.status,
          progress,
          updatedAt: project.updatedAt,
        });
      }

      return result;
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Get complete overview data
   */
  async getOverviewData(organizationId: string): Promise<OverviewData> {
    const [
      kpiStats,
      projectStatusBreakdown,
      projectsPL,
      todayTasks,
      creditsSummary,
      outstandingPayables,
      outstandingReceivables,
      alerts,
      recentProjects,
    ] = await Promise.all([
      this.getKPIStats(organizationId),
      this.getProjectStatusBreakdown(organizationId),
      this.getProjectsPL(organizationId),
      this.getTodayTasks(organizationId),
      this.getCreditsSummary(organizationId),
      this.getOutstandingPayables(organizationId),
      this.getOutstandingReceivables(organizationId),
      this.getAlerts(organizationId),
      this.getRecentProjects(organizationId),
    ]);

    return {
      kpiStats,
      projectStatusBreakdown,
      projectsPL,
      todayTasks,
      creditsSummary,
      outstandingPayables,
      outstandingReceivables,
      alerts,
      recentProjects,
    };
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private async countProjectsNeedingAttention(organizationId: string): Promise<number> {
    const projects = await prisma.project.findMany({
      where: { organizationId, status: 'ACTIVE' },
      include: { stages: { select: { endDate: true, status: true } } },
    });

    let count = 0;
    const now = new Date();

    for (const project of projects) {
      const budget = project.amount?.toNumber() || 0;

      // Check if over budget
      const expenses = await prisma.expense.findMany({
        where: { organizationId, projectId: project.id },
        select: { rate: true, quantity: true },
      });
      const spent = expenses.reduce((sum, e) => sum + e.rate.toNumber() * e.quantity.toNumber(), 0);

      if (spent > budget && budget > 0) {
        count++;
        continue;
      }

      // Check if any stage is overdue
      const hasOverdueStage = project.stages.some(
        (s) => s.status !== 'COMPLETED' && new Date(s.endDate) < now
      );

      if (hasOverdueStage) {
        count++;
      }
    }

    return count;
  }

  private async getProjectsOverBudget(
    organizationId: string
  ): Promise<Array<{ id: string; name: string; detail: string }>> {
    const projects = await prisma.project.findMany({
      where: { organizationId, status: 'ACTIVE' },
      select: { id: true, name: true, amount: true },
    });

    const overBudget = [];

    for (const project of projects) {
      const budget = project.amount?.toNumber() || 0;
      if (budget === 0) continue;

      const expenses = await prisma.expense.findMany({
        where: { organizationId, projectId: project.id },
        select: { rate: true, quantity: true },
      });
      const spent = expenses.reduce((sum, e) => sum + e.rate.toNumber() * e.quantity.toNumber(), 0);

      if (spent > budget) {
        const overBy = spent - budget;
        overBudget.push({
          id: project.id,
          name: project.name,
          detail: `Over by ₹${Math.round(overBy).toLocaleString('en-IN')}`,
        });
      }
    }

    return overBudget;
  }

  private async getProjectsApproachingLimit(
    organizationId: string
  ): Promise<Array<{ id: string; name: string; detail: string }>> {
    const projects = await prisma.project.findMany({
      where: { organizationId, status: 'ACTIVE' },
      select: { id: true, name: true, amount: true },
    });

    const approaching = [];

    for (const project of projects) {
      const budget = project.amount?.toNumber() || 0;
      if (budget === 0) continue;

      const expenses = await prisma.expense.findMany({
        where: { organizationId, projectId: project.id },
        select: { rate: true, quantity: true },
      });
      const spent = expenses.reduce((sum, e) => sum + e.rate.toNumber() * e.quantity.toNumber(), 0);

      const percent = (spent / budget) * 100;
      if (percent >= 80 && percent < 100) {
        approaching.push({
          id: project.id,
          name: project.name,
          detail: `${Math.round(percent)}% of budget used`,
        });
      }
    }

    return approaching;
  }

  private async getOverdueStages(
    organizationId: string
  ): Promise<Array<{ id: string; name: string; detail: string }>> {
    const now = new Date();
    const stages = await prisma.stage.findMany({
      where: {
        organizationId,
        status: { not: 'COMPLETED' },
        endDate: { lt: now },
      },
      include: {
        project: { select: { name: true } },
      },
    });

    return stages.map((stage) => {
      const daysOverdue = Math.floor(
        (now.getTime() - stage.endDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        id: stage.id,
        name: stage.name,
        detail: `${stage.project.name} - ${daysOverdue} days overdue`,
      };
    });
  }
}

export const overviewRepository = new OverviewRepository();
