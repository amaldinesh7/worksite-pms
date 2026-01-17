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

describe('Projects API', () => {
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
    // Clean up projects before each test
    await prisma.project.deleteMany({ where: { organizationId: ctx.organization.id } });
  });

  describe('POST /api/projects', () => {
    it('should create project successfully', async () => {
      const projectData = {
        name: faker.company.name() + ' Project',
        location: faker.location.city(),
        startDate: new Date().toISOString(),
        projectTypeItemId: ctx.residentialType.id,
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/projects',
        headers: authHeaders(ctx.organization.id),
        payload: projectData,
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toBe(projectData.name);
      expect(body.data.organizationId).toBe(ctx.organization.id);
    });

    it('should create project with clientId and amount', async () => {
      // Create a client party first
      const client = await testData.createParty(ctx.organization.id, 'CLIENT', {
        name: 'Test Client',
      });

      const projectData = {
        name: faker.company.name() + ' Project',
        clientId: client.id,
        location: faker.location.city(),
        startDate: new Date().toISOString(),
        amount: 5000000,
        projectTypeItemId: ctx.residentialType.id,
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/projects',
        headers: authHeaders(ctx.organization.id),
        payload: projectData,
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.clientId).toBe(client.id);
      expect(body.data.client.name).toBe('Test Client');
      expect(Number(body.data.amount)).toBe(5000000);
    });

    it('should reject invalid project data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/projects',
        headers: authHeaders(ctx.organization.id),
        payload: {
          name: '', // Invalid: empty name
        },
      });

      expect(response.statusCode).toBe(400);
      // Validation errors can come in different formats
      const body = response.json();
      expect(body.statusCode || body.error?.code).toBeTruthy();
    });

    it('should reject project without organization context', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/projects',
        payload: {
          name: 'Test Project',
          location: 'Location',
          startDate: new Date().toISOString(),
          projectTypeItemId: ctx.residentialType.id,
        },
      });

      // Missing org context returns 403 (Forbidden)
      expect(response.statusCode).toBe(403);
      const body = response.json();
      expect(body.error.code).toBe('MISSING_ORG_CONTEXT');
    });

    it('should reject project with invalid project type', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/projects',
        headers: authHeaders(ctx.organization.id),
        payload: {
          name: 'Test Project',
          location: 'Location',
          startDate: new Date().toISOString(),
          projectTypeItemId: 'invalid-id',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/projects', () => {
    it('should list projects with pagination', async () => {
      // Create 3 projects
      await Promise.all([
        testData.createProject(ctx.organization.id, ctx.residentialType.id, { name: 'Project 1' }),
        testData.createProject(ctx.organization.id, ctx.residentialType.id, { name: 'Project 2' }),
        testData.createProject(ctx.organization.id, ctx.residentialType.id, { name: 'Project 3' }),
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/projects?page=1&limit=2',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.items).toHaveLength(2);
      expect(body.data.pagination.total).toBe(3);
      expect(body.data.pagination.pages).toBe(2);
    });

    it('should filter projects by search', async () => {
      await testData.createProject(ctx.organization.id, ctx.residentialType.id, {
        name: 'Unique Project Name',
      });
      await testData.createProject(ctx.organization.id, ctx.residentialType.id, {
        name: 'Other Project',
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/projects?search=Unique',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0].name).toContain('Unique');
    });

    it('should not return projects from other organizations', async () => {
      // Create project in different org
      const otherOrg = await testData.createOrganization('Other Org');
      const otherCategoryType = await testData.createCategoryType(
        otherOrg.id,
        'project_type',
        'Project Type'
      );
      const otherCategoryItem = await testData.createCategoryItem(
        otherOrg.id,
        otherCategoryType.id,
        'Commercial'
      );

      await testData.createProject(otherOrg.id, otherCategoryItem.id, {
        name: 'Other Org Project',
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/projects',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).not.toContainEqual(
        expect.objectContaining({ name: 'Other Org Project' })
      );

      // Cleanup
      await cleanup.organization(otherOrg.id);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should get project by id', async () => {
      const project = await testData.createProject(ctx.organization.id, ctx.residentialType.id, {
        name: 'Test Project',
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/projects/${project.id}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(project.id);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/projects/non-existent-id',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update project', async () => {
      const project = await testData.createProject(ctx.organization.id, ctx.residentialType.id, {
        name: 'Original Name',
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/projects/${project.id}`,
        headers: authHeaders(ctx.organization.id),
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.name).toBe('Updated Name');
    });

    it('should return 404 when updating non-existent project', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/projects/non-existent-id',
        headers: authHeaders(ctx.organization.id),
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete project', async () => {
      const project = await testData.createProject(ctx.organization.id, ctx.residentialType.id, {
        name: 'To Delete',
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/projects/${project.id}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(204);

      // Verify deletion
      const deleted = await prisma.project.findUnique({
        where: { id: project.id },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 when deleting non-existent project', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/projects/non-existent-id',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/projects/:id/stats', () => {
    it('should calculate project statistics', async () => {
      const project = await testData.createProject(ctx.organization.id, ctx.residentialType.id, {
        name: 'Stats Project',
      });

      // Create party
      const party = await testData.createParty(ctx.organization.id, 'VENDOR');
      const client = await testData.createParty(ctx.organization.id, 'CLIENT');

      // Create expenses (rate * quantity = 100 * 100 = 10000)
      await testData.createExpense(
        ctx.organization.id,
        project.id,
        party.id,
        ctx.materialsCategory.id,
        { rate: 100, quantity: 100 }
      );

      // Create payment OUT (to vendor)
      await testData.createPayment(ctx.organization.id, project.id, {
        partyId: party.id,
        type: 'OUT',
        paymentMode: 'CASH',
        amount: 7000,
      });

      // Create payment IN (from client)
      await testData.createPayment(ctx.organization.id, project.id, {
        partyId: client.id,
        type: 'IN',
        paymentMode: 'ONLINE',
        amount: 15000,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/projects/${project.id}/stats`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.totalExpenses).toBe(10000);
      expect(body.data.totalPayments).toBe(22000); // 7000 + 15000
      expect(body.data.totalPaymentsIn).toBe(15000);
      expect(body.data.totalPaymentsOut).toBe(7000);
      expect(body.data.balance).toBe(5000); // 15000 (IN) - 10000 (expenses)
    });
  });
});
