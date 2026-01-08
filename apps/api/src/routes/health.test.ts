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
    expect(res.json()).toEqual({ status: 'ok' });
  });
});

describe('Hello endpoint', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/hello returns greeting message', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/hello',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ message: 'Hello from API!' });
  });

  it('returns correct content-type', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/hello',
    });

    expect(res.headers['content-type']).toContain('application/json');
  });
});
