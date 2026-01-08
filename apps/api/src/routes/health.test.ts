import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestApp } from '../tests/helper';
import type { FastifyInstance } from 'fastify';

describe('Health endpoint', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns status ok', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('ok');
    expect(res.json().timestamp).toBeDefined();
  });
});

describe('API info endpoint', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api returns API info', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().name).toBe('Construction PMS API');
    expect(res.json().endpoints).toContain('/api/projects');
  });

  it('returns correct content-type', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api',
    });

    expect(res.headers['content-type']).toContain('application/json');
  });
});
