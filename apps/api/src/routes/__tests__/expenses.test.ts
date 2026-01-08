import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  createTestApp,
  testData,
  cleanup,
  authHeaders,
  setupTestContext,
} from '../../tests/helper';
import { prisma } from '../../lib/prisma';
import type { FastifyInstance } from 'fastify';

describe('Expenses API', () => {
  let app: FastifyInstance;
  let ctx: Awaited<ReturnType<typeof setupTestContext>>;
  let projectId: string;
  let partyId: string;

  beforeAll(async () => {
    app = await createTestApp();
    ctx = await setupTestContext();
    const project = await testData.createProject(ctx.organization.id, ctx.residentialType.id);
    projectId = project.id;
    const party = await testData.createParty(ctx.organization.id, 'VENDOR');
    partyId = party.id;
  });

  afterAll(async () => {
    await cleanup.organization(ctx.organization.id);
    await app.close();
  });

  beforeEach(async () => {
    await prisma.expense.deleteMany({ where: { organizationId: ctx.organization.id } });
  });

  describe('POST /api/expenses', () => {
    it('should create expense successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/expenses',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          partyId,
          expenseCategoryItemId: ctx.materialsCategory.id,
          amount: 50000,
          expenseDate: new Date().toISOString(),
          paymentMode: 'Cash',
          notes: 'Test expense',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(parseFloat(body.data.amount)).toBe(50000);
      expect(body.data.paymentMode).toBe('Cash');
    });

    it('should reject expense without required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/expenses',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          // Missing partyId, expenseCategoryItemId, etc.
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject negative amount', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/expenses',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          partyId,
          expenseCategoryItemId: ctx.materialsCategory.id,
          amount: -1000,
          expenseDate: new Date().toISOString(),
          paymentMode: 'Cash',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should create expense with stage', async () => {
      const stage = await testData.createStage(ctx.organization.id, projectId, {
        name: 'Foundation',
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/expenses',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          partyId,
          stageId: stage.id,
          expenseCategoryItemId: ctx.materialsCategory.id,
          amount: 25000,
          expenseDate: new Date().toISOString(),
          paymentMode: 'Bank Transfer',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.data.stageId).toBe(stage.id);
    });
  });

  describe('GET /api/expenses', () => {
    it('should list expenses with pagination', async () => {
      await Promise.all([
        testData.createExpense(ctx.organization.id, projectId, partyId, ctx.materialsCategory.id),
        testData.createExpense(ctx.organization.id, projectId, partyId, ctx.materialsCategory.id),
        testData.createExpense(ctx.organization.id, projectId, partyId, ctx.materialsCategory.id),
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/expenses?page=1&limit=2',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(2);
      expect(body.data.pagination.total).toBe(3);
    });

    it('should filter expenses by project', async () => {
      const otherProject = await testData.createProject(
        ctx.organization.id,
        ctx.residentialType.id
      );

      await testData.createExpense(
        ctx.organization.id,
        projectId,
        partyId,
        ctx.materialsCategory.id
      );
      await testData.createExpense(
        ctx.organization.id,
        otherProject.id,
        partyId,
        ctx.materialsCategory.id
      );

      const response = await app.inject({
        method: 'GET',
        url: `/api/expenses?projectId=${projectId}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(1);
    });

    it('should filter expenses by party', async () => {
      const otherParty = await testData.createParty(ctx.organization.id, 'LABOUR');

      await testData.createExpense(
        ctx.organization.id,
        projectId,
        partyId,
        ctx.materialsCategory.id
      );
      await testData.createExpense(
        ctx.organization.id,
        projectId,
        otherParty.id,
        ctx.labourCategory.id
      );

      const response = await app.inject({
        method: 'GET',
        url: `/api/expenses?partyId=${partyId}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(1);
    });
  });

  describe('GET /api/expenses/:id', () => {
    it('should get expense by id', async () => {
      const expense = await testData.createExpense(
        ctx.organization.id,
        projectId,
        partyId,
        ctx.materialsCategory.id
      );

      const response = await app.inject({
        method: 'GET',
        url: `/api/expenses/${expense.id}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.id).toBe(expense.id);
    });

    it('should return 404 for non-existent expense', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/expenses/non-existent-id',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/expenses/:id', () => {
    it('should update expense', async () => {
      const expense = await testData.createExpense(
        ctx.organization.id,
        projectId,
        partyId,
        ctx.materialsCategory.id,
        { amount: 10000 }
      );

      const response = await app.inject({
        method: 'PUT',
        url: `/api/expenses/${expense.id}`,
        headers: authHeaders(ctx.organization.id),
        payload: {
          amount: 15000,
          notes: 'Updated notes',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(parseFloat(body.data.amount)).toBe(15000);
      expect(body.data.notes).toBe('Updated notes');
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    it('should delete expense', async () => {
      const expense = await testData.createExpense(
        ctx.organization.id,
        projectId,
        partyId,
        ctx.materialsCategory.id
      );

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/expenses/${expense.id}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(204);

      const deleted = await prisma.expense.findUnique({ where: { id: expense.id } });
      expect(deleted).toBeNull();
    });
  });

  describe('GET /api/expenses/summary/by-category', () => {
    it('should get expenses summary by category', async () => {
      await testData.createExpense(
        ctx.organization.id,
        projectId,
        partyId,
        ctx.materialsCategory.id,
        { amount: 10000 }
      );
      await testData.createExpense(
        ctx.organization.id,
        projectId,
        partyId,
        ctx.materialsCategory.id,
        { amount: 15000 }
      );
      await testData.createExpense(ctx.organization.id, projectId, partyId, ctx.labourCategory.id, {
        amount: 20000,
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/expenses/summary/by-category',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data).toHaveLength(2);

      const materialsSum = body.data.find(
        (c: { categoryName: string }) => c.categoryName === 'Materials'
      );
      expect(materialsSum?.total).toBe(25000);

      const labourSum = body.data.find(
        (c: { categoryName: string }) => c.categoryName === 'Labour'
      );
      expect(labourSum?.total).toBe(20000);
    });
  });
});
