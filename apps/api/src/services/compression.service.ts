import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import AdmZip from 'adm-zip';
import { fileTypeFromBuffer } from 'file-type';

export interface CompressionResult {
  buffer: Buffer;
  originalSize: number;
  compressedSize: number;
  mimeType: string;
  compressionRatio: number;
}

export interface CompressionOptions {
  /** Maximum width/height for images (default: 2000) */
  maxImageDimension?: number;
  /** JPEG/WebP quality 1-100 (default: 80) */
  imageQuality?: number;
  /** Convert PNG to WebP for better compression (default: true) */
  convertPngToWebp?: boolean;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxImageDimension: 2000,
  imageQuality: 80,
  convertPngToWebp: true,
};

/**
 * Compression Service
 * Handles compression for images, PDFs, and Office documents
 */
export class CompressionService {
  private options: Required<CompressionOptions>;

  constructor(options: CompressionOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Main entry point - detects file type and compresses accordingly
   */
  async compress(buffer: Buffer, filename?: string): Promise<CompressionResult> {
    const originalSize = buffer.length;
    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType) {
      // If we can't detect, return original
      return {
        buffer,
        originalSize,
        compressedSize: originalSize,
        mimeType: 'application/octet-stream',
        compressionRatio: 1,
      };
    }

    const { mime } = fileType;

    // Route to appropriate compressor
    if (this.isImage(mime)) {
      return this.compressImage(buffer, mime);
    }

    if (mime === 'application/pdf') {
      return this.compressPDF(buffer);
    }

    if (this.isOfficeDocument(mime, filename)) {
      return this.compressOfficeDoc(buffer, mime);
    }

    // Unsupported type - return as-is
    return {
      buffer,
      originalSize,
      compressedSize: originalSize,
      mimeType: mime,
      compressionRatio: 1,
    };
  }

  /**
   * Compress images using Sharp
   * - Resize if larger than maxImageDimension
   * - Optimize quality
   * - Convert PNG to WebP if enabled
   */
  async compressImage(buffer: Buffer, mimeType: string): Promise<CompressionResult> {
    const originalSize = buffer.length;
    let sharpInstance = sharp(buffer);

    // Get image metadata
    const metadata = await sharpInstance.metadata();

    // Resize if needed
    const { width, height } = metadata;
    const maxDim = this.options.maxImageDimension;

    if (width && height && (width > maxDim || height > maxDim)) {
      sharpInstance = sharpInstance.resize(maxDim, maxDim, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    let outputBuffer: Buffer;
    let outputMimeType = mimeType;

    // Determine output format
    if (mimeType === 'image/png' && this.options.convertPngToWebp) {
      // Convert PNG to WebP for better compression
      outputBuffer = await sharpInstance.webp({ quality: this.options.imageQuality }).toBuffer();
      outputMimeType = 'image/webp';
    } else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      outputBuffer = await sharpInstance
        .jpeg({ quality: this.options.imageQuality, mozjpeg: true })
        .toBuffer();
    } else if (mimeType === 'image/webp') {
      outputBuffer = await sharpInstance.webp({ quality: this.options.imageQuality }).toBuffer();
    } else if (mimeType === 'image/png') {
      // PNG without WebP conversion
      outputBuffer = await sharpInstance
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer();
    } else {
      // For other formats (gif, etc.), try WebP
      outputBuffer = await sharpInstance.webp({ quality: this.options.imageQuality }).toBuffer();
      outputMimeType = 'image/webp';
    }

    // Only use compressed if it's actually smaller
    if (outputBuffer.length >= originalSize) {
      return {
        buffer,
        originalSize,
        compressedSize: originalSize,
        mimeType,
        compressionRatio: 1,
      };
    }

    return {
      buffer: outputBuffer,
      originalSize,
      compressedSize: outputBuffer.length,
      mimeType: outputMimeType,
      compressionRatio: originalSize / outputBuffer.length,
    };
  }

  /**
   * Compress PDF documents
   * - Remove metadata
   * - Optimize structure where possible
   */
  async compressPDF(buffer: Buffer): Promise<CompressionResult> {
    const originalSize = buffer.length;

    try {
      // Load the PDF
      const pdfDoc = await PDFDocument.load(buffer, {
        ignoreEncryption: true,
      });

      // Remove metadata for smaller size
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');

      // Save with object streams for better compression
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const compressedBuffer = Buffer.from(compressedBytes);

      // Only use compressed if it's smaller
      if (compressedBuffer.length >= originalSize) {
        return {
          buffer,
          originalSize,
          compressedSize: originalSize,
          mimeType: 'application/pdf',
          compressionRatio: 1,
        };
      }

      return {
        buffer: compressedBuffer,
        originalSize,
        compressedSize: compressedBuffer.length,
        mimeType: 'application/pdf',
        compressionRatio: originalSize / compressedBuffer.length,
      };
    } catch {
      // If PDF processing fails, return original
      return {
        buffer,
        originalSize,
        compressedSize: originalSize,
        mimeType: 'application/pdf',
        compressionRatio: 1,
      };
    }
  }

  /**
   * Compress Office documents (DOCX, XLSX, PPTX)
   * Office documents are ZIP archives - re-zip with max compression
   */
  async compressOfficeDoc(buffer: Buffer, mimeType: string): Promise<CompressionResult> {
    const originalSize = buffer.length;

    try {
      // Read the ZIP archive
      const zip = new AdmZip(buffer);

      // Create new ZIP with maximum compression
      const newZip = new AdmZip();

      zip.getEntries().forEach((entry) => {
        if (!entry.isDirectory) {
          newZip.addFile(entry.entryName, entry.getData(), entry.comment);
        }
      });

      // Get compressed buffer with maximum compression
      const compressedBuffer = newZip.toBuffer();

      // Only use compressed if it's smaller
      if (compressedBuffer.length >= originalSize) {
        return {
          buffer,
          originalSize,
          compressedSize: originalSize,
          mimeType,
          compressionRatio: 1,
        };
      }

      return {
        buffer: compressedBuffer,
        originalSize,
        compressedSize: compressedBuffer.length,
        mimeType,
        compressionRatio: originalSize / compressedBuffer.length,
      };
    } catch {
      // If processing fails, return original
      return {
        buffer,
        originalSize,
        compressedSize: originalSize,
        mimeType,
        compressionRatio: 1,
      };
    }
  }

  /**
   * Check if MIME type is an image
   */
  private isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Check if file is an Office document
   */
  private isOfficeDocument(mimeType: string, filename?: string): boolean {
    const officeMimeTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
      'application/vnd.ms-excel', // xls (older)
      'application/msword', // doc (older)
    ];

    if (officeMimeTypes.includes(mimeType)) {
      return true;
    }

    // Also check file extension as fallback
    if (filename) {
      const ext = filename.toLowerCase().split('.').pop();
      return ['docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt'].includes(ext || '');
    }

    return false;
  }
}

// Export singleton instance with default options
export const compressionService = new CompressionService();
