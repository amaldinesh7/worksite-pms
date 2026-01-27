/**
 * BOQ Routes
 *
 * API routes for BOQ (Bill of Quantities) management.
 */

import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { organizationMiddleware } from '../../middleware/organization.middleware';
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
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Apply organization middleware to all routes
  app.addHook('preHandler', organizationMiddleware);

  // ============================================
  // BOQ Items
  // ============================================

  // List BOQ items
  app.get(
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
  app.get(
    '/projects/:projectId/boq/by-category',
    {
      schema: {
        params: ProjectParamsSchema,
      },
    },
    getBOQByCategory
  );

  // Get BOQ items grouped by stage
  app.get(
    '/projects/:projectId/boq/by-stage',
    {
      schema: {
        params: ProjectParamsSchema,
      },
    },
    getBOQByStage
  );

  // Get BOQ statistics
  app.get(
    '/projects/:projectId/boq/stats',
    {
      schema: {
        params: ProjectParamsSchema,
      },
    },
    getBOQStats
  );

  // Get single BOQ item
  app.get(
    '/projects/:projectId/boq/:id',
    {
      schema: {
        params: BOQItemParamsSchema,
      },
    },
    getBOQItem
  );

  // Create BOQ item
  app.post(
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
  app.put(
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
  app.delete(
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
  app.get(
    '/projects/:projectId/boq-sections',
    {
      schema: {
        params: ProjectParamsSchema,
      },
    },
    listBOQSections
  );

  // Create BOQ section
  app.post(
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
  app.put(
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
  app.delete(
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
  app.post(
    '/projects/:projectId/boq/import/parse',
    {
      schema: {
        params: ProjectParamsSchema,
      },
    },
    parseFile
  );

  // Confirm and save imported items
  app.post(
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
  app.post(
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
  app.delete(
    '/projects/:projectId/boq/:id/unlink-expense/:expenseId',
    {
      schema: {
        params: UnlinkExpenseParamsSchema,
      },
    },
    unlinkExpense
  );
}
