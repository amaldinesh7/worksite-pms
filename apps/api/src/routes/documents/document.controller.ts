import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import { prisma } from '../../lib/prisma';
import { createErrorHandler } from '../../lib/error-handler';
import {
  sendSuccess,
  sendPaginated,
  sendNotFound,
  sendNoContent,
  buildPagination,
} from '../../lib/response.utils';
import { compressionService } from '../../services/compression.service';
import { storageService } from '../../services/storage.service';
import type { DocumentQuery, DocumentParams } from './document.schema';

// Create a resource-specific error handler
const handle = createErrorHandler('document');

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  // PDFs
  'application/pdf',
  // Office documents
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
  'application/msword', // doc
  'application/vnd.ms-excel', // xls
];

// Max file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// ============================================
// List Documents
// ============================================
export const listDocuments = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: DocumentQuery }>, reply: FastifyReply) => {
    const { page, limit, projectId } = request.query;
    const skip = (page - 1) * limit;

    const where = {
      organizationId: request.organizationId,
      ...(projectId && { projectId }),
    };

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { uploadedAt: 'desc' },
        include: {
          project: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    // Format response
    const documentsFormatted = documents.map((doc) => ({
      ...doc,
      uploadedAt: doc.uploadedAt.toISOString(),
    }));

    return sendPaginated(reply, documentsFormatted, buildPagination(page, limit, total));
  }
);

// ============================================
// Get Single Document
// ============================================
export const getDocument = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: DocumentParams }>, reply: FastifyReply) => {
    const document = await prisma.document.findFirst({
      where: {
        id: request.params.id,
        organizationId: request.organizationId,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    if (!document) {
      return sendNotFound(reply, 'Document');
    }

    return sendSuccess(reply, {
      ...document,
      uploadedAt: document.uploadedAt.toISOString(),
    });
  }
);

// ============================================
// Upload Document
// ============================================
export const uploadDocument = handle(
  'create',
  async (request: FastifyRequest<{ Querystring: { projectId: string } }>, reply: FastifyReply) => {
    const { projectId } = request.query;

    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: request.organizationId,
      },
    });

    if (!project) {
      return reply.code(400).send({
        success: false,
        error: {
          message: 'Project not found or does not belong to this organization',
          code: 'INVALID_PROJECT',
        },
      });
    }

    // Get the uploaded file
    const data = await request.file();

    if (!data) {
      return reply.code(400).send({
        success: false,
        error: {
          message: 'No file uploaded',
          code: 'NO_FILE',
        },
      });
    }

    // Read file into buffer
    const chunks: Buffer[] = [];
    for await (const chunk of data.file) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // Check file size
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return reply.code(400).send({
        success: false,
        error: {
          message: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          code: 'FILE_TOO_LARGE',
        },
      });
    }

    // Compress the file
    const compressionResult = await compressionService.compress(fileBuffer, data.filename);

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(compressionResult.mimeType)) {
      return reply.code(400).send({
        success: false,
        error: {
          message: `File type ${compressionResult.mimeType} is not allowed. Allowed types: images, PDFs, and Office documents.`,
          code: 'INVALID_FILE_TYPE',
        },
      });
    }

    // Determine file extension based on MIME type
    const extension =
      getExtensionFromMimeType(compressionResult.mimeType) ||
      data.filename.split('.').pop() ||
      'bin';

    // Generate new filename if mime type changed (e.g., PNG -> WebP)
    const originalExt = data.filename.split('.').pop()?.toLowerCase();
    const newFilename =
      originalExt !== extension
        ? data.filename.replace(/\.[^.]+$/, `.${extension}`)
        : data.filename;

    // Upload to storage
    const uploadResult = await storageService.uploadFile(
      compressionResult.buffer,
      newFilename,
      compressionResult.mimeType,
      `${request.organizationId}/${projectId}`
    );

    // Save to database
    const document = await prisma.document.create({
      data: {
        organizationId: request.organizationId,
        projectId,
        fileName: newFilename,
        fileType: extension,
        fileUrl: uploadResult.publicUrl,
        storagePath: uploadResult.path,
        mimeType: compressionResult.mimeType,
      },
    });

    return sendSuccess(
      reply,
      {
        ...document,
        uploadedAt: document.uploadedAt.toISOString(),
        compression: {
          originalSize: compressionResult.originalSize,
          compressedSize: compressionResult.compressedSize,
          savedBytes: compressionResult.originalSize - compressionResult.compressedSize,
          compressionRatio: compressionResult.compressionRatio,
        },
      },
      201
    );
  }
);

// ============================================
// Get Download URL
// ============================================
export const getDownloadUrl = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: DocumentParams }>, reply: FastifyReply) => {
    const document = await prisma.document.findFirst({
      where: {
        id: request.params.id,
        organizationId: request.organizationId,
      },
    });

    if (!document) {
      return sendNotFound(reply, 'Document');
    }

    // Generate signed URL valid for 1 hour
    const signedUrl = await storageService.getSignedUrl(document.storagePath, 3600);

    return sendSuccess(reply, {
      downloadUrl: signedUrl,
      expiresIn: 3600,
      fileName: document.fileName,
    });
  }
);

// ============================================
// Delete Document
// ============================================
export const deleteDocument = handle(
  'delete',
  async (request: FastifyRequest<{ Params: DocumentParams }>, reply: FastifyReply) => {
    const document = await prisma.document.findFirst({
      where: {
        id: request.params.id,
        organizationId: request.organizationId,
      },
    });

    if (!document) {
      return sendNotFound(reply, 'Document');
    }

    // Delete from storage
    await storageService.deleteFile(document.storagePath);

    // Delete from database
    await prisma.document.delete({
      where: { id: document.id },
    });

    return sendNoContent(reply);
  }
);

// ============================================
// Helper Functions
// ============================================
function getExtensionFromMimeType(mimeType: string): string | null {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/msword': 'doc',
    'application/vnd.ms-excel': 'xls',
  };
  return mimeToExt[mimeType] || null;
}
