import { Client } from 'pg';

/**
 * True when the configured PostgreSQL server accepts connections.
 *
 * Used by database-gated e2e suites to skip themselves (with a
 * visible message) instead of failing when no database is running.
 * `connectionTimeoutMillis` keeps the check fast and bounded.
 */
export async function isDatabaseReachable(
  databaseUrl: string | undefined,
): Promise<boolean> {
  if (!databaseUrl) {
    return false;
  }
  const client = new Client({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 3_000,
  });
  try {
    await client.connect();
    return true;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => undefined);
  }
}
