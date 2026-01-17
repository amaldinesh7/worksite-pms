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
    await prisma.payment.deleteMany({ where: { organizationId: ctx.organization.id } });
    await prisma.expense.deleteMany({ where: { organizationId: ctx.organization.id } });
  });

  describe('POST /api/expenses', () => {
    it('should create expense successfully with rate and quantity', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/expenses',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          partyId,
          expenseCategoryItemId: ctx.materialsCategory.id,
          rate: 500,
          quantity: 100,
          expenseDate: new Date().toISOString(),
          notes: 'Test expense',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(parseFloat(body.data.rate)).toBe(500);
      expect(parseFloat(body.data.quantity)).toBe(100);
    });

    it('should create expense with linked payment when paidAmount is provided', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/expenses',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          partyId,
          expenseCategoryItemId: ctx.materialsCategory.id,
          rate: 500,
          quantity: 100,
          expenseDate: new Date().toISOString(),
          paidAmount: 25000,
          paymentMode: 'CASH',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.payments).toHaveLength(1);
      expect(parseFloat(body.data.payments[0].amount)).toBe(25000);
      expect(body.data.payments[0].paymentMode).toBe('CASH');
      expect(body.data.payments[0].type).toBe('OUT');
    });

    it('should reject expense without required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/expenses',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          // Missing partyId, expenseCategoryItemId, rate, quantity, etc.
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject negative rate', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/expenses',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          partyId,
          expenseCategoryItemId: ctx.materialsCategory.id,
          rate: -100,
          quantity: 10,
          expenseDate: new Date().toISOString(),
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject negative quantity', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/expenses',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          partyId,
          expenseCategoryItemId: ctx.materialsCategory.id,
          rate: 100,
          quantity: -10,
          expenseDate: new Date().toISOString(),
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
          rate: 250,
          quantity: 100,
          expenseDate: new Date().toISOString(),
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
    it('should get expense by id with payments', async () => {
      const expense = await testData.createExpense(
        ctx.organization.id,
        projectId,
        partyId,
        ctx.materialsCategory.id
      );

      // Create a linked payment
      await testData.createPayment(ctx.organization.id, projectId, {
        partyId,
        expenseId: expense.id,
        type: 'OUT',
        paymentMode: 'CASH',
        amount: 5000,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/expenses/${expense.id}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.id).toBe(expense.id);
      expect(body.data.payments).toHaveLength(1);
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
    it('should update expense rate and quantity', async () => {
      const expense = await testData.createExpense(
        ctx.organization.id,
        projectId,
        partyId,
        ctx.materialsCategory.id,
        { rate: 100, quantity: 10 }
      );

      const response = await app.inject({
        method: 'PUT',
        url: `/api/expenses/${expense.id}`,
        headers: authHeaders(ctx.organization.id),
        payload: {
          rate: 150,
          quantity: 20,
          notes: 'Updated notes',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(parseFloat(body.data.rate)).toBe(150);
      expect(parseFloat(body.data.quantity)).toBe(20);
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
    it('should get expenses summary by category (rate * quantity)', async () => {
      // Create expenses with known rate and quantity
      await testData.createExpense(
        ctx.organization.id,
        projectId,
        partyId,
        ctx.materialsCategory.id,
        { rate: 100, quantity: 100 } // Total: 10000
      );
      await testData.createExpense(
        ctx.organization.id,
        projectId,
        partyId,
        ctx.materialsCategory.id,
        { rate: 150, quantity: 100 } // Total: 15000
      );
      await testData.createExpense(ctx.organization.id, projectId, partyId, ctx.labourCategory.id, {
        rate: 200,
        quantity: 100, // Total: 20000
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
