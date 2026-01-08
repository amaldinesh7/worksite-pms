# File Compression System

> Last updated: 2026-01-09

---

## Overview

The file compression system automatically optimizes uploaded documents to reduce storage costs and improve download speeds. Files are compressed during upload before being stored.

---

## Architecture

```
Upload Request
     │
     ▼
┌─────────────────┐
│ Fastify Route   │  POST /api/documents
│ (multipart)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Compression     │  Detect type → Compress
│ Service         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Storage         │  Upload to MinIO/Supabase
│ Service         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PostgreSQL      │  Save metadata
│ (Document)      │
└─────────────────┘
```

---

## Supported File Types

| Category          | MIME Types                                                                | Extension           |
| ----------------- | ------------------------------------------------------------------------- | ------------------- |
| **Images**        | image/jpeg, image/png, image/webp, image/gif                              | jpg, png, webp, gif |
| **PDF**           | application/pdf                                                           | pdf                 |
| **Word**          | application/vnd.openxmlformats-officedocument.wordprocessingml.document   | docx                |
| **Excel**         | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet         | xlsx                |
| **PowerPoint**    | application/vnd.openxmlformats-officedocument.presentationml.presentation | pptx                |
| **Legacy Office** | application/msword, application/vnd.ms-excel                              | doc, xls            |

---

## Compression Methods

### Images (Sharp)

**Library:** `sharp` - High-performance Node.js image processing

**Strategy:**

1. **Resize** - Images larger than 2000px are resized (maintaining aspect ratio)
2. **Quality optimization** - JPEG/WebP quality set to 80%
3. **Format conversion** - PNG automatically converted to WebP for smaller size

**Configuration:**

```typescript
const options = {
  maxImageDimension: 2000, // Max width/height
  imageQuality: 80, // 1-100
  convertPngToWebp: true, // PNG → WebP conversion
};
```

**Expected reduction:** 40-70%

---

### PDFs (pdf-lib)

**Library:** `pdf-lib` - Create and modify PDF documents

**Strategy:**

1. **Metadata removal** - Strip title, author, subject, keywords, producer, creator
2. **Object streams** - Enable for better internal compression

**Limitations:**

- Cannot re-compress embedded images
- Encrypted PDFs are returned as-is

**Expected reduction:** 10-30%

---

### Office Documents (adm-zip)

**Library:** `adm-zip` - ZIP archive manipulation

**Strategy:**

- Office documents (DOCX, XLSX, PPTX) are ZIP archives internally
- Re-zip with maximum compression level

**Expected reduction:** 5-15%

---

## API Usage

### Upload with Compression

```bash
curl -X POST "http://localhost:3000/api/documents?projectId=PROJECT_ID" \
  -H "x-organization-id: ORG_ID" \
  -H "x-user-id: USER_ID" \
  -H "x-user-role: ADMIN" \
  -F "file=@photo.jpg"
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "clx123abc",
    "fileName": "photo.webp",
    "fileType": "webp",
    "fileUrl": "http://localhost:9000/documents/org/proj/123-photo.webp",
    "storagePath": "org/proj/123-photo.webp",
    "mimeType": "image/webp",
    "originalSize": 2048000,
    "compressedSize": 614400,
    "compressionRatio": 3.33,
    "uploadedAt": "2026-01-09T12:00:00.000Z"
  },
  "compression": {
    "originalSize": 2048000,
    "compressedSize": 614400,
    "savedBytes": 1433600,
    "compressionRatio": 3.33
  }
}
```

---

## Service API

### CompressionService

```typescript
import { CompressionService, compressionService } from './services/compression.service';

// Use singleton
const result = await compressionService.compress(buffer, 'filename.jpg');

// Or create custom instance
const customService = new CompressionService({
  maxImageDimension: 1500,
  imageQuality: 70,
  convertPngToWebp: false,
});
```

### CompressionResult

```typescript
interface CompressionResult {
  buffer: Buffer; // Compressed file data
  originalSize: number; // Size before compression (bytes)
  compressedSize: number; // Size after compression (bytes)
  mimeType: string; // Output MIME type (may change for PNG→WebP)
  compressionRatio: number; // originalSize / compressedSize
}
```

---

## Storage Configuration

### Local Development (MinIO)

```env
SUPABASE_URL=http://localhost:9000
SUPABASE_SERVICE_KEY=minioadmin
SUPABASE_STORAGE_BUCKET=documents
```

Start MinIO:

```bash
docker-compose up -d storage storage-setup
```

Access console: http://localhost:9001

### Production (Supabase)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=documents
```

---

## Database Schema

```prisma
model Document {
  id             String   @id @default(cuid())
  organizationId String
  projectId      String
  fileName       String   // Display name (may be .webp if converted)
  fileType       String   // Extension
  fileUrl        String   // Public URL
  storagePath    String   // Path in bucket
  mimeType       String   // Detected MIME type
  originalSize   Int      // Bytes before compression
  compressedSize Int      // Bytes after compression
  uploadedAt     DateTime @default(now())
}
```

---

## Error Handling

| Error Code          | Description                       |
| ------------------- | --------------------------------- |
| `NO_FILE`           | No file in request                |
| `FILE_TOO_LARGE`    | File exceeds 50MB limit           |
| `INVALID_FILE_TYPE` | Unsupported MIME type             |
| `INVALID_PROJECT`   | Project not found or unauthorized |

---

## Performance Notes

1. **Compression is synchronous** - Large files may take a few seconds
2. **Memory usage** - Sharp uses native binaries for efficiency
3. **Skip if larger** - If compression results in larger file, original is kept
4. **File type detection** - Uses `file-type` library (magic bytes, not extension)

---

## Testing

```bash
cd apps/api
pnpm test -- documents.test.ts
```

Tests cover:

- Image compression
- Unknown file type handling
- Document CRUD operations
- Organization isolation
