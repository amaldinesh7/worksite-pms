/**
 * Job Queue - pg-boss initialization and management
 *
 * pg-boss is a PostgreSQL-based job queue that provides:
 * - Persistent job storage (survives restarts)
 * - Automatic retries with exponential backoff
 * - Job scheduling and delays
 * - Concurrency control
 */

import { PgBoss } from 'pg-boss';
import { env } from '../config/env';

// ============================================
// Queue Names
// ============================================

export const QUEUE_NAMES = {
  BOQ_IMPORT: 'boq-import',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// ============================================
// Job Types
// ============================================

export interface BOQImportJobData {
  jobId: string;
  organizationId: string;
  projectId: string;
  userId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

// ============================================
// Singleton Instance
// ============================================

let boss: PgBoss | null = null;

/**
 * Initialize pg-boss with the database connection
 */
export async function initJobQueue(): Promise<PgBoss> {
  if (boss) {
    return boss;
  }

  const connectionString = env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required for job queue');
  }

  boss = new PgBoss({
    connectionString,
    // Use a separate schema for pg-boss tables
    schema: 'pgboss',
    // Monitor interval for maintenance tasks
    monitorIntervalSeconds: 30,
    // Maintenance interval
    maintenanceIntervalSeconds: 60,
  });

  // Handle errors
  boss.on('error', (error: Error) => {
    console.error('[JobQueue] pg-boss error:', error);
  });

  // Start the queue
  await boss.start();
  console.log('[JobQueue] pg-boss started successfully');

  // Create queues (pg-boss v12 requires explicit queue creation)
  await createQueues(boss);

  return boss;
}

/**
 * Create all required queues
 * pg-boss v12 requires queues to be created before workers can listen on them
 */
async function createQueues(boss: PgBoss): Promise<void> {
  try {
    // Create the BOQ import queue
    await boss.createQueue(QUEUE_NAMES.BOQ_IMPORT, {
      // Retry settings
      retryLimit: 3,
      retryDelay: 30,
      retryBackoff: true,
      // Job expires after 1 hour
      expireInSeconds: 60 * 60,
      // Keep completed jobs for 24 hours
      retentionSeconds: 60 * 60 * 24,
    });
    console.log(`[JobQueue] Created queue: ${QUEUE_NAMES.BOQ_IMPORT}`);
  } catch (error) {
    // Queue might already exist, which is fine
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log(`[JobQueue] Queue already exists: ${QUEUE_NAMES.BOQ_IMPORT}`);
    } else {
      console.error('[JobQueue] Error creating queue:', error);
      throw error;
    }
  }
}

/**
 * Get the pg-boss instance (must be initialized first)
 */
export function getJobQueue(): PgBoss {
  if (!boss) {
    throw new Error('Job queue not initialized. Call initJobQueue() first.');
  }
  return boss;
}

/**
 * Stop the job queue gracefully
 */
export async function stopJobQueue(): Promise<void> {
  if (boss) {
    await boss.stop({ graceful: true, timeout: 30000 });
    boss = null;
    console.log('[JobQueue] pg-boss stopped');
  }
}

/**
 * Queue a BOQ import job
 */
export async function queueBOQImport(data: BOQImportJobData): Promise<string | null> {
  const queue = getJobQueue();

  // Queue inherits default options from createQueue, so we just send the data
  const jobId = await queue.send(QUEUE_NAMES.BOQ_IMPORT, data);

  console.log(`[JobQueue] Queued BOQ import job: ${jobId}`);
  return jobId;
}
