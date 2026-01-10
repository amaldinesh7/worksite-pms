// Extend Fastify types for OpenAPI/Swagger schema properties
// These allow using tags, description, security in route schemas

import 'fastify';

declare module 'fastify' {
  interface FastifySchema {
    /** OpenAPI tags for route grouping */
    tags?: string[];
    /** OpenAPI route description */
    description?: string;
    /** OpenAPI summary */
    summary?: string;
    /** OpenAPI security requirements */
    security?: Array<Record<string, string[]>>;
    /** OpenAPI deprecated flag */
    deprecated?: boolean;
  }
}
