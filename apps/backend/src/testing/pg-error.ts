import { QueryFailedError } from 'typeorm';

/**
 * Builds a QueryFailedError carrying a PostgreSQL driver error code,
 * used to exercise the unique/FK violation mappings in services
 * without a real database.
 */
export function pgQueryFailedError(code: string): QueryFailedError {
  const driverError = Object.assign(new Error(`pg error ${code}`), { code });
  return new QueryFailedError('mock query', [], driverError);
}
