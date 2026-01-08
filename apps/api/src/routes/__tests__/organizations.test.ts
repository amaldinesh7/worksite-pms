import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildApp } from '../../app';
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';

describe('Organizations API', () => {
  let app: FastifyInstance;
  let testOrgId: string;
  let testUserId: string;
  let testCounter = 0;

  const getUniquePhone = () => `+1${Date.now()}${++testCounter}`;

  // Helper to clean up test data
  const cleanupTestData = async () => {
    await prisma.organizationMember.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
  };

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  // ============================================
  // Organization CRUD
  // ============================================

  describe('POST /api/organizations', () => {
    beforeEach(async () => {
      await cleanupTestData();
    });

    it('should create a new organization', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/organizations',
        payload: { name: 'Test Organization' },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Test Organization');
      expect(body.data.id).toBeDefined();

      testOrgId = body.data.id;
    });

    it('should reject empty name', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/organizations',
        payload: { name: '' },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/organizations', () => {
    beforeEach(async () => {
      await cleanupTestData();
      // Create test organizations
      await prisma.organization.createMany({
        data: [{ name: 'Org Alpha' }, { name: 'Org Beta' }, { name: 'Org Gamma' }],
      });
    });

    it('should list organizations with pagination', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/organizations?page=1&limit=10',
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
      expect(body.data.items).toHaveLength(3);
      expect(body.data.pagination.total).toBe(3);
    });

    it('should search organizations by name', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/organizations?search=Alpha',
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0].name).toBe('Org Alpha');
    });
  });

  describe('GET /api/organizations/:id', () => {
    beforeEach(async () => {
      await cleanupTestData();
      const org = await prisma.organization.create({
        data: { name: 'Test Org' },
      });
      testOrgId = org.id;
    });

    it('should get organization by ID', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/organizations/${testOrgId}`,
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(testOrgId);
      expect(body.data.name).toBe('Test Org');
    });

    it('should return 404 for non-existent organization', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/organizations/non-existent-id',
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/organizations/:id', () => {
    beforeEach(async () => {
      await cleanupTestData();
      const org = await prisma.organization.create({
        data: { name: 'Original Name' },
      });
      testOrgId = org.id;
    });

    it('should update organization', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: `/api/organizations/${testOrgId}`,
        payload: { name: 'Updated Name' },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.name).toBe('Updated Name');
    });

    it('should return 404 for non-existent organization', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/api/organizations/non-existent-id',
        payload: { name: 'Updated' },
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/organizations/:id', () => {
    beforeEach(async () => {
      await cleanupTestData();
      const org = await prisma.organization.create({
        data: { name: 'To Delete' },
      });
      testOrgId = org.id;
    });

    it('should delete organization', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/organizations/${testOrgId}`,
      });

      expect(res.statusCode).toBe(204);

      // Verify deletion
      const org = await prisma.organization.findUnique({
        where: { id: testOrgId },
      });
      expect(org).toBeNull();
    });

    it('should return 404 for non-existent organization', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/organizations/non-existent-id',
      });

      expect(res.statusCode).toBe(404);
    });
  });

  // ============================================
  // Member Management
  // ============================================

  describe('POST /api/organizations/:id/members', () => {
    beforeEach(async () => {
      await cleanupTestData();
      // Create test user for member tests
      const user = await prisma.user.create({
        data: { name: 'Test User', phone: getUniquePhone() },
      });
      testUserId = user.id;

      const org = await prisma.organization.create({
        data: { name: 'Test Org' },
      });
      testOrgId = org.id;
    });

    it('should add member to organization', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/organizations/${testOrgId}/members`,
        payload: { userId: testUserId, role: 'ADMIN' },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.data.userId).toBe(testUserId);
      expect(body.data.role).toBe('ADMIN');
    });

    it('should reject duplicate membership', async () => {
      // First add
      await app.inject({
        method: 'POST',
        url: `/api/organizations/${testOrgId}/members`,
        payload: { userId: testUserId, role: 'ADMIN' },
      });

      // Second add should fail
      const res = await app.inject({
        method: 'POST',
        url: `/api/organizations/${testOrgId}/members`,
        payload: { userId: testUserId, role: 'MANAGER' },
      });

      expect(res.statusCode).toBe(409);
    });
  });

  describe('GET /api/organizations/:id/members', () => {
    beforeEach(async () => {
      await cleanupTestData();
      // Create test user for member tests
      const user = await prisma.user.create({
        data: { name: 'Test User', phone: getUniquePhone() },
      });
      testUserId = user.id;

      const org = await prisma.organization.create({
        data: { name: 'Test Org' },
      });
      testOrgId = org.id;

      await prisma.organizationMember.create({
        data: {
          organizationId: testOrgId,
          userId: testUserId,
          role: 'ADMIN',
        },
      });
    });

    it('should list organization members', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/organizations/${testOrgId}/members`,
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].userId).toBe(testUserId);
    });
  });

  describe('PUT /api/organizations/:id/members/:userId', () => {
    beforeEach(async () => {
      await cleanupTestData();
      // Create test user for member tests
      const user = await prisma.user.create({
        data: { name: 'Test User', phone: getUniquePhone() },
      });
      testUserId = user.id;

      const org = await prisma.organization.create({
        data: { name: 'Test Org' },
      });
      testOrgId = org.id;

      await prisma.organizationMember.create({
        data: {
          organizationId: testOrgId,
          userId: testUserId,
          role: 'ADMIN',
        },
      });
    });

    it('should update member role', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: `/api/organizations/${testOrgId}/members/${testUserId}`,
        payload: { role: 'ACCOUNTANT' },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.role).toBe('ACCOUNTANT');
    });
  });

  describe('DELETE /api/organizations/:id/members/:userId', () => {
    beforeEach(async () => {
      await cleanupTestData();
      // Create test user for member tests
      const user = await prisma.user.create({
        data: { name: 'Test User', phone: getUniquePhone() },
      });
      testUserId = user.id;

      const org = await prisma.organization.create({
        data: { name: 'Test Org' },
      });
      testOrgId = org.id;

      await prisma.organizationMember.create({
        data: {
          organizationId: testOrgId,
          userId: testUserId,
          role: 'ADMIN',
        },
      });
    });

    it('should remove member from organization', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/organizations/${testOrgId}/members/${testUserId}`,
      });

      expect(res.statusCode).toBe(204);

      // Verify removal
      const member = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: testOrgId,
            userId: testUserId,
          },
        },
      });
      expect(member).toBeNull();
    });
  });
});
