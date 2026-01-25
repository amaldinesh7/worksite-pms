import { buildApp } from '../app';
import { prisma } from '../lib/prisma';
import { faker } from '@faker-js/faker';
import type { FastifyInstance } from 'fastify';
import type { PartyType, PaymentType, PaymentMode } from '@prisma/client';
import type { RoleName } from '../lib/permissions';

/**
 * Creates a test app instance with logging disabled.
 * Use this in tests to avoid noisy console output.
 */
export async function createTestApp() {
  return buildApp({ logger: false });
}

/**
 * Test data generators
 */
export const testData = {
  /**
   * Create a test organization with default roles
   */
  async createOrganization(name?: string) {
    const org = await prisma.organization.create({
      data: {
        name: name || faker.company.name(),
      },
    });

    // Create default roles for the organization
    await prisma.role.createMany({
      data: [
        { organizationId: org.id, name: 'ADMIN', description: 'Administrator', isSystemRole: true },
        { organizationId: org.id, name: 'MANAGER', description: 'Manager', isSystemRole: true },
        {
          organizationId: org.id,
          name: 'ACCOUNTANT',
          description: 'Accountant',
          isSystemRole: true,
        },
        {
          organizationId: org.id,
          name: 'SUPERVISOR',
          description: 'Supervisor',
          isSystemRole: true,
        },
        { organizationId: org.id, name: 'CLIENT', description: 'Client', isSystemRole: true },
      ],
    });

    return org;
  },

  /**
   * Create a test user
   */
  async createUser(data?: Partial<{ name: string; phone: string; email: string }>) {
    return prisma.user.create({
      data: {
        name: data?.name || faker.person.fullName(),
        phone: data?.phone || faker.phone.number(),
        email: data?.email,
      },
    });
  },

  /**
   * Get role ID for an organization by role name
   */
  async getRoleId(organizationId: string, roleName: RoleName): Promise<string> {
    let role = await prisma.role.findUnique({
      where: {
        organizationId_name: {
          organizationId,
          name: roleName,
        },
      },
    });

    if (!role) {
      // Create the role if it doesn't exist
      role = await prisma.role.create({
        data: {
          organizationId,
          name: roleName,
          description: `${roleName} role`,
          isSystemRole: true,
        },
      });
    }

    return role.id;
  },

  /**
   * Create organization member
   */
  async createOrganizationMember(
    organizationId: string,
    userId: string,
    roleName: RoleName = 'ADMIN'
  ) {
    const roleId = await this.getRoleId(organizationId, roleName);

    return prisma.organizationMember.create({
      data: {
        organizationId,
        userId,
        roleId,
      },
      include: {
        role: true,
      },
    });
  },

  /**
   * Create a test category type (global, not per-organization)
   */
  async createCategoryType(key: string, label?: string) {
    return prisma.categoryType.create({
      data: {
        key,
        label: label || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      },
    });
  },

  /**
   * Create a test category item
   */
  async createCategoryItem(organizationId: string, categoryTypeId: string, name?: string) {
    return prisma.categoryItem.create({
      data: {
        organizationId,
        categoryTypeId,
        name: name || faker.commerce.productName(),
      },
    });
  },

  /**
   * Create a test project
   */
  async createProject(
    organizationId: string,
    projectTypeItemId: string,
    data?: Partial<{
      name: string;
      clientId: string;
      location: string;
      startDate: Date;
      amount: number;
    }>
  ) {
    return prisma.project.create({
      data: {
        organizationId,
        name: data?.name || faker.company.name() + ' Project',
        clientId: data?.clientId,
        location: data?.location || faker.location.city(),
        startDate: data?.startDate || new Date(),
        amount: data?.amount,
        projectTypeItemId,
      },
    });
  },

  /**
   * Create a test party
   */
  async createParty(
    organizationId: string,
    type: PartyType,
    data?: Partial<{
      name: string;
      phone: string;
      location: string;
      profilePicture: string;
    }>
  ) {
    return prisma.party.create({
      data: {
        organizationId,
        name: data?.name || faker.company.name(),
        phone: data?.phone || faker.phone.number(),
        location: data?.location || faker.location.streetAddress(),
        type,
        profilePicture: data?.profilePicture,
      },
    });
  },

  /**
   * Grant project access to a member
   */
  async grantProjectAccess(memberId: string, projectId: string) {
    return prisma.projectAccess.create({
      data: {
        memberId,
        projectId,
      },
    });
  },

  /**
   * Create a test stage
   */
  async createStage(
    organizationId: string,
    projectId: string,
    data?: Partial<{
      name: string;
      budgetAmount: number;
      startDate: Date;
      endDate: Date;
      weight: number;
    }>
  ) {
    const startDate = data?.startDate || new Date();
    const endDate = data?.endDate || new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days later

    return prisma.stage.create({
      data: {
        organizationId,
        projectId,
        name: data?.name || faker.commerce.department() + ' Stage',
        budgetAmount: data?.budgetAmount || faker.number.int({ min: 10000, max: 1000000 }),
        startDate,
        endDate,
        weight: data?.weight ?? 10,
      },
    });
  },

  /**
   * Create a test expense
   */
  async createExpense(
    organizationId: string,
    projectId: string,
    partyId: string,
    expenseTypeItemId: string,
    data?: Partial<{
      stageId: string;
      rate: number;
      quantity: number;
      expenseDate: Date;
      notes: string;
    }>
  ) {
    return prisma.expense.create({
      data: {
        organizationId,
        projectId,
        partyId,
        expenseTypeItemId,
        stageId: data?.stageId,
        rate: data?.rate || faker.number.int({ min: 100, max: 10000 }),
        quantity: data?.quantity || faker.number.int({ min: 1, max: 100 }),
        expenseDate: data?.expenseDate || new Date(),
        notes: data?.notes,
      },
    });
  },

  /**
   * Create a test payment
   */
  async createPayment(
    organizationId: string,
    projectId: string,
    data?: Partial<{
      partyId: string;
      expenseId: string;
      type: PaymentType;
      paymentMode: PaymentMode;
      amount: number;
      paymentDate: Date;
      notes: string;
    }>
  ) {
    return prisma.payment.create({
      data: {
        organizationId,
        projectId,
        partyId: data?.partyId,
        expenseId: data?.expenseId,
        type: data?.type || 'OUT',
        paymentMode: data?.paymentMode || 'CASH',
        amount: data?.amount || faker.number.int({ min: 1000, max: 100000 }),
        paymentDate: data?.paymentDate || new Date(),
        notes: data?.notes,
      },
    });
  },

  /**
   * Create a test document
   */
  async createDocument(
    organizationId: string,
    projectId: string,
    data?: Partial<{
      fileName: string;
      fileType: string;
      fileUrl: string;
      storagePath: string;
      mimeType: string;
    }>
  ) {
    return prisma.document.create({
      data: {
        organizationId,
        projectId,
        fileName: data?.fileName || 'test-file.pdf',
        fileType: data?.fileType || 'pdf',
        fileUrl: data?.fileUrl || 'http://localhost:9000/documents/test-file.pdf',
        storagePath: data?.storagePath || 'test/test-file.pdf',
        mimeType: data?.mimeType || 'application/pdf',
      },
    });
  },

  /**
   * Create a test attachment
   */
  async createAttachment(
    organizationId: string,
    data?: Partial<{
      fileName: string;
      fileUrl: string;
      storagePath: string;
      mimeType: string;
    }>
  ) {
    return prisma.attachment.create({
      data: {
        organizationId,
        fileName: data?.fileName || 'test-attachment.jpg',
        fileUrl: data?.fileUrl || 'http://localhost:9000/attachments/test-attachment.jpg',
        storagePath: data?.storagePath || 'attachments/test-attachment.jpg',
        mimeType: data?.mimeType || 'image/jpeg',
      },
    });
  },

  /**
   * Link an attachment to an entity
   */
  async linkAttachment(
    attachmentId: string,
    entityType: 'EXPENSE' | 'PAYMENT' | 'DOCUMENT',
    entityId: string
  ) {
    return prisma.entityAttachment.create({
      data: {
        attachmentId,
        entityType,
        entityId,
      },
    });
  },
};

/**
 * Test cleanup utilities
 */
export const cleanup = {
  /**
   * Delete all test data for an organization
   */
  async organization(organizationId: string) {
    // Delete in order of dependencies
    await prisma.projectAccess.deleteMany({
      where: { member: { organizationId } },
    });
    await prisma.entityAttachment.deleteMany({
      where: { attachment: { organizationId } },
    });
    await prisma.attachment.deleteMany({ where: { organizationId } });
    await prisma.payment.deleteMany({ where: { organizationId } });
    await prisma.expense.deleteMany({ where: { organizationId } });
    await prisma.document.deleteMany({ where: { organizationId } });
    await prisma.stage.deleteMany({ where: { organizationId } });
    await prisma.project.deleteMany({ where: { organizationId } });
    await prisma.party.deleteMany({ where: { organizationId } });
    await prisma.categoryItem.deleteMany({ where: { organizationId } });
    // CategoryTypes are global, don't delete them per-org
    await prisma.organizationMember.deleteMany({ where: { organizationId } });
    await prisma.role.deleteMany({ where: { organizationId } });
    await prisma.organization.delete({ where: { id: organizationId } });
  },

  /**
   * Delete all test data
   */
  async all() {
    await prisma.projectAccess.deleteMany();
    await prisma.entityAttachment.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.document.deleteMany();
    await prisma.stage.deleteMany();
    await prisma.project.deleteMany();
    await prisma.party.deleteMany();
    await prisma.categoryItem.deleteMany();
    await prisma.categoryType.deleteMany();
    await prisma.organizationMember.deleteMany();
    await prisma.role.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
  },
};

/**
 * Test request headers helper
 */
export function authHeaders(
  organizationId: string,
  userId: string = 'test-user',
  role: RoleName = 'ADMIN'
) {
  return {
    'x-organization-id': organizationId,
    'x-user-id': userId,
    'x-user-role': role,
  };
}

/**
 * Setup test context with organization and base data
 */
export async function setupTestContext() {
  const organization = await testData.createOrganization('Test Organization');

  // Create or find global category types
  let projectType = await prisma.categoryType.findUnique({ where: { key: 'project_type' } });
  if (!projectType) {
    projectType = await testData.createCategoryType('project_type', 'Project Type');
  }
  let expenseType = await prisma.categoryType.findUnique({ where: { key: 'expense_type' } });
  if (!expenseType) {
    expenseType = await testData.createCategoryType('expense_type', 'Expense Type');
  }

  // Create base category items
  const residentialType = await testData.createCategoryItem(
    organization.id,
    projectType.id,
    'Residential'
  );
  const commercialType = await testData.createCategoryItem(
    organization.id,
    projectType.id,
    'Commercial'
  );
  const materialsCategory = await testData.createCategoryItem(
    organization.id,
    expenseType.id,
    'Materials'
  );
  const labourCategory = await testData.createCategoryItem(
    organization.id,
    expenseType.id,
    'Labour'
  );

  return {
    organization,
    projectType,
    expenseType,
    residentialType,
    commercialType,
    materialsCategory,
    labourCategory,
  };
}
