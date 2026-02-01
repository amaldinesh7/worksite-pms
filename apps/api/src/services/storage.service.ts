/**
 * Storage Service
 *
 * Handles file uploads to S3-compatible storage (MinIO local, AWS S3/R2/Spaces in production)
 * Uses AWS S3 SDK which works with any S3-compatible storage provider.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface UploadResult {
  path: string;
  publicUrl: string;
}

export interface StorageConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl?: string; // Optional custom public URL (for CDN, etc.)
}

/**
 * Storage Service
 * Works with any S3-compatible storage: MinIO, AWS S3, DigitalOcean Spaces, Cloudflare R2, etc.
 */
export class StorageService {
  private client: S3Client;
  private bucket: string;
  private publicBaseUrl: string;

  constructor(config?: Partial<StorageConfig>) {
    // Default to MinIO local development settings
    const endpoint = config?.endpoint || process.env.S3_ENDPOINT || 'http://localhost:9000';
    const region = config?.region || process.env.S3_REGION || 'us-east-1';
    const accessKeyId = config?.accessKeyId || process.env.S3_ACCESS_KEY_ID || 'minioadmin';
    const secretAccessKey =
      config?.secretAccessKey || process.env.S3_SECRET_ACCESS_KEY || 'minioadmin';
    this.bucket = config?.bucket || process.env.S3_BUCKET || 'documents';

    // Public URL for direct file access (bucket should have public read policy)
    this.publicBaseUrl =
      config?.publicUrl || process.env.S3_PUBLIC_URL || `${endpoint}/${this.bucket}`;

    this.client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for MinIO and most S3-compatible services
    });

    console.log(`[Storage] Initialized with endpoint: ${endpoint}, bucket: ${this.bucket}`);
  }

  /**
   * Upload a file to storage
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder?: string
  ): Promise<UploadResult> {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFilename = this.sanitizeFilename(filename);
    const path = folder
      ? `${folder}/${timestamp}-${sanitizedFilename}`
      : `${timestamp}-${sanitizedFilename}`;

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: path,
          Body: buffer,
          ContentType: mimeType,
        })
      );

      const publicUrl = `${this.publicBaseUrl}/${path}`;

      console.log(`[Storage] Uploaded file: ${path}`);

      return {
        path,
        publicUrl,
      };
    } catch (error) {
      console.error('[Storage] Upload failed:', error);
      throw new Error(`Failed to upload file: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(path: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: path,
        })
      );
      console.log(`[Storage] Deleted file: ${path}`);
    } catch (error) {
      console.error('[Storage] Delete failed:', error);
      throw new Error(`Failed to delete file: ${(error as Error).message}`);
    }
  }

  /**
   * Get a signed URL for temporary access (useful for private buckets)
   */
  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });
      return url;
    } catch (error) {
      console.error('[Storage] Signed URL generation failed:', error);
      throw new Error(`Failed to create signed URL: ${(error as Error).message}`);
    }
  }

  /**
   * Download a file from storage
   */
  async downloadFile(path: string): Promise<Buffer> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: path,
        })
      );

      if (!response.Body) {
        throw new Error('No body in response');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('[Storage] Download failed:', error);
      throw new Error(`Failed to download file: ${(error as Error).message}`);
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: path,
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(path: string): string {
    return `${this.publicBaseUrl}/${path}`;
  }

  /**
   * Sanitize filename for storage
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }
}

// Export singleton instance
export const storageService = new StorageService();
