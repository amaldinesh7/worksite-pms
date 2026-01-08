import { Prisma } from '@prisma/client';

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function handlePrismaError(error: unknown): DatabaseError {
  // If it's already a DatabaseError, just pass it through
  if (error instanceof DatabaseError) {
    return error;
  }

  // Handle plain objects with code property (manual throws)
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case 'P2002':
        return new DatabaseError(
          'A record with this value already exists',
          'UNIQUE_CONSTRAINT_VIOLATION',
          409
        );
      case 'P2003':
        return new DatabaseError('Referenced record does not exist', 'FOREIGN_KEY_VIOLATION', 400);
      case 'P2025':
        return new DatabaseError('Record not found', 'NOT_FOUND', 404);
      case 'P2014':
        return new DatabaseError('Invalid relationship', 'INVALID_RELATION', 400);
    }
  }

  // Handle Prisma-specific errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return new DatabaseError(
          'A record with this value already exists',
          'UNIQUE_CONSTRAINT_VIOLATION',
          409
        );

      case 'P2003': // Foreign key constraint violation
        return new DatabaseError('Referenced record does not exist', 'FOREIGN_KEY_VIOLATION', 400);

      case 'P2025': // Record not found
        return new DatabaseError('Record not found', 'NOT_FOUND', 404);

      case 'P2014': // Invalid relation
        return new DatabaseError('Invalid relationship', 'INVALID_RELATION', 400);

      default:
        return new DatabaseError('Database operation failed', 'DATABASE_ERROR', 500);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new DatabaseError('Invalid data provided', 'VALIDATION_ERROR', 400);
  }

  // Generic error
  return new DatabaseError(
    error instanceof Error ? error.message : 'Unknown database error',
    'UNKNOWN_ERROR',
    500
  );
}

// Type guard to check if error is a DatabaseError
export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}
