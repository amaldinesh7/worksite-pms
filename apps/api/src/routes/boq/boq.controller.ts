/**
 * BOQ Controller
 *
 * Handles BOQ (Bill of Quantities) API requests.
 */

import type { FastifyReply, FastifyRequest } from 'fastify';
import { boqItemRepository, boqSectionRepository } from '../../repositories/boq.repository';
import { boqImportService } from '../../services/boq-import.service';
import { createErrorHandler } from '../../lib/error-handler';
import {
  sendSuccess,
  sendPaginated,
  sendNotFound,
  sendNoContent,
  buildPagination,
} from '../../lib/response.utils';
import { env } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { storageService } from '../../services/storage.service';
import type {
  BOQListQuery,
  ProjectParams,
  BOQItemParams,
  BOQSectionParams,
  CreateBOQItemInput,
  UpdateBOQItemInput,
  CreateBOQSectionInput,
  UpdateBOQSectionInput,
  ConfirmImportInput,
  LinkExpenseInput,
  UnlinkExpenseParams,
  BatchBOQInput,
  BOQItemImageParams,
} from './boq.schema';

const handle = createErrorHandler('boq');

// ============================================
// BOQ Items
// ============================================

/**
 * List BOQ items for a project
 */
export const listBOQItems = handle(
  'fetch',
  async (
    request: FastifyRequest<{ Params: ProjectParams; Querystring: BOQListQuery }>,
    reply: FastifyReply
  ) => {
    const { projectId } = request.params;
    const { page, limit, boqCategoryItemId, stageId, sectionId, search, sortBy, sortOrder } =
      request.query;
    const skip = (page - 1) * limit;

    const { items, total } = await boqItemRepository.findAll(request.organizationId, projectId, {
      skip,
      take: limit,
      boqCategoryItemId,
      stageId,
      sectionId,
      search,
      sortBy,
      sortOrder,
    });

    return sendPaginated(reply, items, buildPagination(page, limit, total));
  }
);

/**
 * Get BOQ items grouped by category
 */
export const getBOQByCategory = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: ProjectParams }>, reply: FastifyReply) => {
    const grouped = await boqItemRepository.findByCategory(
      request.organizationId,
      request.params.projectId
    );

    // Transform to array format with totals
    const categories = Object.entries(grouped).map(([categoryId, { categoryName, items }]) => {
      const quotedTotal = items.reduce(
        (sum, item) => sum + item.rate.toNumber() * item.quantity.toNumber(),
        0
      );
      const actualTotal = items.reduce((sum, item) => {
        return (
          sum +
          item.expenseLinks.reduce((expSum, link) => {
            return expSum + link.expense.rate.toNumber() * link.expense.quantity.toNumber();
          }, 0)
        );
      }, 0);

      return {
        categoryId,
        categoryName,
        items,
        itemCount: items.length,
        quotedTotal,
        actualTotal,
        variance: quotedTotal - actualTotal,
      };
    });

    return sendSuccess(reply, categories);
  }
);

/**
 * Get BOQ items grouped by stage
 */
export const getBOQByStage = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: ProjectParams }>, reply: FastifyReply) => {
    const grouped = await boqItemRepository.findByStage(
      request.organizationId,
      request.params.projectId
    );

    // Transform to array format with totals
    const stages = Object.entries(grouped).map(([stageId, { stageName, items }]) => {
      const quotedTotal = items.reduce(
        (sum, item) => sum + item.rate.toNumber() * item.quantity.toNumber(),
        0
      );
      const actualTotal = items.reduce((sum, item) => {
        return (
          sum +
          item.expenseLinks.reduce((expSum, link) => {
            return expSum + link.expense.rate.toNumber() * link.expense.quantity.toNumber();
          }, 0)
        );
      }, 0);

      return {
        stageId: stageId === 'unassigned' ? null : stageId,
        stageName,
        items,
        itemCount: items.length,
        quotedTotal,
        actualTotal,
        variance: quotedTotal - actualTotal,
      };
    });

    return sendSuccess(reply, stages);
  }
);

/**
 * Get BOQ items grouped by section
 * This is the preferred way to view BOQ items
 */
export const getBOQBySection = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: ProjectParams }>, reply: FastifyReply) => {
    const grouped = await boqItemRepository.findBySection(
      request.organizationId,
      request.params.projectId
    );

    // Transform to array format with totals
    const sections = Object.entries(grouped).map(([sectionId, { sectionName, items }]) => {
      const quotedTotal = items.reduce(
        (sum, item) => sum + item.rate.toNumber() * item.quantity.toNumber(),
        0
      );
      const actualTotal = items.reduce((sum, item) => {
        return (
          sum +
          item.expenseLinks.reduce((expSum, link) => {
            return expSum + link.expense.rate.toNumber() * link.expense.quantity.toNumber();
          }, 0)
        );
      }, 0);

      return {
        sectionId: sectionId === 'other' ? null : sectionId,
        sectionName,
        items,
        itemCount: items.length,
        quotedTotal,
        actualTotal,
        variance: quotedTotal - actualTotal,
      };
    });

    return sendSuccess(reply, sections);
  }
);

/**
 * Get BOQ statistics for a project
 */
export const getBOQStats = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: ProjectParams }>, reply: FastifyReply) => {
    const stats = await boqItemRepository.getStats(
      request.organizationId,
      request.params.projectId
    );

    return sendSuccess(reply, stats);
  }
);

/**
 * Get single BOQ item
 */
export const getBOQItem = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: BOQItemParams }>, reply: FastifyReply) => {
    const item = await boqItemRepository.findById(request.organizationId, request.params.id);

    if (!item) {
      return sendNotFound(reply, 'BOQ Item');
    }

    return sendSuccess(reply, item);
  }
);

/**
 * Create a new BOQ item
 */
export const createBOQItem = handle(
  'create',
  async (
    request: FastifyRequest<{ Params: ProjectParams; Body: CreateBOQItemInput }>,
    reply: FastifyReply
  ) => {
    const { code, ...rest } = request.body;
    const item = await boqItemRepository.create(request.organizationId, {
      projectId: request.params.projectId,
      ...rest,
      // Convert null to undefined for code
      code: code ?? undefined,
    });

    return sendSuccess(reply, item, 201);
  }
);

/**
 * Update a BOQ item
 */
export const updateBOQItem = handle(
  'update',
  async (
    request: FastifyRequest<{ Params: BOQItemParams; Body: UpdateBOQItemInput }>,
    reply: FastifyReply
  ) => {
    const item = await boqItemRepository.update(
      request.organizationId,
      request.params.id,
      request.body
    );

    return sendSuccess(reply, item);
  }
);

/**
 * Delete a BOQ item
 */
export const deleteBOQItem = handle(
  'delete',
  async (request: FastifyRequest<{ Params: BOQItemParams }>, reply: FastifyReply) => {
    await boqItemRepository.delete(request.organizationId, request.params.id);
    return sendNoContent(reply);
  }
);

// ============================================
// BOQ Sections
// ============================================

/**
 * List BOQ sections for a project
 */
export const listBOQSections = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: ProjectParams }>, reply: FastifyReply) => {
    const sections = await boqSectionRepository.findByProject(
      request.organizationId,
      request.params.projectId
    );

    return sendSuccess(reply, sections);
  }
);

/**
 * Create a new BOQ section
 */
export const createBOQSection = handle(
  'create',
  async (
    request: FastifyRequest<{ Params: ProjectParams; Body: CreateBOQSectionInput }>,
    reply: FastifyReply
  ) => {
    const section = await boqSectionRepository.create(request.organizationId, {
      projectId: request.params.projectId,
      ...request.body,
    });

    return sendSuccess(reply, section, 201);
  }
);

/**
 * Update a BOQ section
 */
export const updateBOQSection = handle(
  'update',
  async (
    request: FastifyRequest<{ Params: BOQSectionParams; Body: UpdateBOQSectionInput }>,
    reply: FastifyReply
  ) => {
    const section = await boqSectionRepository.update(
      request.organizationId,
      request.params.sectionId,
      request.body
    );

    return sendSuccess(reply, section);
  }
);

/**
 * Delete a BOQ section
 */
export const deleteBOQSection = handle(
  'delete',
  async (request: FastifyRequest<{ Params: BOQSectionParams }>, reply: FastifyReply) => {
    await boqSectionRepository.delete(request.organizationId, request.params.sectionId);
    return sendNoContent(reply);
  }
);

// ============================================
// Import
// ============================================

/**
 * Parse uploaded file (Excel/CSV/PDF) using AI
 *
 * Items are grouped by sections extracted from the document.
 * No category mapping is performed - sections are the primary grouping.
 */
export const parseFile = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: ProjectParams }>, reply: FastifyReply) => {
    // Get multipart file
    const file = await request.file();

    if (!file) {
      return reply.code(400).send({
        success: false,
        error: { message: 'No file uploaded', code: 'NO_FILE' },
      });
    }

    const fileName = file.filename.toLowerCase();
    const buffer = await file.toBuffer();

    // Check file type
    const isExcel =
      fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv');
    const isPdf = fileName.endsWith('.pdf');

    if (!isExcel && !isPdf) {
      return reply.code(400).send({
        success: false,
        error: {
          message: 'Unsupported file type. Please upload Excel (.xlsx, .xls), CSV, or PDF files.',
          code: 'INVALID_FILE_TYPE',
        },
      });
    }

    // Check if AI is configured for PDF or enhanced parsing
    const useAI = isPdf || env.OPENAI_API_KEY;

    if (isPdf && !env.OPENAI_API_KEY) {
      return reply.code(400).send({
        success: false,
        error: {
          message:
            'PDF import requires OpenAI API configuration. Please contact your administrator or use Excel/CSV format instead.',
          code: 'PDF_NOT_CONFIGURED',
        },
      });
    }

    // Use AI-powered parsing if available (extracts sections from document)
    if (useAI && env.OPENAI_API_KEY) {
      const result = await boqImportService.parseDocument(buffer, file.filename);

      // Check if parsing actually succeeded - return HTTP 422 on failure
      if (result.items.length === 0 && result.errors.length > 0) {
        return reply.code(422).send({
          success: false,
          error: {
            message: result.errors.join('. '),
            code: 'PARSE_FAILED',
            details: {
              fileName: result.fileName,
              errors: result.errors,
            },
          },
        });
      }

      return sendSuccess(reply, result);
    }

    // Fallback to legacy Excel parser (non-AI)
    const result = await boqImportService.parseExcelBuffer(buffer, file.filename);

    // Check if parsing actually succeeded - return HTTP 422 on failure
    if (result.items.length === 0 && result.errors.length > 0) {
      return reply.code(422).send({
        success: false,
        error: {
          message: result.errors.join('. '),
          code: 'PARSE_FAILED',
          details: {
            fileName: result.fileName,
            errors: result.errors,
          },
        },
      });
    }

    return sendSuccess(reply, result);
  }
);

/**
 * Confirm and save imported BOQ items
 */
export const confirmImport = handle(
  'create',
  async (
    request: FastifyRequest<{ Params: ProjectParams; Body: ConfirmImportInput }>,
    reply: FastifyReply
  ) => {
    const { projectId } = request.params;
    const { items } = request.body;

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

    // Map items with section IDs (no category mapping required)
    const itemsToCreate = items.map((item) => ({
      projectId,
      sectionId: item.sectionName ? sectionMap.get(item.sectionName) : undefined,
      stageId: item.stageId,
      code: item.code,
      boqCategoryItemId: item.boqCategoryItemId || undefined,
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      rate: item.rate,
      isReviewFlagged: item.isReviewFlagged,
      flagReason: item.flagReason,
    }));

    const count = await boqItemRepository.createMany(request.organizationId, itemsToCreate);

    return sendSuccess(reply, { importedCount: count }, 201);
  }
);

// ============================================
// Expense Links
// ============================================

/**
 * Link an expense to a BOQ item
 */
export const linkExpense = handle(
  'create',
  async (
    request: FastifyRequest<{ Params: BOQItemParams; Body: LinkExpenseInput }>,
    reply: FastifyReply
  ) => {
    const link = await boqItemRepository.linkExpense(
      request.organizationId,
      request.params.id,
      request.body.expenseId
    );

    return sendSuccess(reply, link, 201);
  }
);

/**
 * Unlink an expense from a BOQ item
 */
export const unlinkExpense = handle(
  'delete',
  async (request: FastifyRequest<{ Params: UnlinkExpenseParams }>, reply: FastifyReply) => {
    await boqItemRepository.unlinkExpense(
      request.organizationId,
      request.params.id,
      request.params.expenseId
    );
    return sendNoContent(reply);
  }
);

// ============================================
// Batch Operations
// ============================================

/**
 * Batch update BOQ items and sections
 * Single API call for all changes from edit mode
 */
export const batchUpdate = handle(
  'update',
  async (
    request: FastifyRequest<{ Params: ProjectParams; Body: BatchBOQInput }>,
    reply: FastifyReply
  ) => {
    const { projectId } = request.params;
    const {
      itemUpdates = [],
      itemCreates = [],
      itemDeletes = [],
      sectionUpdates = [],
      sectionCreates = [],
      sectionDeletes = [],
    } = request.body;

    const results = {
      itemsUpdated: 0,
      itemsCreated: 0,
      itemsDeleted: 0,
      sectionsUpdated: 0,
      sectionsCreated: 0,
      sectionsDeleted: 0,
    };

    // 1. Create sections first (items may reference them)
    for (const section of sectionCreates) {
      await boqSectionRepository.create(request.organizationId, {
        projectId,
        name: section.name,
        sortOrder: section.sortOrder,
      });
      results.sectionsCreated++;
    }

    // 2. Update existing sections
    for (const { id, changes } of sectionUpdates) {
      await boqSectionRepository.update(request.organizationId, id, changes);
      results.sectionsUpdated++;
    }

    // 3. Create new items
    for (const item of itemCreates) {
      await boqItemRepository.create(request.organizationId, {
        projectId,
        sectionId: item.sectionId ?? undefined,
        stageId: item.stageId ?? undefined,
        code: item.code ?? undefined,
        boqCategoryItemId: item.boqCategoryItemId || undefined,
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        rate: item.rate,
      });
      results.itemsCreated++;
    }

    // 4. Update existing items
    for (const { id, changes } of itemUpdates) {
      await boqItemRepository.update(request.organizationId, id, changes);
      results.itemsUpdated++;
    }

    // 5. Delete items (before sections to avoid foreign key issues)
    for (const id of itemDeletes) {
      await boqItemRepository.delete(request.organizationId, id);
      results.itemsDeleted++;
    }

    // 6. Delete sections last
    for (const id of sectionDeletes) {
      // Move items from deleted section to unassigned
      await boqItemRepository.updateManyBySectionId(request.organizationId, projectId, id, {
        sectionId: null,
      });
      await boqSectionRepository.delete(request.organizationId, id);
      results.sectionsDeleted++;
    }

    return sendSuccess(reply, results);
  }
);

// ============================================
// BOQ Item Images
// ============================================

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Upload image for a BOQ item
 */
export const uploadBOQItemImage = handle(
  'create',
  async (request: FastifyRequest<{ Params: BOQItemParams }>, reply: FastifyReply) => {
    const { projectId, id: boqItemId } = request.params;

    // Verify BOQ item exists and belongs to organization
    const boqItem = await boqItemRepository.findById(request.organizationId, boqItemId);
    if (!boqItem || boqItem.projectId !== projectId) {
      return sendNotFound(reply, 'BOQ item');
    }

    // Get the uploaded file
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({
        success: false,
        error: { message: 'No file uploaded', code: 'NO_FILE' },
      });
    }

    // Read file into buffer
    const chunks: Buffer[] = [];
    for await (const chunk of data.file) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // Check file size
    if (fileBuffer.length > MAX_IMAGE_SIZE) {
      return reply.code(400).send({
        success: false,
        error: {
          message: `File size exceeds maximum allowed size of ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
          code: 'FILE_TOO_LARGE',
        },
      });
    }

    // Check MIME type
    const mimeType = data.mimetype;
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return reply.code(400).send({
        success: false,
        error: {
          message: `File type ${mimeType} is not allowed. Allowed types: JPEG, PNG, GIF, WebP`,
          code: 'INVALID_FILE_TYPE',
        },
      });
    }

    // Upload to storage
    const uploadResult = await storageService.uploadFile(
      fileBuffer,
      data.filename,
      mimeType,
      `${request.organizationId}/boq-images/${projectId}`
    );

    // Create attachment record
    const attachment = await prisma.attachment.create({
      data: {
        organizationId: request.organizationId,
        fileName: data.filename,
        fileUrl: uploadResult.publicUrl,
        storagePath: uploadResult.path,
        mimeType,
      },
    });

    // Link attachment to BOQ item
    await prisma.entityAttachment.create({
      data: {
        attachmentId: attachment.id,
        entityType: 'BOQ_ITEM',
        entityId: boqItemId,
      },
    });

    return sendSuccess(
      reply,
      {
        id: attachment.id,
        fileName: attachment.fileName,
        fileUrl: attachment.fileUrl,
        mimeType: attachment.mimeType,
        uploadedAt: attachment.uploadedAt.toISOString(),
      },
      201
    );
  }
);

/**
 * Get all images for a BOQ item
 */
export const getBOQItemImages = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: BOQItemParams }>, reply: FastifyReply) => {
    const { projectId, id: boqItemId } = request.params;

    // Verify BOQ item exists and belongs to organization
    const boqItem = await boqItemRepository.findById(request.organizationId, boqItemId);
    if (!boqItem || boqItem.projectId !== projectId) {
      return sendNotFound(reply, 'BOQ item');
    }

    // Get all attachments for this BOQ item
    const entityAttachments = await prisma.entityAttachment.findMany({
      where: {
        entityType: 'BOQ_ITEM',
        entityId: boqItemId,
      },
      include: {
        attachment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const images = entityAttachments.map((ea) => ({
      id: ea.attachment.id,
      fileName: ea.attachment.fileName,
      fileUrl: ea.attachment.fileUrl,
      mimeType: ea.attachment.mimeType,
      uploadedAt: ea.attachment.uploadedAt.toISOString(),
    }));

    return sendSuccess(reply, images);
  }
);

/**
 * Delete an image from a BOQ item
 */
export const deleteBOQItemImage = handle(
  'delete',
  async (request: FastifyRequest<{ Params: BOQItemImageParams }>, reply: FastifyReply) => {
    const { projectId, id: boqItemId, imageId } = request.params;

    // Verify BOQ item exists and belongs to organization
    const boqItem = await boqItemRepository.findById(request.organizationId, boqItemId);
    if (!boqItem || boqItem.projectId !== projectId) {
      return sendNotFound(reply, 'BOQ item');
    }

    // Find the attachment
    const attachment = await prisma.attachment.findFirst({
      where: {
        id: imageId,
        organizationId: request.organizationId,
      },
    });

    if (!attachment) {
      return sendNotFound(reply, 'Image');
    }

    // Verify it's linked to this BOQ item
    const entityAttachment = await prisma.entityAttachment.findFirst({
      where: {
        attachmentId: imageId,
        entityType: 'BOQ_ITEM',
        entityId: boqItemId,
      },
    });

    if (!entityAttachment) {
      return sendNotFound(reply, 'Image attachment');
    }

    // Delete from storage
    try {
      await storageService.deleteFile(attachment.storagePath);
    } catch (error) {
      console.error('Failed to delete image from storage:', error);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete entity attachment and attachment
    await prisma.entityAttachment.delete({
      where: { id: entityAttachment.id },
    });

    await prisma.attachment.delete({
      where: { id: imageId },
    });

    return sendNoContent(reply);
  }
);
