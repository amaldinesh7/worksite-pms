import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../lib/database-errors';
import { getDefaultCategoryTypes } from '../config/defaults/category-defaults';
import type { Organization, OrganizationMember, Prisma } from '@prisma/client';
import type { RoleName } from '../lib/permissions';

export interface CreateOrganizationData {
  name: string;
  ownerId?: string; // If provided, creates an OrganizationMember with ADMIN role
}

export interface UpdateOrganizationData {
  name?: string;
}

export interface OrganizationListOptions {
  skip?: number;
  take?: number;
  search?: string;
}

export interface AddMemberData {
  userId: string;
  role: RoleName;
}

export interface UpdateMemberRoleData {
  role: RoleName;
}

export interface FindByIdOptions {
  includeMembers?: boolean;
  includeCounts?: boolean;
}

/**
 * Ensures global category types exist in the database.
 * Creates them if they don't exist.
 * Returns a map of type key -> type ID.
 */
async function ensureGlobalCategoryTypes(
  tx: Prisma.TransactionClient
): Promise<Map<string, string>> {
  const defaultCategories = getDefaultCategoryTypes();

  // Check existing global types
  const existingTypes = await tx.categoryType.findMany({
    select: { id: true, key: true },
  });

  const existingKeys = new Set(existingTypes.map((t) => t.key));
  const typeIdMap = new Map(existingTypes.map((t) => [t.key, t.id]));

  // Find types that need to be created
  const missingTypes = defaultCategories.filter((ct) => !existingKeys.has(ct.key));

  if (missingTypes.length > 0) {
    await tx.categoryType.createMany({
      data: missingTypes.map((ct) => ({
        key: ct.key,
        label: ct.label,
      })),
    });

    // Fetch the newly created types
    const newTypes = await tx.categoryType.findMany({
      where: { key: { in: missingTypes.map((ct) => ct.key) } },
      select: { id: true, key: true },
    });

    // Add to map
    newTypes.forEach((t) => typeIdMap.set(t.key, t.id));
  }

  return typeIdMap;
}

/**
 * Creates default system roles for an organization.
 * Returns a map of role name -> role ID.
 */
async function createDefaultRoles(
  tx: Prisma.TransactionClient,
  organizationId: string
): Promise<Map<RoleName, string>> {
  const defaultRoles: Array<{ name: RoleName; description: string }> = [
    { name: 'ADMIN', description: 'Full access to all organization resources' },
    { name: 'MANAGER', description: 'Can manage projects and team members' },
    { name: 'ACCOUNTANT', description: 'Can manage finances and view projects' },
    { name: 'SUPERVISOR', description: 'Can manage assigned projects' },
    { name: 'CLIENT', description: 'Can view their own projects' },
  ];

  const roles = await tx.role.createManyAndReturn({
    data: defaultRoles.map((role) => ({
      organizationId,
      name: role.name,
      description: role.description,
      isSystemRole: true,
    })),
  });

  const roleMap = new Map<RoleName, string>();
  roles.forEach((role) => {
    roleMap.set(role.name as RoleName, role.id);
  });

  return roleMap;
}

/**
 * Gets the role ID for a given role name in an organization.
 * Uses upsert to avoid TOCTOU race conditions when multiple transactions
 * try to create the same role simultaneously.
 */
async function getOrCreateRoleId(
  tx: Prisma.TransactionClient,
  organizationId: string,
  roleName: RoleName
): Promise<string> {
  // Use upsert for idempotent create-or-get behavior
  const role = await tx.role.upsert({
    where: {
      organizationId_name: {
        organizationId,
        name: roleName,
      },
    },
    create: {
      organizationId,
      name: roleName,
      description: `${roleName} role`,
      isSystemRole: true,
    },
    update: {}, // No updates needed if role exists
  });

  return role.id;
}

export class OrganizationRepository {
  /**
   * Create organization with default category items and roles.
   * Global category types are created if they don't exist.
   * Organization-specific category items are created based on defaults.
   */
  async create(data: CreateOrganizationData): Promise<Organization> {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Create organization
        const organization = await tx.organization.create({
          data: { name: data.name },
        });

        // 2. Create default roles for the organization
        const roleMap = await createDefaultRoles(tx, organization.id);

        // 3. Ensure global category types exist
        const typeIdMap = await ensureGlobalCategoryTypes(tx);

        // 4. Create organization-specific category items
        const defaultCategories = getDefaultCategoryTypes();
        const categoryItemData = defaultCategories.flatMap((ct) =>
          ct.items.map((item) => ({
            organizationId: organization.id,
            categoryTypeId: typeIdMap.get(ct.key)!,
            name: item.name,
            isEditable: item.isEditable,
          }))
        );

        if (categoryItemData.length > 0) {
          await tx.categoryItem.createMany({ data: categoryItemData });
        }

        // 5. If ownerId is provided, add user as ADMIN member
        if (data.ownerId) {
          const adminRoleId = roleMap.get('ADMIN');
          if (adminRoleId) {
            await tx.organizationMember.create({
              data: {
                organizationId: organization.id,
                userId: data.ownerId,
                roleId: adminRoleId,
              },
            });
          }
        }

        return organization;
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  /**
   * Find organization by ID with selective includes.
   */
  async findById(id: string, options: FindByIdOptions = {}): Promise<Organization | null> {
    const { includeMembers = true, includeCounts = true } = options;

    try {
      return await prisma.organization.findUnique({
        where: { id },
        include: {
          ...(includeMembers && {
            members: {
              include: {
                user: true,
                role: true,
              },
            },
          }),
          ...(includeCounts && {
            _count: {
              select: {
                projects: true,
                parties: true,
                expenses: true,
                payments: true,
              },
            },
          }),
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findAll(
    options?: OrganizationListOptions
  ): Promise<{ organizations: Organization[]; total: number }> {
    try {
      const where: Prisma.OrganizationWhereInput = {
        ...(options?.search && {
          name: { contains: options.search, mode: 'insensitive' },
        }),
      };

      const [organizations, total] = await Promise.all([
        prisma.organization.findMany({
          where,
          skip: options?.skip,
          take: options?.take,
          include: {
            _count: {
              select: {
                members: true,
                projects: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.organization.count({ where }),
      ]);

      return { organizations, total };
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async update(id: string, data: UpdateOrganizationData): Promise<Organization> {
    try {
      // Prisma's update throws P2025 if record doesn't exist
      return await prisma.organization.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Prisma's delete throws P2025 if record doesn't exist
      await prisma.organization.delete({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Member management
  async addMember(organizationId: string, data: AddMemberData): Promise<OrganizationMember> {
    try {
      return await prisma.$transaction(async (tx) => {
        const roleId = await getOrCreateRoleId(tx, organizationId, data.role);

        return await tx.organizationMember.create({
          data: {
            organizationId,
            userId: data.userId,
            roleId,
          },
          include: {
            user: true,
            organization: true,
            role: true,
          },
        });
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async getMembers(organizationId: string): Promise<OrganizationMember[]> {
    try {
      return await prisma.organizationMember.findMany({
        where: { organizationId },
        include: {
          user: true,
          role: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async updateMemberRole(
    organizationId: string,
    userId: string,
    data: UpdateMemberRoleData
  ): Promise<OrganizationMember> {
    try {
      return await prisma.$transaction(async (tx) => {
        const roleId = await getOrCreateRoleId(tx, organizationId, data.role);

        return await tx.organizationMember.update({
          where: {
            organizationId_userId: { organizationId, userId },
          },
          data: { roleId },
          include: {
            user: true,
            role: true,
          },
        });
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async removeMember(organizationId: string, userId: string): Promise<void> {
    try {
      // Prisma's delete throws P2025 if record doesn't exist
      await prisma.organizationMember.delete({
        where: {
          organizationId_userId: { organizationId, userId },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  // Find organizations for a user
  async findByUserId(userId: string): Promise<Organization[]> {
    try {
      const memberships = await prisma.organizationMember.findMany({
        where: { userId },
        include: {
          organization: {
            include: {
              _count: {
                select: {
                  projects: true,
                  members: true,
                },
              },
            },
          },
        },
      });

      return memberships.map((m) => m.organization);
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
}

export const organizationRepository = new OrganizationRepository();
