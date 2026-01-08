import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  createTestApp,
  testData,
  cleanup,
  authHeaders,
  setupTestContext,
} from '../../tests/helper';
import { prisma } from '../../lib/prisma';
import { faker } from '@faker-js/faker';
import type { FastifyInstance } from 'fastify';

describe('Parties API', () => {
  let app: FastifyInstance;
  let ctx: Awaited<ReturnType<typeof setupTestContext>>;

  beforeAll(async () => {
    app = await createTestApp();
    ctx = await setupTestContext();
  });

  afterAll(async () => {
    await cleanup.organization(ctx.organization.id);
    await app.close();
  });

  beforeEach(async () => {
    await prisma.party.deleteMany({ where: { organizationId: ctx.organization.id } });
  });

  describe('POST /api/parties', () => {
    it('should create party successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/parties',
        headers: authHeaders(ctx.organization.id),
        payload: {
          name: faker.company.name(),
          phone: faker.phone.number(),
          type: 'VENDOR',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.type).toBe('VENDOR');
    });

    it('should reject invalid party type', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/parties',
        headers: authHeaders(ctx.organization.id),
        payload: {
          name: 'Test Party',
          type: 'INVALID_TYPE',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should create party without phone', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/parties',
        headers: authHeaders(ctx.organization.id),
        payload: {
          name: 'No Phone Party',
          type: 'LABOUR',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.data.phone).toBeNull();
    });
  });

  describe('GET /api/parties', () => {
    it('should list parties with pagination', async () => {
      await Promise.all([
        testData.createParty(ctx.organization.id, 'VENDOR'),
        testData.createParty(ctx.organization.id, 'LABOUR'),
        testData.createParty(ctx.organization.id, 'SUBCONTRACTOR'),
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/parties?page=1&limit=2',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(2);
      expect(body.data.pagination.total).toBe(3);
    });

    it('should filter parties by type', async () => {
      await testData.createParty(ctx.organization.id, 'VENDOR', { name: 'Vendor Party' });
      await testData.createParty(ctx.organization.id, 'LABOUR', { name: 'Labour Party' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/parties?type=VENDOR',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0].type).toBe('VENDOR');
    });

    it('should filter parties by search', async () => {
      await testData.createParty(ctx.organization.id, 'VENDOR', { name: 'Unique Vendor Name' });
      await testData.createParty(ctx.organization.id, 'VENDOR', { name: 'Other Vendor' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/parties?search=Unique',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0].name).toContain('Unique');
    });
  });

  describe('GET /api/parties/:id', () => {
    it('should get party by id', async () => {
      const party = await testData.createParty(ctx.organization.id, 'VENDOR');

      const response = await app.inject({
        method: 'GET',
        url: `/api/parties/${party.id}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.id).toBe(party.id);
    });

    it('should return 404 for non-existent party', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/parties/non-existent-id',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/parties/:id', () => {
    it('should update party', async () => {
      const party = await testData.createParty(ctx.organization.id, 'VENDOR', {
        name: 'Original Name',
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/parties/${party.id}`,
        headers: authHeaders(ctx.organization.id),
        payload: {
          name: 'Updated Name',
          type: 'SUBCONTRACTOR',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.name).toBe('Updated Name');
      expect(body.data.type).toBe('SUBCONTRACTOR');
    });
  });

  describe('DELETE /api/parties/:id', () => {
    it('should delete party', async () => {
      const party = await testData.createParty(ctx.organization.id, 'VENDOR');

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/parties/${party.id}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(204);

      const deleted = await prisma.party.findUnique({ where: { id: party.id } });
      expect(deleted).toBeNull();
    });
  });

  describe('GET /api/parties/:id/stats', () => {
    it('should calculate party statistics', async () => {
      const party = await testData.createParty(ctx.organization.id, 'VENDOR');
      const project = await testData.createProject(ctx.organization.id, ctx.residentialType.id);

      // Create expenses
      await testData.createExpense(
        ctx.organization.id,
        project.id,
        party.id,
        ctx.materialsCategory.id,
        { amount: 50000 }
      );

      // Create payment
      await testData.createPayment(ctx.organization.id, project.id, {
        partyId: party.id,
        amount: 30000,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/parties/${party.id}/stats`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.totalExpenses).toBe(50000);
      expect(body.data.totalPayments).toBe(30000);
      expect(body.data.balance).toBe(20000);
    });
  });
});
