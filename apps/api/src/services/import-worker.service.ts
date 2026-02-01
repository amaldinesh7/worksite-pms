/**
 * Import Worker Service
 *
 * Processes BOQ import jobs from the pg-boss queue.
 * Downloads file from storage, parses with AI, and broadcasts progress via WebSocket.
 */

import type { ImportJobStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getJobQueue, QUEUE_NAMES, type BOQImportJobData } from '../lib/job-queue';
import { broadcastJobStatus, broadcastJobResult, broadcastJobError } from '../lib/websocket';
import { storageService } from './storage.service';
import { boqImportService } from './boq-import.service';

// ============================================
// Worker State
// ============================================

let isWorkerStarted = false;

// ============================================
// Job Processing
// ============================================

/**
 * Process a BOQ import job
 */
async function processBOQImportJob(job: BOQImportJobData): Promise<void> {
  const { jobId, fileUrl, fileName } = job;

  console.log(`[ImportWorker] Processing job: ${jobId}, file: ${fileName}`);

  try {
    // Update status to PROCESSING
    await updateJobStatus(jobId, 'PROCESSING', 10);
    broadcastJobStatus(jobId, 'PROCESSING', 10);

    // Download file from storage
    console.log(`[ImportWorker] Downloading file from storage...`);
    await updateJobStatus(jobId, 'PROCESSING', 20);
    broadcastJobStatus(jobId, 'PROCESSING', 20);

    // Extract storage path from URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    // Get last 3 parts: imports/orgId/projectId/timestamp-filename
    const storagePath = pathParts.slice(-4).join('/');

    let buffer: Buffer;
    try {
      buffer = await storageService.downloadFile(storagePath);
    } catch (error) {
      console.error(`[ImportWorker] Failed to download file:`, error);
      throw new Error(
        `Failed to download file from storage: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    console.log(`[ImportWorker] File downloaded: ${buffer.length} bytes`);

    // Check file size limit
    if (buffer.length > boqImportService.MAX_FILE_SIZE) {
      throw new Error(
        `File too large. Maximum size is 10MB, got ${(buffer.length / 1024 / 1024).toFixed(2)}MB`
      );
    }

    // Update status to AI_PARSING
    await updateJobStatus(jobId, 'AI_PARSING', 30);
    broadcastJobStatus(jobId, 'AI_PARSING', 30);

    // Parse document using direct AI processing
    console.log(`[ImportWorker] Starting AI parsing...`);
    const parseResult = await boqImportService.parseDocument(buffer, fileName);

    console.log(`[ImportWorker] Parsing complete: ${parseResult.items?.length ?? 0} items found`);

    // Update with items found
    await updateJobStatus(jobId, 'AI_PARSING', 80, {
      itemsFound: parseResult.items?.length ?? 0,
      errors: parseResult.errors || [],
    });
    broadcastJobStatus(jobId, 'AI_PARSING', 80, {
      itemsFound: parseResult.items?.length ?? 0,
    });

    // Check for parsing errors
    if (
      parseResult.errors &&
      parseResult.errors.length > 0 &&
      (!parseResult.items || parseResult.items.length === 0)
    ) {
      throw new Error(`Parsing failed: ${parseResult.errors.join(', ')}`);
    }

    // Store result in database
    await updateJobStatus(jobId, 'COMPLETED', 100, {
      itemsFound: parseResult.items?.length ?? 0,
      result: parseResult as object,
    });

    // Broadcast completion
    broadcastJobStatus(jobId, 'COMPLETED', 100, {
      itemsFound: parseResult.items?.length ?? 0,
    });
    broadcastJobResult(jobId, parseResult);

    console.log(`[ImportWorker] Job completed: ${jobId}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[ImportWorker] Job failed: ${jobId}`, error);

    // Update job as failed
    await updateJobStatus(jobId, 'FAILED', 0, {
      errors: [message],
    });

    // Broadcast error
    broadcastJobStatus(jobId, 'FAILED', 0);
    broadcastJobError(jobId, message);

    // Re-throw to let pg-boss handle retry logic
    throw error;
  }
}

/**
 * Update job status in database
 */
async function updateJobStatus(
  jobId: string,
  status: ImportJobStatus,
  progress: number,
  extra?: {
    itemsFound?: number;
    itemsSaved?: number;
    errors?: string[];
    result?: object;
  }
): Promise<void> {
  // Build update data dynamically based on what's provided
  const data: Parameters<typeof prisma.importJob.update>[0]['data'] = {
    status,
    progress,
  };

  if (extra?.itemsFound !== undefined) {
    data.itemsFound = extra.itemsFound;
  }
  if (extra?.itemsSaved !== undefined) {
    data.itemsSaved = extra.itemsSaved;
  }
  if (extra?.errors !== undefined) {
    data.errors = extra.errors;
  }
  if (extra?.result !== undefined) {
    data.result = extra.result;
  }

  // Set timestamps
  if (status === 'PROCESSING' && progress <= 10) {
    data.startedAt = new Date();
  }
  if (status === 'COMPLETED' || status === 'FAILED') {
    data.completedAt = new Date();
  }

  await prisma.importJob.update({
    where: { id: jobId },
    data,
  });
}

// ============================================
// Worker Lifecycle
// ============================================

/**
 * Start the import worker
 * Registers job handlers with pg-boss
 */
export async function startImportWorker(): Promise<void> {
  if (isWorkerStarted) {
    console.log('[ImportWorker] Worker already started');
    return;
  }

  const boss = getJobQueue();

  // Register handler for BOQ import jobs
  await boss.work<BOQImportJobData>(
    QUEUE_NAMES.BOQ_IMPORT,
    {
      // Process one job at a time to avoid overwhelming the AI API
      localConcurrency: 1,
      // Process jobs every 5 seconds
      pollingIntervalSeconds: 5,
    },
    async (jobs) => {
      // pg-boss v12 passes an array of jobs to the handler
      for (const job of jobs) {
        console.log(`[ImportWorker] Received job: ${job.id}`);
        await processBOQImportJob(job.data);
      }
    }
  );

  isWorkerStarted = true;
  console.log('[ImportWorker] Worker started, listening for jobs');
}

/**
 * Stop the import worker
 */
export async function stopImportWorker(): Promise<void> {
  if (!isWorkerStarted) {
    return;
  }

  const boss = getJobQueue();
  await boss.offWork(QUEUE_NAMES.BOQ_IMPORT);

  isWorkerStarted = false;
  console.log('[ImportWorker] Worker stopped');
}

/**
 * Check if worker is running
 */
export function isWorkerRunning(): boolean {
  return isWorkerStarted;
}
