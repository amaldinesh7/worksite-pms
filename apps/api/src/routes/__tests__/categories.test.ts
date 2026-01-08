import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createTestApp, testData, cleanup, authHeaders } from '../../tests/helper';
import { prisma } from '../../lib/prisma';
import type { FastifyInstance } from 'fastify';

describe('Categories API', () => {
  let app: FastifyInstance;
  let organizationId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const org = await testData.createOrganization('Categories Test Org');
    organizationId = org.id;
  });

  afterAll(async () => {
    await cleanup.organization(organizationId);
    await app.close();
  });

  beforeEach(async () => {
    // Clean up categories before each test
    await prisma.categoryItem.deleteMany({ where: { organizationId } });
    await prisma.categoryType.deleteMany({ where: { organizationId } });
  });

  describe('Category Types', () => {
    describe('POST /api/categories/types', () => {
      it('should create category type successfully', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/categories/types',
          headers: authHeaders(organizationId),
          payload: {
            key: 'test_type',
            label: 'Test Type',
          },
        });

        expect(response.statusCode).toBe(201);
        const body = response.json();
        expect(body.success).toBe(true);
        expect(body.data.key).toBe('test_type');
        expect(body.data.label).toBe('Test Type');
      });

      it('should reject duplicate category type key', async () => {
        await testData.createCategoryType(organizationId, 'duplicate_key', 'First');

        const response = await app.inject({
          method: 'POST',
          url: '/api/categories/types',
          headers: authHeaders(organizationId),
          payload: {
            key: 'duplicate_key',
            label: 'Second',
          },
        });

        expect(response.statusCode).toBe(409);
      });

      it('should reject invalid category type data', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/categories/types',
          headers: authHeaders(organizationId),
          payload: {
            key: '', // Invalid: empty key
            label: 'Test',
          },
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('GET /api/categories/types', () => {
      it('should list all category types', async () => {
        await testData.createCategoryType(organizationId, 'type_1', 'Type 1');
        await testData.createCategoryType(organizationId, 'type_2', 'Type 2');

        const response = await app.inject({
          method: 'GET',
          url: '/api/categories/types',
          headers: authHeaders(organizationId),
        });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(2);
      });

      it('should include inactive types when requested', async () => {
        const type = await testData.createCategoryType(organizationId, 'inactive_type', 'Inactive');
        await prisma.categoryType.update({
          where: { id: type.id },
          data: { isActive: false },
        });

        // Without includeInactive
        let response = await app.inject({
          method: 'GET',
          url: '/api/categories/types',
          headers: authHeaders(organizationId),
        });
        expect(response.json().data).toHaveLength(0);

        // With includeInactive
        response = await app.inject({
          method: 'GET',
          url: '/api/categories/types?includeInactive=true',
          headers: authHeaders(organizationId),
        });
        expect(response.json().data).toHaveLength(1);
      });
    });

    describe('GET /api/categories/types/:id', () => {
      it('should get category type by id', async () => {
        const categoryType = await testData.createCategoryType(
          organizationId,
          'test_key',
          'Test Label'
        );

        const response = await app.inject({
          method: 'GET',
          url: `/api/categories/types/${categoryType.id}`,
          headers: authHeaders(organizationId),
        });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body.data.id).toBe(categoryType.id);
      });

      it('should return 404 for non-existent category type', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/categories/types/non-existent-id',
          headers: authHeaders(organizationId),
        });

        expect(response.statusCode).toBe(404);
      });
    });

    describe('GET /api/categories/types/key/:key', () => {
      it('should get category type by key', async () => {
        await testData.createCategoryType(organizationId, 'unique_key', 'Test Label');

        const response = await app.inject({
          method: 'GET',
          url: '/api/categories/types/key/unique_key',
          headers: authHeaders(organizationId),
        });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body.data.key).toBe('unique_key');
      });
    });

    describe('PUT /api/categories/types/:id', () => {
      it('should update category type', async () => {
        const categoryType = await testData.createCategoryType(
          organizationId,
          'update_key',
          'Original Label'
        );

        const response = await app.inject({
          method: 'PUT',
          url: `/api/categories/types/${categoryType.id}`,
          headers: authHeaders(organizationId),
          payload: {
            label: 'Updated Label',
          },
        });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body.data.label).toBe('Updated Label');
      });
    });

    describe('DELETE /api/categories/types/:id', () => {
      it('should delete category type', async () => {
        const categoryType = await testData.createCategoryType(
          organizationId,
          'delete_key',
          'To Delete'
        );

        const response = await app.inject({
          method: 'DELETE',
          url: `/api/categories/types/${categoryType.id}`,
          headers: authHeaders(organizationId),
        });

        expect(response.statusCode).toBe(204);

        // Verify deletion
        const deleted = await prisma.categoryType.findUnique({
          where: { id: categoryType.id },
        });
        expect(deleted).toBeNull();
      });
    });
  });

  describe('Category Items', () => {
    let categoryTypeId: string;

    beforeEach(async () => {
      const categoryType = await testData.createCategoryType(
        organizationId,
        'items_test_type',
        'Items Test Type'
      );
      categoryTypeId = categoryType.id;
    });

    describe('POST /api/categories/items', () => {
      it('should create category item successfully', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/categories/items',
          headers: authHeaders(organizationId),
          payload: {
            categoryTypeId,
            name: 'Test Item',
          },
        });

        expect(response.statusCode).toBe(201);
        const body = response.json();
        expect(body.success).toBe(true);
        expect(body.data.name).toBe('Test Item');
      });

      it('should reject duplicate item name in same category type', async () => {
        await testData.createCategoryItem(organizationId, categoryTypeId, 'Duplicate Item');

        const response = await app.inject({
          method: 'POST',
          url: '/api/categories/items',
          headers: authHeaders(organizationId),
          payload: {
            categoryTypeId,
            name: 'Duplicate Item',
          },
        });

        expect(response.statusCode).toBe(409);
      });
    });

    describe('GET /api/categories/items/type/:typeKey', () => {
      it('should list items by type key', async () => {
        await testData.createCategoryItem(organizationId, categoryTypeId, 'Item 1');
        await testData.createCategoryItem(organizationId, categoryTypeId, 'Item 2');

        const response = await app.inject({
          method: 'GET',
          url: '/api/categories/items/type/items_test_type',
          headers: authHeaders(organizationId),
        });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body.data).toHaveLength(2);
      });
    });

    describe('GET /api/categories/items/:id', () => {
      it('should get category item by id', async () => {
        const item = await testData.createCategoryItem(organizationId, categoryTypeId, 'Get Item');

        const response = await app.inject({
          method: 'GET',
          url: `/api/categories/items/${item.id}`,
          headers: authHeaders(organizationId),
        });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body.data.id).toBe(item.id);
      });
    });

    describe('PUT /api/categories/items/:id', () => {
      it('should update category item', async () => {
        const item = await testData.createCategoryItem(organizationId, categoryTypeId, 'Original');

        const response = await app.inject({
          method: 'PUT',
          url: `/api/categories/items/${item.id}`,
          headers: authHeaders(organizationId),
          payload: {
            name: 'Updated',
          },
        });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body.data.name).toBe('Updated');
      });
    });

    describe('DELETE /api/categories/items/:id', () => {
      it('should delete category item', async () => {
        const item = await testData.createCategoryItem(organizationId, categoryTypeId, 'To Delete');

        const response = await app.inject({
          method: 'DELETE',
          url: `/api/categories/items/${item.id}`,
          headers: authHeaders(organizationId),
        });

        expect(response.statusCode).toBe(204);

        // Verify deletion
        const deleted = await prisma.categoryItem.findUnique({
          where: { id: item.id },
        });
        expect(deleted).toBeNull();
      });
    });
  });
});
