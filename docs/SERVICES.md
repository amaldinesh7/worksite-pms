# External Services

> Last updated: 2026-01-09

---

## PostgreSQL

- **Purpose**: Primary database for persistent data storage
- **Status**: `active`
- **Port**: 5432 (mapped to 5433 locally)
- **Docs**: https://www.postgresql.org/docs/

**Connection:**

```
DATABASE_URL=postgresql://myuser:mypassword@localhost:5433/worksite
```

---

## MinIO (S3-Compatible Storage)

- **Purpose**: File storage for documents (local development)
- **Status**: `active`
- **S3 API Port**: 9000
- **Console Port**: 9001
- **Docs**: https://min.io/docs/minio/linux/index.html

**Configuration:**

```env
SUPABASE_URL=http://localhost:9000
SUPABASE_SERVICE_KEY=minioadmin
SUPABASE_STORAGE_BUCKET=documents
```

**Web Console:** http://localhost:9001

- Username: `minioadmin`
- Password: `minioadmin`

**Production:** Replace with Supabase Storage or AWS S3.

---

## Internal Services

### Compression Service

**Location:** `apps/api/src/services/compression.service.ts`

Handles file compression during upload:

| File Type | Library   | Method                                 |
| --------- | --------- | -------------------------------------- |
| Images    | `sharp`   | Resize, quality optimization, PNG→WebP |
| PDF       | `pdf-lib` | Metadata removal, object streams       |
| Office    | `adm-zip` | Re-zip with max compression            |

**Usage:**

```typescript
import { compressionService } from './services/compression.service';

const result = await compressionService.compress(buffer, 'filename.jpg');
// result: { buffer, originalSize, compressedSize, mimeType, compressionRatio }
```

**Options:**

```typescript
const service = new CompressionService({
  maxImageDimension: 2000, // Resize images larger than this
  imageQuality: 80, // JPEG/WebP quality (1-100)
  convertPngToWebp: true, // Convert PNG to WebP for smaller size
});
```

---

### Storage Service

**Location:** `apps/api/src/services/storage.service.ts`

Handles file uploads to S3-compatible storage:

**Methods:**

```typescript
import { storageService } from './services/storage.service';

// Upload file
const { path, publicUrl } = await storageService.uploadFile(
  buffer,
  'filename.jpg',
  'image/jpeg',
  'folder/subfolder'
);

// Get signed download URL (1 hour expiry)
const url = await storageService.getSignedUrl(path, 3600);

// Delete file
await storageService.deleteFile(path);

// Download file
const buffer = await storageService.downloadFile(path);
```

---

## Docker Services

Start all services:

```bash
docker-compose up -d
```

| Service       | Image              | Ports      | Purpose                |
| ------------- | ------------------ | ---------- | ---------------------- |
| postgres      | postgres:16-alpine | 5433:5432  | Database               |
| storage       | minio/minio:latest | 9000, 9001 | File storage           |
| storage-setup | minio/mc:latest    | -          | Creates default bucket |

---

## Production Recommendations

| Service      | Development       | Production                    |
| ------------ | ----------------- | ----------------------------- |
| Database     | Docker PostgreSQL | Supabase / AWS RDS / Neon     |
| Storage      | MinIO (Docker)    | Supabase Storage / AWS S3     |
| File Uploads | Local processing  | Consider CDN + edge functions |
