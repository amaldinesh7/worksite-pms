/**
 * Import API Controller
 *
 * Handles async file import operations:
 * - Start import (upload file, create job, queue processing)
 * - Get job status
 * - Get active imports for user
 * - Confirm import (save parsed items)
 * - Cancel import
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';
import { createErrorHandler } from '../../lib/error-handler';
import { sendSuccess } from '../../lib/response.utils';

// Create resource-specific error handler
const handle = createErrorHandler('import');
import { storageService } from '../../services/storage.service';
import { queueBOQImport, type BOQImportJobData } from '../../lib/job-queue';
import { boqSectionRepository } from '../../repositories/boq.repository';
import type {
  ProjectImportParams,
  ImportJobParams,
  ConfirmImportBody,
  JobsQuery,
  StuckJobsQuery,
} from './imports.schema';

// ============================================
// Start Import
// ============================================

/**
 * Start a new import job
 * 1. Uploads file to Supabase storage
 * 2. Creates ImportJob record in database
 * 3. Queues the job for async processing
 * 4. Returns jobId immediately
 */
export const startImport = handle(
  'create',
  async (request: FastifyRequest<{ Params: ProjectImportParams }>, reply: FastifyReply) => {
    const { projectId } = request.params;
    const data = await request.file();

    if (!data) {
      return reply.code(400).send({
        success: false,
        error: { message: 'No file uploaded', code: 'NO_FILE' },
      });
    }

    // Validate file type
    const fileName = data.filename;
    const ext = fileName.toLowerCase().split('.').pop();
    const validExtensions = ['xlsx', 'xls', 'csv', 'pdf'];

    if (!ext || !validExtensions.includes(ext)) {
      return reply.code(400).send({
        success: false,
        error: {
          message: `Invalid file type. Supported: ${validExtensions.join(', ')}`,
          code: 'INVALID_FILE_TYPE',
        },
      });
    }

    // Get file buffer
    const buffer = await data.toBuffer();
    const fileSize = buffer.length;

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (fileSize > maxSize) {
      return reply.code(400).send({
        success: false,
        error: {
          message: 'File too large. Maximum size is 100MB.',
          code: 'FILE_TOO_LARGE',
        },
      });
    }

    // Determine MIME type
    const mimeTypes: Record<string, string> = {
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      csv: 'text/csv',
      pdf: 'application/pdf',
    };
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    try {
      // 1. Upload file to storage
      const uploadResult = await storageService.uploadFile(
        buffer,
        fileName,
        mimeType,
        `imports/${request.organizationId}/${projectId}`
      );

      // 2. Create ImportJob record
      const job = await prisma.importJob.create({
        data: {
          organizationId: request.organizationId,
          projectId,
          userId: request.userId,
          status: 'QUEUED',
          progress: 0,
          fileName,
          fileSize,
          fileType: ext,
          fileUrl: uploadResult.publicUrl,
        },
      });

      // 3. Queue the job for async processing
      const jobData: BOQImportJobData = {
        jobId: job.id,
        organizationId: request.organizationId,
        projectId,
        userId: request.userId,
        fileUrl: uploadResult.publicUrl,
        fileName,
        fileType: ext,
      };

      await queueBOQImport(jobData);

      console.log(`[Import] Started import job: ${job.id} for file: ${fileName}`);

      // 4. Return jobId immediately
      return sendSuccess(
        reply,
        {
          jobId: job.id,
          status: 'QUEUED',
          message: 'Import job started. Use WebSocket to track progress.',
        },
        202
      );
    } catch (error) {
      console.error('[Import] Failed to start import:', error);
      const message = error instanceof Error ? error.message : 'Failed to start import';
      return reply.code(500).send({
        success: false,
        error: { message, code: 'IMPORT_START_FAILED' },
      });
    }
  }
);

// ============================================
// Get Job Status
// ============================================

/**
 * Get the status of an import job
 */
export const getJobStatus = handle(
  'read',
  async (request: FastifyRequest<{ Params: ImportJobParams }>, reply: FastifyReply) => {
    const { projectId, jobId } = request.params;

    const job = await prisma.importJob.findFirst({
      where: {
        id: jobId,
        projectId,
        organizationId: request.organizationId,
      },
    });

    if (!job) {
      return reply.code(404).send({
        success: false,
        error: { message: 'Import job not found', code: 'NOT_FOUND' },
      });
    }

    return sendSuccess(reply, {
      id: job.id,
      status: job.status,
      progress: job.progress,
      fileName: job.fileName,
      fileSize: job.fileSize,
      fileType: job.fileType,
      itemsFound: job.itemsFound,
      itemsSaved: job.itemsSaved,
      errors: job.errors,
      result: job.result,
      startedAt: job.startedAt?.toISOString() ?? null,
      completedAt: job.completedAt?.toISOString() ?? null,
      createdAt: job.createdAt.toISOString(),
    });
  }
);

// ============================================
// Get Active Imports
// ============================================

/**
 * Get all active import jobs for the current user
 */
export const getActiveImports = handle(
  'read',
  async (request: FastifyRequest, reply: FastifyReply) => {
    const jobs = await prisma.importJob.findMany({
      where: {
        organizationId: request.organizationId,
        userId: request.userId,
        status: {
          in: ['PENDING', 'UPLOADING', 'QUEUED', 'PROCESSING', 'AI_PARSING', 'SAVING'],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(reply, {
      jobs: jobs.map((job) => ({
        id: job.id,
        projectId: job.projectId,
        status: job.status,
        progress: job.progress,
        fileName: job.fileName,
        fileSize: job.fileSize,
        fileType: job.fileType,
        itemsFound: job.itemsFound,
        itemsSaved: job.itemsSaved,
        errors: job.errors,
        result: job.result,
        startedAt: job.startedAt?.toISOString() ?? null,
        completedAt: job.completedAt?.toISOString() ?? null,
        createdAt: job.createdAt.toISOString(),
      })),
    });
  }
);

// ============================================
// Get Recent Imports
// ============================================

/**
 * Get recent import jobs (last 24 hours) for a project
 */
export const getRecentImports = handle(
  'read',
  async (request: FastifyRequest<{ Params: ProjectImportParams }>, reply: FastifyReply) => {
    const { projectId } = request.params;
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const jobs = await prisma.importJob.findMany({
      where: {
        organizationId: request.organizationId,
        projectId,
        createdAt: { gte: yesterday },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return sendSuccess(reply, {
      jobs: jobs.map((job) => ({
        id: job.id,
        status: job.status,
        progress: job.progress,
        fileName: job.fileName,
        fileSize: job.fileSize,
        fileType: job.fileType,
        itemsFound: job.itemsFound,
        itemsSaved: job.itemsSaved,
        errors: job.errors,
        startedAt: job.startedAt?.toISOString() ?? null,
        completedAt: job.completedAt?.toISOString() ?? null,
        createdAt: job.createdAt.toISOString(),
      })),
    });
  }
);

// ============================================
// Confirm Import
// ============================================

/**
 * Confirm and save parsed items from an import job
 */
export const confirmImport = handle(
  'create',
  async (
    request: FastifyRequest<{ Params: ImportJobParams; Body: ConfirmImportBody }>,
    reply: FastifyReply
  ) => {
    const { projectId, jobId } = request.params;
    const { items } = request.body;

    // Verify job exists and is completed
    const job = await prisma.importJob.findFirst({
      where: {
        id: jobId,
        projectId,
        organizationId: request.organizationId,
      },
    });

    if (!job) {
      return reply.code(404).send({
        success: false,
        error: { message: 'Import job not found', code: 'NOT_FOUND' },
      });
    }

    if (job.status !== 'COMPLETED') {
      return reply.code(400).send({
        success: false,
        error: {
          message: `Cannot confirm import. Job status is ${job.status}`,
          code: 'INVALID_STATUS',
        },
      });
    }

    try {
      // Create sections for items that have sectionName
      const sectionMap = new Map<string, string>();
      for (const item of items) {
        if (item.sectionName && !sectionMap.has(item.sectionName)) {
          const section = await boqSectionRepository.findOrCreate(
            request.organizationId,
            projectId,
            item.sectionName
          );
          sectionMap.set(item.sectionName, section.id);
        }
      }

      // Create BOQ items
      const createdItems = await prisma.$transaction(
        items.map((item) =>
          prisma.bOQItem.create({
            data: {
              organizationId: request.organizationId,
              projectId,
              sectionId: item.sectionName ? sectionMap.get(item.sectionName) : null,
              code: item.code,
              description: item.description,
              unit: item.unit,
              quantity: item.quantity,
              rate: item.rate,
            },
          })
        )
      );

      // Update job as saved
      await prisma.importJob.update({
        where: { id: jobId },
        data: {
          itemsSaved: createdItems.length,
          status: 'COMPLETED',
        },
      });

      console.log(`[Import] Confirmed import job: ${jobId}, saved ${createdItems.length} items`);

      return sendSuccess(reply, {
        itemsSaved: createdItems.length,
        message: 'Import confirmed successfully',
      });
    } catch (error) {
      console.error('[Import] Failed to confirm import:', error);
      const message = error instanceof Error ? error.message : 'Failed to confirm import';
      return reply.code(500).send({
        success: false,
        error: { message, code: 'CONFIRM_FAILED' },
      });
    }
  }
);

// ============================================
// Cancel Import
// ============================================

/**
 * Cancel/discard an import job
 */
export const cancelImport = handle(
  'delete',
  async (request: FastifyRequest<{ Params: ImportJobParams }>, reply: FastifyReply) => {
    const { projectId, jobId } = request.params;

    const job = await prisma.importJob.findFirst({
      where: {
        id: jobId,
        projectId,
        organizationId: request.organizationId,
      },
    });

    if (!job) {
      return reply.code(404).send({
        success: false,
        error: { message: 'Import job not found', code: 'NOT_FOUND' },
      });
    }

    // Delete the uploaded file if exists
    if (job.fileUrl) {
      try {
        // Extract path from URL
        const url = new URL(job.fileUrl);
        const path = url.pathname.split('/').slice(-3).join('/');
        await storageService.deleteFile(path);
      } catch (error) {
        console.warn('[Import] Failed to delete file:', error);
      }
    }

    // Update job status to FAILED (cancelled)
    await prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        errors: [...job.errors, 'Cancelled by user'],
        completedAt: new Date(),
      },
    });

    console.log(`[Import] Cancelled import job: ${jobId}`);

    return sendSuccess(reply, {
      message: 'Import cancelled',
    });
  }
);

// ============================================
// Monitoring Endpoints
// ============================================

/**
 * Get all import jobs with filters (Admin/Monitoring endpoint)
 */
export const getAllJobs = handle(
  'read',
  async (request: FastifyRequest<{ Querystring: JobsQuery }>, reply: FastifyReply) => {
    const { status, projectId, limit, offset } = request.query;

    const where: Record<string, unknown> = {
      organizationId: request.organizationId,
    };

    if (status) {
      where.status = status;
    }
    if (projectId) {
      where.projectId = projectId;
    }

    const [jobs, total] = await Promise.all([
      prisma.importJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          project: {
            select: { name: true },
          },
          user: {
            select: { name: true, phone: true },
          },
        },
      }),
      prisma.importJob.count({ where }),
    ]);

    return sendSuccess(reply, {
      jobs: jobs.map((job) => ({
        id: job.id,
        projectId: job.projectId,
        projectName: job.project.name,
        userId: job.userId,
        userName: job.user.name,
        status: job.status,
        progress: job.progress,
        fileName: job.fileName,
        fileSize: job.fileSize,
        fileType: job.fileType,
        itemsFound: job.itemsFound,
        itemsSaved: job.itemsSaved,
        errors: job.errors,
        startedAt: job.startedAt?.toISOString() ?? null,
        completedAt: job.completedAt?.toISOString() ?? null,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + jobs.length < total,
      },
    });
  }
);

/**
 * Get stuck jobs (jobs in processing state for too long)
 */
export const getStuckJobs = handle(
  'read',
  async (request: FastifyRequest<{ Querystring: StuckJobsQuery }>, reply: FastifyReply) => {
    const { minutes } = request.query;
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);

    const stuckJobs = await prisma.importJob.findMany({
      where: {
        organizationId: request.organizationId,
        status: {
          in: ['PROCESSING', 'AI_PARSING', 'SAVING', 'QUEUED'],
        },
        startedAt: {
          lt: cutoff,
        },
      },
      orderBy: { startedAt: 'asc' },
      include: {
        project: {
          select: { name: true },
        },
      },
    });

    return sendSuccess(reply, {
      stuckJobs: stuckJobs.map((job) => ({
        id: job.id,
        projectId: job.projectId,
        projectName: job.project.name,
        status: job.status,
        progress: job.progress,
        fileName: job.fileName,
        fileSize: job.fileSize,
        startedAt: job.startedAt?.toISOString() ?? null,
        stuckForMinutes: job.startedAt
          ? Math.round((Date.now() - job.startedAt.getTime()) / 60000)
          : null,
        errors: job.errors,
      })),
      threshold: `${minutes} minutes`,
      count: stuckJobs.length,
    });
  }
);

/**
 * Get job queue statistics
 */
export const getQueueStats = handle(
  'read',
  async (request: FastifyRequest, reply: FastifyReply) => {
    // Get job counts by status from database
    const statusCounts = await prisma.importJob.groupBy({
      by: ['status'],
      where: {
        organizationId: request.organizationId,
      },
      _count: {
        status: true,
      },
    });

    // Get pg-boss queue info
    let queueInfo = null;
    try {
      // Just count pending jobs in the database as a simple queue size indicator
      const pendingCount = await prisma.importJob.count({
        where: {
          organizationId: request.organizationId,
          status: { in: ['QUEUED', 'PROCESSING', 'AI_PARSING'] },
        },
      });
      queueInfo = {
        queueName: 'boq-import',
        pendingJobs: pendingCount,
      };
    } catch (error) {
      console.warn('[Import] Failed to get queue info:', error);
    }

    // Get recent job statistics (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentStats = await prisma.importJob.aggregate({
      where: {
        organizationId: request.organizationId,
        createdAt: { gte: yesterday },
      },
      _count: true,
      _avg: {
        fileSize: true,
        itemsFound: true,
      },
    });

    // Calculate average processing time for completed jobs
    const completedJobs = await prisma.importJob.findMany({
      where: {
        organizationId: request.organizationId,
        status: 'COMPLETED',
        startedAt: { not: null },
        completedAt: { not: null },
        createdAt: { gte: yesterday },
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
    });

    const avgProcessingTimeMs =
      completedJobs.length > 0
        ? completedJobs.reduce((sum, job) => {
            if (job.startedAt && job.completedAt) {
              return sum + (job.completedAt.getTime() - job.startedAt.getTime());
            }
            return sum;
          }, 0) / completedJobs.length
        : null;

    return sendSuccess(reply, {
      statusBreakdown: Object.fromEntries(statusCounts.map((s) => [s.status, s._count.status])),
      queue: queueInfo,
      last24Hours: {
        totalJobs: recentStats._count,
        avgFileSize: recentStats._avg.fileSize ? Math.round(recentStats._avg.fileSize) : null,
        avgItemsFound: recentStats._avg.itemsFound ? Math.round(recentStats._avg.itemsFound) : null,
        avgProcessingTimeSeconds: avgProcessingTimeMs
          ? Math.round(avgProcessingTimeMs / 1000)
          : null,
        completedJobs: completedJobs.length,
      },
    });
  }
);

/**
 * Retry a failed import job
 */
export const retryJob = handle(
  'update',
  async (request: FastifyRequest<{ Params: ImportJobParams }>, reply: FastifyReply) => {
    const { projectId, jobId } = request.params;

    const job = await prisma.importJob.findFirst({
      where: {
        id: jobId,
        projectId,
        organizationId: request.organizationId,
      },
    });

    if (!job) {
      return reply.code(404).send({
        success: false,
        error: { message: 'Import job not found', code: 'NOT_FOUND' },
      });
    }

    if (job.status !== 'FAILED') {
      return reply.code(400).send({
        success: false,
        error: {
          message: `Can only retry failed jobs. Current status: ${job.status}`,
          code: 'INVALID_STATUS',
        },
      });
    }

    // Reset job status and re-queue
    await prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: 'QUEUED',
        progress: 0,
        errors: [],
        startedAt: null,
        completedAt: null,
        result: undefined, // Clear result by setting to undefined (Prisma will handle)
        itemsFound: null,
      },
    });

    // Re-queue the job
    const jobData: BOQImportJobData = {
      jobId: job.id,
      organizationId: job.organizationId,
      projectId: job.projectId,
      userId: job.userId,
      fileUrl: job.fileUrl || '',
      fileName: job.fileName,
      fileType: job.fileType,
    };

    await queueBOQImport(jobData);

    console.log(`[Import] Retrying import job: ${jobId}`);

    return sendSuccess(reply, {
      jobId: job.id,
      status: 'QUEUED',
      message: 'Job has been re-queued for processing',
    });
  }
);

// ============================================
// Test URL-Based Parsing (Development Only)
// ============================================

import { getAIParser } from '../../services/boq-extraction/ai-parser.service';

/**
 * Helper to parse financial numbers (same as used in import worker)
 */
function parseFinancialNumber(value: string): number {
  if (!value || typeof value !== 'string') return 0;
  // Remove currency symbols, commas, spaces
  const cleaned = value.replace(/[₹$€£,\s]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

import * as boqImportService from '../../services/boq-import.service';

/**
 * TEST ENDPOINT: Test URL-based parsing with hardcoded Google Sheets URL
 *
 * GET /imports/test-url-parsing
 *
 * Downloads a file from URL and parses it using the BOQ import service.
 */
export const testUrlParsing = handle(
  'read',
  async (request: FastifyRequest, reply: FastifyReply) => {
    // Hardcoded test URL - Google Sheets direct download link
    const TEST_URL =
      'https://docs.google.com/spreadsheets/d/1TOEj42EjjXNczWJQ0ts-rFKkv7Yc5OLa/export?format=xlsx';
    const TEST_FILENAME = 'BOQ-2100-test.xlsx';

    console.log('[TestURLParsing] Starting URL-based parsing test...');
    console.log(`[TestURLParsing] URL: ${TEST_URL}`);

    const startTime = Date.now();

    try {
      // Step 1: Download the file
      console.log('[TestURLParsing] Downloading file...');
      const downloadStart = Date.now();

      const response = await fetch(TEST_URL);
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const downloadTime = Date.now() - downloadStart;
      const fileSizeMB = buffer.length / 1024 / 1024;

      console.log(`[TestURLParsing] Downloaded ${fileSizeMB.toFixed(2)}MB in ${downloadTime}ms`);

      // Step 2: Parse the document
      console.log('[TestURLParsing] Starting parsing...');

      const result = await boqImportService.parseDocument(buffer, TEST_FILENAME);

      const elapsed = Date.now() - startTime;

      console.log(`[TestURLParsing] Completed in ${elapsed}ms`);
      console.log(`[TestURLParsing] Items found: ${result.items.length}`);
      console.log(`[TestURLParsing] Sections: ${result.sections.join(', ')}`);
      console.log(
        `[TestURLParsing] Errors: ${result.errors.length > 0 ? result.errors.join(', ') : 'None'}`
      );

      return sendSuccess(reply, {
        testUrl: TEST_URL,
        fileName: TEST_FILENAME,
        fileSizeMB: parseFloat(fileSizeMB.toFixed(2)),
        downloadTimeMs: downloadTime,
        totalElapsedMs: elapsed,
        result: {
          itemCount: result.items.length,
          sections: result.sections,
          calculatedTotal: result.calculatedTotal,
          flaggedItems: result.flaggedItems,
          errors: result.errors,
          // Include first 15 items as sample
          sampleItems: result.items.slice(0, 15).map((item: boqImportService.ParsedBOQItem) => ({
            code: item.code,
            description: item.description.substring(0, 100),
            unit: item.unit,
            quantity: item.quantity,
            rate: item.rate,
            sectionName: item.sectionName,
            isReviewFlagged: item.isReviewFlagged,
          })),
        },
      });
    } catch (error) {
      const elapsed = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown error';

      console.error(`[TestURLParsing] Failed after ${elapsed}ms:`, error);

      return reply.code(500).send({
        success: false,
        error: {
          message: `URL parsing test failed: ${message}`,
          code: 'TEST_FAILED',
        },
        elapsedMs: elapsed,
      });
    }
  }
);
