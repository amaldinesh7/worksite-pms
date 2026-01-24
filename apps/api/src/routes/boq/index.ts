/**
 * BOQ Routes
 *
 * API routes for BOQ (Bill of Quantities) management.
 */

import type { FastifyInstance } from 'fastify';
import {
  BOQListQuerySchema,
  ProjectParamsSchema,
  BOQItemParamsSchema,
  BOQSectionParamsSchema,
  CreateBOQItemSchema,
  UpdateBOQItemSchema,
  CreateBOQSectionSchema,
  UpdateBOQSectionSchema,
  ConfirmImportSchema,
  LinkExpenseSchema,
  UnlinkExpenseParamsSchema,
} from './boq.schema';
import {
  listBOQItems,
  getBOQByCategory,
  getBOQByStage,
  getBOQStats,
  getBOQItem,
  createBOQItem,
  updateBOQItem,
  deleteBOQItem,
  listBOQSections,
  createBOQSection,
  updateBOQSection,
  deleteBOQSection,
  parseFile,
  confirmImport,
  linkExpense,
  unlinkExpense,
} from './boq.controller';

export default async function boqRoutes(fastify: FastifyInstance) {
  // ============================================
  // BOQ Items
  // ============================================

  // List BOQ items
  fastify.get(
    '/projects/:projectId/boq',
    {
      schema: {
        params: ProjectParamsSchema,
        querystring: BOQListQuerySchema,
      },
    },
    listBOQItems
  );

  // Get BOQ items grouped by category
  fastify.get(
    '/projects/:projectId/boq/by-category',
    {
      schema: {
        params: ProjectParamsSchema,
      },
    },
    getBOQByCategory
  );

  // Get BOQ items grouped by stage
  fastify.get(
    '/projects/:projectId/boq/by-stage',
    {
      schema: {
        params: ProjectParamsSchema,
      },
    },
    getBOQByStage
  );

  // Get BOQ statistics
  fastify.get(
    '/projects/:projectId/boq/stats',
    {
      schema: {
        params: ProjectParamsSchema,
      },
    },
    getBOQStats
  );

  // Get single BOQ item
  fastify.get(
    '/projects/:projectId/boq/:id',
    {
      schema: {
        params: BOQItemParamsSchema,
      },
    },
    getBOQItem
  );

  // Create BOQ item
  fastify.post(
    '/projects/:projectId/boq',
    {
      schema: {
        params: ProjectParamsSchema,
        body: CreateBOQItemSchema,
      },
    },
    createBOQItem
  );

  // Update BOQ item
  fastify.put(
    '/projects/:projectId/boq/:id',
    {
      schema: {
        params: BOQItemParamsSchema,
        body: UpdateBOQItemSchema,
      },
    },
    updateBOQItem
  );

  // Delete BOQ item
  fastify.delete(
    '/projects/:projectId/boq/:id',
    {
      schema: {
        params: BOQItemParamsSchema,
      },
    },
    deleteBOQItem
  );

  // ============================================
  // BOQ Sections
  // ============================================

  // List BOQ sections
  fastify.get(
    '/projects/:projectId/boq-sections',
    {
      schema: {
        params: ProjectParamsSchema,
      },
    },
    listBOQSections
  );

  // Create BOQ section
  fastify.post(
    '/projects/:projectId/boq-sections',
    {
      schema: {
        params: ProjectParamsSchema,
        body: CreateBOQSectionSchema,
      },
    },
    createBOQSection
  );

  // Update BOQ section
  fastify.put(
    '/projects/:projectId/boq-sections/:sectionId',
    {
      schema: {
        params: BOQSectionParamsSchema,
        body: UpdateBOQSectionSchema,
      },
    },
    updateBOQSection
  );

  // Delete BOQ section
  fastify.delete(
    '/projects/:projectId/boq-sections/:sectionId',
    {
      schema: {
        params: BOQSectionParamsSchema,
      },
    },
    deleteBOQSection
  );

  // ============================================
  // Import
  // ============================================

  // Parse uploaded file
  fastify.post(
    '/projects/:projectId/boq/import/parse',
    {
      schema: {
        params: ProjectParamsSchema,
      },
    },
    parseFile
  );

  // Confirm and save imported items
  fastify.post(
    '/projects/:projectId/boq/import/confirm',
    {
      schema: {
        params: ProjectParamsSchema,
        body: ConfirmImportSchema,
      },
    },
    confirmImport
  );

  // ============================================
  // Expense Links
  // ============================================

  // Link expense to BOQ item
  fastify.post(
    '/projects/:projectId/boq/:id/link-expense',
    {
      schema: {
        params: BOQItemParamsSchema,
        body: LinkExpenseSchema,
      },
    },
    linkExpense
  );

  // Unlink expense from BOQ item
  fastify.delete(
    '/projects/:projectId/boq/:id/unlink-expense/:expenseId',
    {
      schema: {
        params: UnlinkExpenseParamsSchema,
      },
    },
    unlinkExpense
  );
}
