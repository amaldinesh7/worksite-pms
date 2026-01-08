# API Reference

> Last updated: 2026-01-09

---

## Base URL

- **Development**: `http://localhost:3000`

## Authentication

All API endpoints (except `/health` and `/api`) require organization context via headers:

| Header              | Required | Description                            |
| ------------------- | -------- | -------------------------------------- |
| `x-organization-id` | Yes      | Organization ID for multi-tenancy      |
| `x-user-id`         | Yes      | Current user ID                        |
| `x-user-role`       | Yes      | User role (ADMIN, MANAGER, ACCOUNTANT) |

---

## Endpoints Overview

| Resource      | Endpoints            | Description                     |
| ------------- | -------------------- | ------------------------------- |
| Health        | `/health`            | Health check                    |
| Organizations | `/api/organizations` | Organization management         |
| Users         | `/api/users`         | User management                 |
| Projects      | `/api/projects`      | Project management              |
| Categories    | `/api/categories`    | Category types and items        |
| Parties       | `/api/parties`       | Vendors, labour, subcontractors |
| Expenses      | `/api/expenses`      | Expense tracking                |
| Payments      | `/api/payments`      | Payment records                 |
| Stages        | `/api/stages`        | Project stages/phases           |
| Documents     | `/api/documents`     | File upload with compression    |

---

## Documents API (File Upload & Compression)

### Upload Document

```http
POST /api/documents?projectId={projectId}
Content-Type: multipart/form-data
```

**Request:**

- `file`: The file to upload (multipart form data)

**Supported File Types:**

- Images: JPEG, PNG, WebP, GIF
- Documents: PDF
- Office: DOCX, XLSX, PPTX, DOC, XLS

**Max File Size:** 50MB

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "fileName": "document.pdf",
    "fileType": "pdf",
    "fileUrl": "http://localhost:9000/documents/...",
    "storagePath": "org123/proj456/123-document.pdf",
    "mimeType": "application/pdf",
    "originalSize": 1024000,
    "compressedSize": 512000,
    "compressionRatio": 2,
    "uploadedAt": "2026-01-09T12:00:00.000Z"
  },
  "compression": {
    "originalSize": 1024000,
    "compressedSize": 512000,
    "savedBytes": 512000,
    "compressionRatio": 2
  }
}
```

### List Documents

```http
GET /api/documents?page=1&limit=10&projectId={projectId}
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 100) |
| `projectId` | string | - | Filter by project |

### Get Document

```http
GET /api/documents/:id
```

### Get Download URL

```http
GET /api/documents/:id/download
```

Returns a signed URL valid for 1 hour:

```json
{
  "success": true,
  "data": {
    "downloadUrl": "http://localhost:9000/documents/...?token=...",
    "expiresIn": 3600,
    "fileName": "document.pdf"
  }
}
```

### Delete Document

```http
DELETE /api/documents/:id
```

Returns `204 No Content` on success.

---

## Compression Details

| File Type      | Method                           | Expected Reduction |
| -------------- | -------------------------------- | ------------------ |
| JPEG           | Quality optimization (80%)       | 40-70%             |
| PNG            | Convert to WebP                  | 50-80%             |
| PDF            | Metadata removal, object streams | 10-30%             |
| DOCX/XLSX/PPTX | Re-zip with max compression      | 5-15%              |

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE"
  }
}
```

Common error codes:

- `VALIDATION_ERROR` - Invalid request data
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Missing or invalid auth
- `NO_FILE` - No file in upload request
- `FILE_TOO_LARGE` - File exceeds 50MB limit
- `INVALID_FILE_TYPE` - Unsupported file type
- `INVALID_PROJECT` - Project not found or unauthorized
