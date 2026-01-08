import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface UploadResult {
  path: string;
  publicUrl: string;
}

export interface StorageConfig {
  url: string;
  serviceKey: string;
  bucket: string;
}

/**
 * Storage Service
 * Handles file uploads to Supabase Storage (or MinIO in local development)
 */
export class StorageService {
  private client: SupabaseClient;
  private bucket: string;

  constructor(config?: Partial<StorageConfig>) {
    const url = config?.url || process.env.SUPABASE_URL || 'http://localhost:9000';
    const serviceKey = config?.serviceKey || process.env.SUPABASE_SERVICE_KEY || 'minioadmin';
    this.bucket = config?.bucket || process.env.SUPABASE_STORAGE_BUCKET || 'documents';

    // For MinIO (local development), we use the S3 protocol directly
    // For Supabase (production), we use the Supabase client
    const isMinIO = url.includes('localhost:9000') || url.includes('minio');

    if (isMinIO) {
      // MinIO configuration - use Supabase client with custom endpoint
      this.client = createClient(url, serviceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } else {
      // Supabase configuration
      this.client = createClient(url, serviceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
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

    const { data, error } = await this.client.storage.from(this.bucket).upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
    });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = this.client.storage.from(this.bucket).getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(path: string): Promise<void> {
    const { error } = await this.client.storage.from(this.bucket).remove([path]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get a signed URL for temporary access
   */
  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Download a file from storage
   */
  async downloadFile(path: string): Promise<Buffer> {
    const { data, error } = await this.client.storage.from(this.bucket).download(path);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Check if a file exists
   */
  async fileExists(path: string): Promise<boolean> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop(),
      });

    if (error) {
      return false;
    }

    return data.length > 0;
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
