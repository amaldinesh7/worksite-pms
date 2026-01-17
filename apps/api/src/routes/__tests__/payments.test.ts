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

describe('Payments API', () => {
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

  describe('POST /api/payments', () => {
    it('should create payment successfully with type and paymentMode', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/payments',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          partyId,
          type: 'OUT',
          paymentMode: 'CASH',
          amount: 25000,
          paymentDate: new Date().toISOString(),
          notes: 'First payment',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(parseFloat(body.data.amount)).toBe(25000);
      expect(body.data.type).toBe('OUT');
      expect(body.data.paymentMode).toBe('CASH');
    });

    it('should create IN payment (money received)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/payments',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          partyId,
          type: 'IN',
          paymentMode: 'ONLINE',
          amount: 50000,
          paymentDate: new Date().toISOString(),
          notes: 'Client advance payment',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.data.type).toBe('IN');
      expect(body.data.paymentMode).toBe('ONLINE');
    });

    it('should create payment linked to expense', async () => {
      const expense = await testData.createExpense(
        ctx.organization.id,
        projectId,
        partyId,
        ctx.materialsCategory.id
      );

      const response = await app.inject({
        method: 'POST',
        url: '/api/payments',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          partyId,
          expenseId: expense.id,
          type: 'OUT',
          paymentMode: 'CHEQUE',
          amount: 10000,
          paymentDate: new Date().toISOString(),
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.data.expenseId).toBe(expense.id);
      expect(body.data.expense).toBeDefined();
    });

    it('should create payment without party', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/payments',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          type: 'OUT',
          paymentMode: 'CASH',
          amount: 10000,
          paymentDate: new Date().toISOString(),
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.data.partyId).toBeNull();
    });

    it('should reject payment without type', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/payments',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          paymentMode: 'CASH',
          amount: 10000,
          paymentDate: new Date().toISOString(),
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject payment without paymentMode', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/payments',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          type: 'OUT',
          amount: 10000,
          paymentDate: new Date().toISOString(),
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject negative amount', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/payments',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          type: 'OUT',
          paymentMode: 'CASH',
          amount: -5000,
          paymentDate: new Date().toISOString(),
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject payment without project', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/payments',
        headers: authHeaders(ctx.organization.id),
        payload: {
          type: 'OUT',
          paymentMode: 'CASH',
          amount: 10000,
          paymentDate: new Date().toISOString(),
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/payments', () => {
    it('should list payments with pagination', async () => {
      await Promise.all([
        testData.createPayment(ctx.organization.id, projectId, { partyId }),
        testData.createPayment(ctx.organization.id, projectId, { partyId }),
        testData.createPayment(ctx.organization.id, projectId, { partyId }),
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/payments?page=1&limit=2',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(2);
      expect(body.data.pagination.total).toBe(3);
    });

    it('should filter payments by type', async () => {
      await testData.createPayment(ctx.organization.id, projectId, { type: 'IN' });
      await testData.createPayment(ctx.organization.id, projectId, { type: 'OUT' });
      await testData.createPayment(ctx.organization.id, projectId, { type: 'OUT' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/payments?type=IN',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0].type).toBe('IN');
    });

    it('should filter payments by project', async () => {
      const otherProject = await testData.createProject(
        ctx.organization.id,
        ctx.residentialType.id
      );

      await testData.createPayment(ctx.organization.id, projectId);
      await testData.createPayment(ctx.organization.id, otherProject.id);

      const response = await app.inject({
        method: 'GET',
        url: `/api/payments?projectId=${projectId}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(1);
    });

    it('should filter payments by party', async () => {
      const otherParty = await testData.createParty(ctx.organization.id, 'LABOUR');

      await testData.createPayment(ctx.organization.id, projectId, { partyId });
      await testData.createPayment(ctx.organization.id, projectId, { partyId: otherParty.id });

      const response = await app.inject({
        method: 'GET',
        url: `/api/payments?partyId=${partyId}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(1);
    });

    it('should filter payments by expenseId', async () => {
      const expense = await testData.createExpense(
        ctx.organization.id,
        projectId,
        partyId,
        ctx.materialsCategory.id
      );

      await testData.createPayment(ctx.organization.id, projectId, { expenseId: expense.id });
      await testData.createPayment(ctx.organization.id, projectId);

      const response = await app.inject({
        method: 'GET',
        url: `/api/payments?expenseId=${expense.id}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0].expenseId).toBe(expense.id);
    });
  });

  describe('GET /api/payments/:id', () => {
    it('should get payment by id with expense relation', async () => {
      const expense = await testData.createExpense(
        ctx.organization.id,
        projectId,
        partyId,
        ctx.materialsCategory.id
      );
      const payment = await testData.createPayment(ctx.organization.id, projectId, {
        partyId,
        expenseId: expense.id,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/payments/${payment.id}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.id).toBe(payment.id);
      expect(body.data.expense).toBeDefined();
      expect(body.data.expense.id).toBe(expense.id);
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/payments/non-existent-id',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/payments/:id', () => {
    it('should update payment amount and notes', async () => {
      const payment = await testData.createPayment(ctx.organization.id, projectId, {
        amount: 10000,
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/payments/${payment.id}`,
        headers: authHeaders(ctx.organization.id),
        payload: {
          amount: 15000,
          notes: 'Updated payment',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(parseFloat(body.data.amount)).toBe(15000);
      expect(body.data.notes).toBe('Updated payment');
    });

    it('should update payment type and mode', async () => {
      const payment = await testData.createPayment(ctx.organization.id, projectId, {
        type: 'OUT',
        paymentMode: 'CASH',
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/payments/${payment.id}`,
        headers: authHeaders(ctx.organization.id),
        payload: {
          type: 'IN',
          paymentMode: 'ONLINE',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.type).toBe('IN');
      expect(body.data.paymentMode).toBe('ONLINE');
    });
  });

  describe('DELETE /api/payments/:id', () => {
    it('should delete payment', async () => {
      const payment = await testData.createPayment(ctx.organization.id, projectId);

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/payments/${payment.id}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(204);

      const deleted = await prisma.payment.findUnique({ where: { id: payment.id } });
      expect(deleted).toBeNull();
    });
  });

  describe('GET /api/payments/summary', () => {
    it('should get payments summary with IN and OUT totals', async () => {
      await testData.createPayment(ctx.organization.id, projectId, { type: 'OUT', amount: 10000 });
      await testData.createPayment(ctx.organization.id, projectId, { type: 'OUT', amount: 15000 });
      await testData.createPayment(ctx.organization.id, projectId, { type: 'IN', amount: 50000 });

      const response = await app.inject({
        method: 'GET',
        url: '/api/payments/summary',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.total).toBe(75000);
      expect(body.data.count).toBe(3);
      expect(body.data.totalIn).toBe(50000);
      expect(body.data.totalOut).toBe(25000);
    });

    it('should get payments summary filtered by type', async () => {
      await testData.createPayment(ctx.organization.id, projectId, { type: 'OUT', amount: 10000 });
      await testData.createPayment(ctx.organization.id, projectId, { type: 'IN', amount: 50000 });

      const response = await app.inject({
        method: 'GET',
        url: '/api/payments/summary?type=OUT',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.total).toBe(10000);
      expect(body.data.count).toBe(1);
    });

    it('should get payments summary filtered by project', async () => {
      const otherProject = await testData.createProject(
        ctx.organization.id,
        ctx.residentialType.id
      );

      await testData.createPayment(ctx.organization.id, projectId, { amount: 10000 });
      await testData.createPayment(ctx.organization.id, otherProject.id, { amount: 20000 });

      const response = await app.inject({
        method: 'GET',
        url: `/api/payments/summary?projectId=${projectId}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.total).toBe(10000);
      expect(body.data.count).toBe(1);
    });
  });
});
