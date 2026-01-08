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

describe('Stages API', () => {
  let app: FastifyInstance;
  let ctx: Awaited<ReturnType<typeof setupTestContext>>;
  let projectId: string;

  beforeAll(async () => {
    app = await createTestApp();
    ctx = await setupTestContext();
    const project = await testData.createProject(ctx.organization.id, ctx.residentialType.id);
    projectId = project.id;
  });

  afterAll(async () => {
    await cleanup.organization(ctx.organization.id);
    await app.close();
  });

  beforeEach(async () => {
    await prisma.stage.deleteMany({ where: { organizationId: ctx.organization.id } });
  });

  describe('POST /api/stages', () => {
    it('should create stage successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/stages',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          name: 'Foundation',
          budgetAmount: 100000,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Foundation');
      expect(parseFloat(body.data.budgetAmount)).toBe(100000);
    });

    it('should reject duplicate stage name in same project', async () => {
      await testData.createStage(ctx.organization.id, projectId, {
        name: 'Duplicate Stage',
        budgetAmount: 50000,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/stages',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          name: 'Duplicate Stage',
          budgetAmount: 60000,
        },
      });

      expect(response.statusCode).toBe(409);
    });

    it('should reject stage with invalid project', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/stages',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId: 'invalid-project-id',
          name: 'Test Stage',
          budgetAmount: 50000,
        },
      });

      // 404 for non-existent project (repository checks project existence first)
      expect(response.statusCode).toBe(404);
    });

    it('should reject negative budget amount', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/stages',
        headers: authHeaders(ctx.organization.id),
        payload: {
          projectId,
          name: 'Negative Budget',
          budgetAmount: -1000,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/stages', () => {
    it('should list stages with pagination', async () => {
      await Promise.all([
        testData.createStage(ctx.organization.id, projectId, { name: 'Stage 1' }),
        testData.createStage(ctx.organization.id, projectId, { name: 'Stage 2' }),
        testData.createStage(ctx.organization.id, projectId, { name: 'Stage 3' }),
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/stages?page=1&limit=2',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(2);
      expect(body.data.pagination.total).toBe(3);
    });

    it('should filter stages by project', async () => {
      const otherProject = await testData.createProject(
        ctx.organization.id,
        ctx.residentialType.id
      );

      await testData.createStage(ctx.organization.id, projectId, { name: 'Project 1 Stage' });
      await testData.createStage(ctx.organization.id, otherProject.id, { name: 'Project 2 Stage' });

      const response = await app.inject({
        method: 'GET',
        url: `/api/stages?projectId=${projectId}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0].name).toBe('Project 1 Stage');
    });
  });

  describe('GET /api/stages/project/:projectId', () => {
    it('should get stages by project', async () => {
      await testData.createStage(ctx.organization.id, projectId, { name: 'Foundation' });
      await testData.createStage(ctx.organization.id, projectId, { name: 'Framing' });

      const response = await app.inject({
        method: 'GET',
        url: `/api/stages/project/${projectId}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data).toHaveLength(2);
    });
  });

  describe('GET /api/stages/:id', () => {
    it('should get stage by id', async () => {
      const stage = await testData.createStage(ctx.organization.id, projectId, {
        name: 'Test Stage',
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/stages/${stage.id}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.id).toBe(stage.id);
    });

    it('should return 404 for non-existent stage', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/stages/non-existent-id',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/stages/:id', () => {
    it('should update stage', async () => {
      const stage = await testData.createStage(ctx.organization.id, projectId, {
        name: 'Original',
        budgetAmount: 50000,
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/stages/${stage.id}`,
        headers: authHeaders(ctx.organization.id),
        payload: {
          name: 'Updated',
          budgetAmount: 75000,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.name).toBe('Updated');
      expect(parseFloat(body.data.budgetAmount)).toBe(75000);
    });
  });

  describe('DELETE /api/stages/:id', () => {
    it('should delete stage', async () => {
      const stage = await testData.createStage(ctx.organization.id, projectId, {
        name: 'To Delete',
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/stages/${stage.id}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(204);

      const deleted = await prisma.stage.findUnique({ where: { id: stage.id } });
      expect(deleted).toBeNull();
    });
  });

  describe('GET /api/stages/:id/stats', () => {
    it('should calculate stage statistics', async () => {
      const stage = await testData.createStage(ctx.organization.id, projectId, {
        name: 'Stats Stage',
        budgetAmount: 100000,
      });

      const party = await testData.createParty(ctx.organization.id, 'VENDOR');

      // Create expenses for this stage
      await testData.createExpense(
        ctx.organization.id,
        projectId,
        party.id,
        ctx.materialsCategory.id,
        { stageId: stage.id, amount: 25000 }
      );
      await testData.createExpense(
        ctx.organization.id,
        projectId,
        party.id,
        ctx.materialsCategory.id,
        { stageId: stage.id, amount: 15000 }
      );

      const response = await app.inject({
        method: 'GET',
        url: `/api/stages/${stage.id}/stats`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.budgetAmount).toBe(100000);
      expect(body.data.totalExpenses).toBe(40000);
      expect(body.data.remaining).toBe(60000);
      expect(body.data.percentUsed).toBe(40);
    });
  });
});
