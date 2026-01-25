import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildApp } from '../../app';
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';

describe('Users API', () => {
  let app: FastifyInstance;
  let testUserId: string;
  let testCounter = 0;

  const getUniquePhone = () => `+1${Date.now()}${++testCounter}`;

  /**
   * Helper to create or get a role ID for an organization
   */
  const getOrCreateRoleId = async (organizationId: string, roleName: string): Promise<string> => {
    let role = await prisma.role.findUnique({
      where: {
        organizationId_name: { organizationId, name: roleName },
      },
    });

    if (!role) {
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
  };

  // Helper to clean up test data
  const cleanupTestData = async () => {
    await prisma.organizationMember.deleteMany();
    await prisma.role.deleteMany();
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
  // User CRUD
  // ============================================

  describe('POST /api/users', () => {
    beforeEach(async () => {
      await cleanupTestData();
    });

    it('should create a new user', async () => {
      const phone = getUniquePhone();
      const res = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: { name: 'John Doe', phone },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('John Doe');
      expect(body.data.phone).toBe(phone);
      expect(body.data.id).toBeDefined();

      testUserId = body.data.id;
    });

    it('should reject empty name', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: { name: '', phone: getUniquePhone() },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should reject invalid phone format', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: { name: 'Test', phone: 'invalid-phone' },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should reject duplicate phone number', async () => {
      const duplicatePhone = getUniquePhone();
      // First create
      await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: { name: 'User 1', phone: duplicatePhone },
      });

      // Second create with same phone should fail
      const res = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: { name: 'User 2', phone: duplicatePhone },
      });

      expect(res.statusCode).toBe(409);
    });
  });

  describe('GET /api/users', () => {
    let alicePhone: string;
    let bobPhone: string;
    let charliePhone: string;

    beforeEach(async () => {
      await cleanupTestData();
      alicePhone = getUniquePhone();
      bobPhone = getUniquePhone();
      charliePhone = getUniquePhone();
      // Create test users
      await prisma.user.createMany({
        data: [
          { name: 'Alice', phone: alicePhone },
          { name: 'Bob', phone: bobPhone },
          { name: 'Charlie', phone: charliePhone },
        ],
      });
    });

    it('should list users with pagination', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/users?page=1&limit=10',
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
      expect(body.data.items).toHaveLength(3);
      expect(body.data.pagination.total).toBe(3);
    });

    it('should search users by name', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/users?search=Alice',
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0].name).toBe('Alice');
    });

    it('should search users by phone', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/users?search=${bobPhone.slice(-4)}`,
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0].name).toBe('Bob');
    });
  });

  describe('GET /api/users/:id', () => {
    beforeEach(async () => {
      await cleanupTestData();
      const user = await prisma.user.create({
        data: { name: 'Test User', phone: getUniquePhone() },
      });
      testUserId = user.id;
    });

    it('should get user by ID', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/users/${testUserId}`,
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(testUserId);
      expect(body.data.name).toBe('Test User');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/users/non-existent-id',
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/users/by-phone', () => {
    let testPhone: string;

    beforeEach(async () => {
      await cleanupTestData();
      testPhone = getUniquePhone();
      await prisma.user.create({
        data: { name: 'Test User', phone: testPhone },
      });
    });

    it('should get user by phone number', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/users/by-phone?phone=${encodeURIComponent(testPhone)}`,
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.name).toBe('Test User');
      expect(body.data.phone).toBe(testPhone);
    });

    it('should return 404 for non-existent phone', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/users/by-phone?phone=+9999999999',
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    beforeEach(async () => {
      await cleanupTestData();
      const user = await prisma.user.create({
        data: { name: 'Original Name', phone: getUniquePhone() },
      });
      testUserId = user.id;
    });

    it('should update user', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: `/api/users/${testUserId}`,
        payload: { name: 'Updated Name' },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.name).toBe('Updated Name');
    });

    it('should update phone number', async () => {
      const newPhone = getUniquePhone();
      const res = await app.inject({
        method: 'PUT',
        url: `/api/users/${testUserId}`,
        payload: { phone: newPhone },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.phone).toBe(newPhone);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/api/users/non-existent-id',
        payload: { name: 'Updated' },
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/users/:id', () => {
    beforeEach(async () => {
      await cleanupTestData();
      const user = await prisma.user.create({
        data: { name: 'To Delete', phone: getUniquePhone() },
      });
      testUserId = user.id;
    });

    it('should delete user', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/users/${testUserId}`,
      });

      expect(res.statusCode).toBe(204);

      // Verify deletion
      const user = await prisma.user.findUnique({
        where: { id: testUserId },
      });
      expect(user).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/users/non-existent-id',
      });

      expect(res.statusCode).toBe(404);
    });
  });

  // ============================================
  // User Organizations
  // ============================================

  describe('GET /api/users/:id/organizations', () => {
    let testOrgId: string;

    beforeEach(async () => {
      await cleanupTestData();
      const user = await prisma.user.create({
        data: { name: 'Test User', phone: getUniquePhone() },
      });
      testUserId = user.id;

      const org = await prisma.organization.create({
        data: { name: 'Test Org' },
      });
      testOrgId = org.id;

      // Create role and member
      const roleId = await getOrCreateRoleId(testOrgId, 'ADMIN');
      await prisma.organizationMember.create({
        data: {
          organizationId: testOrgId,
          userId: testUserId,
          roleId,
        },
      });
    });

    it('should get user organizations', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/users/${testUserId}/organizations`,
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].organizationId).toBe(testOrgId);
      // Role is now a relation, check for role.name
      expect(body.data[0].role?.name || body.data[0].roleId).toBeTruthy();
    });

    it('should return 404 for non-existent user', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/users/non-existent-id/organizations',
      });

      expect(res.statusCode).toBe(404);
    });
  });
});
