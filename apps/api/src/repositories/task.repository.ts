import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import type { Task, Prisma, TaskStatus } from '@prisma/client';

export interface CreateTaskData {
  stageId: string;
  name: string;
  description?: string;
  daysAllocated: number;
  status?: TaskStatus;
  memberIds?: string[];
  partyIds?: string[];
}

export interface UpdateTaskData {
  name?: string;
  description?: string | null;
  daysAllocated?: number;
  status?: TaskStatus;
  memberIds?: string[];
  partyIds?: string[];
}

export interface TaskListOptions {
  skip?: number;
  take?: number;
  stageId?: string;
  projectId?: string;
  status?: TaskStatus;
}

// Include object for task queries
const taskInclude = {
  stage: {
    select: {
      id: true,
      name: true,
      projectId: true,
    },
  },
  memberAssignments: {
    include: {
      member: {
        include: {
          user: true,
          role: true,
        },
      },
    },
  },
  partyAssignments: {
    include: {
      party: true,
    },
  },
} as const;

export class TaskRepository {
  async create(organizationId: string, data: CreateTaskData): Promise<Task> {
    try {
      // Verify stage belongs to organization
      const stage = await prisma.stage.findFirst({
        where: {
          id: data.stageId,
          organizationId,
        },
      });

      if (!stage) {
        throw handlePrismaError({ code: 'P2025' });
      }

      // Validate member IDs belong to organization
      if (data.memberIds && data.memberIds.length > 0) {
        const validMembers = await prisma.organizationMember.count({
          where: {
            id: { in: data.memberIds },
            organizationId,
          },
        });
        if (validMembers !== data.memberIds.length) {
          throw new Error('One or more member IDs are invalid');
        }
      }

      // Validate party IDs belong to organization (LABOUR or SUBCONTRACTOR)
      if (data.partyIds && data.partyIds.length > 0) {
        const validParties = await prisma.party.count({
          where: {
            id: { in: data.partyIds },
            organizationId,
            type: { in: ['LABOUR', 'SUBCONTRACTOR'] },
          },
        });
        if (validParties !== data.partyIds.length) {
          throw new Error('One or more party IDs are invalid');
        }
      }

      return await prisma.task.create({
        data: {
          organizationId,
          stageId: data.stageId,
          name: data.name,
          description: data.description,
          daysAllocated: data.daysAllocated,
          status: data.status || 'NOT_STARTED',
          memberAssignments: data.memberIds?.length
            ? {
                create: data.memberIds.map((memberId) => ({ memberId })),
              }
            : undefined,
          partyAssignments: data.partyIds?.length
            ? {
                create: data.partyIds.map((partyId) => ({ partyId })),
              }
            : undefined,
        },
        include: taskInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(organizationId: string, id: string): Promise<Task | null> {
    try {
      return await prisma.task.findFirst({
        where: {
          id,
          organizationId,
        },
        include: taskInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findByStage(organizationId: string, stageId: string): Promise<Task[]> {
    try {
      return await prisma.task.findMany({
        where: {
          organizationId,
          stageId,
        },
        include: taskInclude,
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findAll(
    organizationId: string,
    options?: TaskListOptions
  ): Promise<{ tasks: Task[]; total: number }> {
    try {
      const where: Prisma.TaskWhereInput = {
        organizationId,
        ...(options?.stageId && { stageId: options.stageId }),
        ...(options?.projectId && { stage: { projectId: options.projectId } }),
        ...(options?.status && { status: options.status }),
      };

      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          skip: options?.skip,
          take: options?.take,
          include: taskInclude,
          orderBy: { createdAt: 'asc' },
        }),
        prisma.task.count({ where }),
      ]);

      return { tasks, total };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findByProject(organizationId: string, projectId: string): Promise<Task[]> {
    try {
      return await prisma.task.findMany({
        where: {
          organizationId,
          stage: {
            projectId,
          },
        },
        include: taskInclude,
        orderBy: [
          { status: 'asc' }, // IN_PROGRESS first, then others
          { createdAt: 'asc' },
        ],
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async update(organizationId: string, id: string, data: UpdateTaskData): Promise<Task> {
    try {
      // Verify task exists and belongs to organization
      const existingTask = await prisma.task.findFirst({
        where: { id, organizationId },
      });

      if (!existingTask) {
        throw handlePrismaError({ code: 'P2025' });
      }

      // Validate member IDs if provided
      if (data.memberIds !== undefined && data.memberIds.length > 0) {
        const validMembers = await prisma.organizationMember.count({
          where: {
            id: { in: data.memberIds },
            organizationId,
          },
        });
        if (validMembers !== data.memberIds.length) {
          throw new Error('One or more member IDs are invalid');
        }
      }

      // Validate party IDs if provided
      if (data.partyIds !== undefined && data.partyIds.length > 0) {
        const validParties = await prisma.party.count({
          where: {
            id: { in: data.partyIds },
            organizationId,
            type: { in: ['LABOUR', 'SUBCONTRACTOR'] },
          },
        });
        if (validParties !== data.partyIds.length) {
          throw new Error('One or more party IDs are invalid');
        }
      }

      // Use transaction to update task and assignments atomically
      return await prisma.$transaction(async (tx) => {
        // Update member assignments if provided
        if (data.memberIds !== undefined) {
          // Delete existing assignments
          await tx.taskMemberAssignment.deleteMany({
            where: { taskId: id },
          });
          // Create new assignments
          if (data.memberIds.length > 0) {
            await tx.taskMemberAssignment.createMany({
              data: data.memberIds.map((memberId) => ({
                taskId: id,
                memberId,
              })),
            });
          }
        }

        // Update party assignments if provided
        if (data.partyIds !== undefined) {
          // Delete existing assignments
          await tx.taskPartyAssignment.deleteMany({
            where: { taskId: id },
          });
          // Create new assignments
          if (data.partyIds.length > 0) {
            await tx.taskPartyAssignment.createMany({
              data: data.partyIds.map((partyId) => ({
                taskId: id,
                partyId,
              })),
            });
          }
        }

        // Update task
        return await tx.task.update({
          where: { id },
          data: {
            ...(data.name && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.daysAllocated !== undefined && { daysAllocated: data.daysAllocated }),
            ...(data.status && { status: data.status }),
          },
          include: taskInclude,
        });
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async updateStatus(organizationId: string, id: string, status: TaskStatus): Promise<Task> {
    try {
      // Verify task exists and belongs to organization
      const existingTask = await prisma.task.findFirst({
        where: { id, organizationId },
      });

      if (!existingTask) {
        throw handlePrismaError({ code: 'P2025' });
      }

      return await prisma.task.update({
        where: { id },
        data: { status },
        include: taskInclude,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      // Atomic org-scoped delete
      const result = await prisma.task.deleteMany({
        where: { id, organizationId },
      });

      if (result.count === 0) {
        throw handlePrismaError({ code: 'P2025' });
      }
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const taskRepository = new TaskRepository();
