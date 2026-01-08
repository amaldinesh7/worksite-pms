import { buildApp } from '../app';
import { prisma } from '../lib/prisma';
import { faker } from '@faker-js/faker';
import type { FastifyInstance } from 'fastify';

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
   * Create a test organization
   */
  async createOrganization(name?: string) {
    return prisma.organization.create({
      data: {
        name: name || faker.company.name(),
      },
    });
  },

  /**
   * Create a test user
   */
  async createUser(name?: string, phone?: string) {
    return prisma.user.create({
      data: {
        name: name || faker.person.fullName(),
        phone: phone || faker.phone.number(),
      },
    });
  },

  /**
   * Create a test category type
   */
  async createCategoryType(organizationId: string, key: string, label?: string) {
    return prisma.categoryType.create({
      data: {
        organizationId,
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
      clientName: string;
      location: string;
      startDate: Date;
    }>
  ) {
    return prisma.project.create({
      data: {
        organizationId,
        name: data?.name || faker.company.name() + ' Project',
        clientName: data?.clientName || faker.person.fullName(),
        location: data?.location || faker.location.city(),
        startDate: data?.startDate || new Date(),
        projectTypeItemId,
      },
    });
  },

  /**
   * Create a test party
   */
  async createParty(
    organizationId: string,
    type: 'VENDOR' | 'LABOUR' | 'SUBCONTRACTOR',
    data?: Partial<{ name: string; phone: string }>
  ) {
    return prisma.party.create({
      data: {
        organizationId,
        name: data?.name || faker.company.name(),
        phone: data?.phone || faker.phone.number(),
        type,
      },
    });
  },

  /**
   * Create a test stage
   */
  async createStage(
    organizationId: string,
    projectId: string,
    data?: Partial<{ name: string; budgetAmount: number }>
  ) {
    return prisma.stage.create({
      data: {
        organizationId,
        projectId,
        name: data?.name || faker.commerce.department() + ' Stage',
        budgetAmount: data?.budgetAmount || faker.number.int({ min: 10000, max: 1000000 }),
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
    expenseCategoryItemId: string,
    data?: Partial<{
      stageId: string;
      amount: number;
      expenseDate: Date;
      paymentMode: string;
      notes: string;
    }>
  ) {
    return prisma.expense.create({
      data: {
        organizationId,
        projectId,
        partyId,
        expenseCategoryItemId,
        stageId: data?.stageId,
        amount: data?.amount || faker.number.int({ min: 1000, max: 100000 }),
        expenseDate: data?.expenseDate || new Date(),
        paymentMode: data?.paymentMode || 'Cash',
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
      originalSize: number;
      compressedSize: number;
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
        originalSize: data?.originalSize || 1024000,
        compressedSize: data?.compressedSize || 512000,
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
    await prisma.payment.deleteMany({ where: { organizationId } });
    await prisma.expense.deleteMany({ where: { organizationId } });
    await prisma.document.deleteMany({ where: { organizationId } });
    await prisma.stage.deleteMany({ where: { organizationId } });
    await prisma.project.deleteMany({ where: { organizationId } });
    await prisma.party.deleteMany({ where: { organizationId } });
    await prisma.categoryItem.deleteMany({ where: { organizationId } });
    await prisma.categoryType.deleteMany({ where: { organizationId } });
    await prisma.organizationMember.deleteMany({ where: { organizationId } });
    await prisma.organization.delete({ where: { id: organizationId } });
  },

  /**
   * Delete all test data
   */
  async all() {
    await prisma.payment.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.document.deleteMany();
    await prisma.stage.deleteMany();
    await prisma.project.deleteMany();
    await prisma.party.deleteMany();
    await prisma.categoryItem.deleteMany();
    await prisma.categoryType.deleteMany();
    await prisma.organizationMember.deleteMany();
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
  role: string = 'ADMIN'
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

  // Create base category types
  const projectType = await testData.createCategoryType(
    organization.id,
    'project_type',
    'Project Type'
  );
  const expenseCategory = await testData.createCategoryType(
    organization.id,
    'expense_category',
    'Expense Category'
  );

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
    expenseCategory.id,
    'Materials'
  );
  const labourCategory = await testData.createCategoryItem(
    organization.id,
    expenseCategory.id,
    'Labour'
  );

  return {
    organization,
    projectType,
    expenseCategory,
    residentialType,
    commercialType,
    materialsCategory,
    labourCategory,
  };
}
