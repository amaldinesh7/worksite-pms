import { buildApp } from '../app';

/**
 * Creates a test app instance with logging disabled.
 * Use this in tests to avoid noisy console output.
 */
export async function createTestApp() {
  return buildApp({ logger: false });
}
