/**
 * Service Registry
 *
 * This file catalogs all external services/integrations used in the project.
 * It is scanned by `pnpm docs:generate` to auto-generate documentation.
 *
 * When adding a new service:
 * 1. Add an entry to this registry
 * 2. Create the service implementation file
 * 3. Run `pnpm docs:generate` to update docs
 */

export interface ServiceConfig {
  /** Display name of the service */
  name: string;
  /** What this service is used for */
  purpose: string;
  /** Required environment variables */
  envVars: string[];
  /** Link to official documentation */
  docsUrl: string;
  /** Path to the implementation file (relative to services/) */
  implementedIn?: string;
  /** Current status */
  status: 'active' | 'planned' | 'deprecated';
  /** Optional notes */
  notes?: string;
}

export const serviceRegistry: Record<string, ServiceConfig> = {
  // ============================================
  // DATABASE
  // ============================================
  postgresql: {
    name: 'PostgreSQL',
    purpose: 'Primary database for persistent data storage',
    envVars: ['DATABASE_URL'],
    docsUrl: 'https://www.postgresql.org/docs/',
    status: 'active',
    notes: 'Managed via Prisma ORM',
  },
};

/**
 * Get all active services
 */
export function getActiveServices(): Record<string, ServiceConfig> {
  return Object.fromEntries(
    Object.entries(serviceRegistry).filter(([, config]) => config.status === 'active')
  );
}

/**
 * Get all required environment variables
 */
export function getRequiredEnvVars(): string[] {
  return Object.values(serviceRegistry)
    .filter((config) => config.status === 'active')
    .flatMap((config) => config.envVars);
}
