import { QueryFailedError } from 'typeorm';

const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';

/**
 * Extracts the PostgreSQL error code from a failed query, if present.
 * TypeORM wraps driver errors, so the code lives on `driverError`.
 */
function pgErrorCode(error: unknown): string | undefined {
  if (error instanceof QueryFailedError) {
    const driverError = error.driverError as { code?: string } | undefined;
    return driverError?.code;
  }
  return undefined;
}

/** True when a query failed with a unique-constraint violation. */
export function isUniqueViolation(error: unknown): boolean {
  return pgErrorCode(error) === PG_UNIQUE_VIOLATION;
}

/** True when a query failed because a foreign-key constraint blocked it. */
export function isForeignKeyViolation(error: unknown): boolean {
  return pgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION;
}
