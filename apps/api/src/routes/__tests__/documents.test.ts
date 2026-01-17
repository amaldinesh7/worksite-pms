import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import {
  createTestApp,
  testData,
  cleanup,
  authHeaders,
  setupTestContext,
} from '../../tests/helper';
import { prisma } from '../../lib/prisma';
import type { FastifyInstance } from 'fastify';
import { CompressionService } from '../../services/compression.service';

// Mock the storage service to avoid actual S3/MinIO calls in tests
vi.mock('../../services/storage.service', () => ({
  storageService: {
    uploadFile: vi.fn().mockResolvedValue({
      path: 'test/123-test-file.jpg',
      publicUrl: 'http://localhost:9000/documents/test/123-test-file.jpg',
    }),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    getSignedUrl: vi.fn().mockResolvedValue('http://localhost:9000/signed-url'),
  },
  StorageService: vi.fn(),
}));

describe('Documents API', () => {
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
    await prisma.document.deleteMany({ where: { organizationId: ctx.organization.id } });
  });

  describe('Compression Service', () => {
    it('should compress JPEG images', async () => {
      const compressionService = new CompressionService();

      // Create a simple test image buffer (1x1 red pixel JPEG)
      // This is a minimal valid JPEG
      const jpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06,
        0x05, 0x08, 0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b,
        0x0c, 0x19, 0x12, 0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
        0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31,
        0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff,
        0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00,
        0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
        0xff, 0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01, 0x03, 0x03, 0x02, 0x04, 0x03, 0x05, 0x05,
        0x04, 0x04, 0x00, 0x00, 0x01, 0x7d, 0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21,
        0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
        0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a,
        0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x34, 0x35, 0x36, 0x37,
        0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56,
        0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
        0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93,
        0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9,
        0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6,
        0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
        0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7,
        0xf8, 0xf9, 0xfa, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0xfb, 0xd5,
        0xdb, 0x20, 0xa8, 0xf1, 0x45, 0x14, 0x57, 0xff, 0xd9,
      ]);

      const result = await compressionService.compress(jpegBuffer, 'test.jpg');

      expect(result.mimeType).toBe('image/jpeg');
      expect(result.originalSize).toBe(jpegBuffer.length);
      expect(result.compressedSize).toBeGreaterThan(0);
    });

    it('should return original for unknown file types', async () => {
      const compressionService = new CompressionService();
      const unknownBuffer = Buffer.from('This is just some text content');

      const result = await compressionService.compress(unknownBuffer, 'test.txt');

      expect(result.mimeType).toBe('application/octet-stream');
      expect(result.originalSize).toBe(unknownBuffer.length);
      expect(result.compressedSize).toBe(unknownBuffer.length);
      expect(result.compressionRatio).toBe(1);
    });
  });

  describe('GET /api/documents', () => {
    it('should list documents with pagination', async () => {
      await Promise.all([
        testData.createDocument(ctx.organization.id, projectId),
        testData.createDocument(ctx.organization.id, projectId),
        testData.createDocument(ctx.organization.id, projectId),
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/documents?page=1&limit=2',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(2);
      expect(body.data.pagination.total).toBe(3);
    });

    it('should filter documents by project', async () => {
      const otherProject = await testData.createProject(
        ctx.organization.id,
        ctx.residentialType.id
      );

      await testData.createDocument(ctx.organization.id, projectId);
      await testData.createDocument(ctx.organization.id, otherProject.id);

      const response = await app.inject({
        method: 'GET',
        url: `/api/documents?projectId=${projectId}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(1);
    });

    it('should return document metadata in response', async () => {
      await testData.createDocument(ctx.organization.id, projectId, {
        fileName: 'test-document.pdf',
        mimeType: 'application/pdf',
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/documents',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items[0].fileName).toBe('test-document.pdf');
      expect(body.data.items[0].mimeType).toBe('application/pdf');
    });
  });

  describe('GET /api/documents/:id', () => {
    it('should get document by id', async () => {
      const document = await testData.createDocument(ctx.organization.id, projectId, {
        fileName: 'specific-file.pdf',
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/documents/${document.id}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.id).toBe(document.id);
      expect(body.data.fileName).toBe('specific-file.pdf');
    });

    it('should return 404 for non-existent document', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/documents/non-existent-id',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(404);
    });

    it('should not return document from other organization', async () => {
      const otherOrg = await testData.createOrganization('Other Org');
      const otherProjectType = await testData.createCategoryType(otherOrg.id, 'project_type');
      const otherProjectItem = await testData.createCategoryItem(
        otherOrg.id,
        otherProjectType.id,
        'Other Type'
      );
      const otherProject = await testData.createProject(otherOrg.id, otherProjectItem.id);
      const otherDocument = await testData.createDocument(otherOrg.id, otherProject.id);

      const response = await app.inject({
        method: 'GET',
        url: `/api/documents/${otherDocument.id}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(404);

      // Cleanup
      await cleanup.organization(otherOrg.id);
    });
  });

  describe('GET /api/documents/:id/download', () => {
    it('should return signed download URL', async () => {
      const document = await testData.createDocument(ctx.organization.id, projectId);

      const response = await app.inject({
        method: 'GET',
        url: `/api/documents/${document.id}/download`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.downloadUrl).toBeDefined();
      expect(body.data.expiresIn).toBe(3600);
      expect(body.data.fileName).toBe(document.fileName);
    });

    it('should return 404 for non-existent document', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/documents/non-existent-id/download',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should delete document', async () => {
      const document = await testData.createDocument(ctx.organization.id, projectId);

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/documents/${document.id}`,
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(204);

      const deleted = await prisma.document.findUnique({ where: { id: document.id } });
      expect(deleted).toBeNull();
    });

    it('should return 404 when deleting non-existent document', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/documents/non-existent-id',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/documents (Upload)', () => {
    it('should require projectId query parameter', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/documents',
        headers: authHeaders(ctx.organization.id),
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject invalid project ID', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/documents?projectId=invalid-project-id',
        headers: {
          ...authHeaders(ctx.organization.id),
          'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary',
        },
        payload:
          '------WebKitFormBoundary\r\n' +
          'Content-Disposition: form-data; name="file"; filename="test.txt"\r\n' +
          'Content-Type: text/plain\r\n\r\n' +
          'test content\r\n' +
          '------WebKitFormBoundary--\r\n',
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.error.code).toBe('INVALID_PROJECT');
    });
  });
});
