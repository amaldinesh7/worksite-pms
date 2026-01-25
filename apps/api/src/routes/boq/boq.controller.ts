/**
 * BOQ Controller
 *
 * Handles BOQ (Bill of Quantities) API requests.
 */

import type { FastifyReply, FastifyRequest } from 'fastify';
import { PDFParse } from 'pdf-parse';
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
    const { page, limit, category, stageId, sectionId, search, sortBy, sortOrder } = request.query;
    const skip = (page - 1) * limit;

    const { items, total } = await boqItemRepository.findAll(request.organizationId, projectId, {
      skip,
      take: limit,
      category,
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
    const categories = Object.entries(grouped).map(([category, items]) => {
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
        category,
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
    const item = await boqItemRepository.create(request.organizationId, {
      projectId: request.params.projectId,
      ...request.body,
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
 * Parse uploaded file (Excel/CSV/PDF)
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

    // Check file type and parse accordingly
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

    // Handle PDF files
    if (isPdf) {
      // Check if OpenAI API key is configured
      if (!env.OPENAI_API_KEY) {
        return reply.code(400).send({
          success: false,
          error: {
            message:
              'PDF import requires OpenAI API configuration. Please contact your administrator or use Excel/CSV format instead.',
            code: 'PDF_NOT_CONFIGURED',
          },
        });
      }

      // Extract text from PDF using pdf-parse v2 API
      const pdfParser = new PDFParse({ data: buffer });
      const pdfData = await pdfParser.getText();
      const pdfText = pdfData.text;

      if (!pdfText || pdfText.trim().length === 0) {
        return reply.code(400).send({
          success: false,
          error: {
            message: 'Could not extract text from PDF. The file may be image-based or corrupted.',
            code: 'PDF_PARSE_ERROR',
          },
        });
      }

      // Parse with AI
      const result = await boqImportService.parsePDFWithAI(pdfText, env.OPENAI_API_KEY);

      return sendSuccess(reply, {
        fileName: file.filename,
        ...result,
      });
    }

    // Parse Excel/CSV file (now async with ExcelJS)
    const result = await boqImportService.parseExcelBuffer(buffer, file.filename);

    return sendSuccess(reply, {
      fileName: file.filename,
      ...result,
    });
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

    // Map items with section IDs
    const itemsToCreate = items.map((item) => ({
      projectId,
      sectionId: item.sectionName ? sectionMap.get(item.sectionName) : undefined,
      stageId: item.stageId,
      code: item.code,
      category: item.category,
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
