import { config } from 'dotenv';
import { resolve } from 'node:path';

/**
 * Populates process.env from .env files as a side effect of import.
 *
 * Must be imported before anything that reads process.env at module
 * evaluation time (DatabaseModule.register(), the TypeORM CLI
 * DataSource). Yarn workspace scripts run with apps/backend as cwd, so
 * plain `dotenv/config` would miss the repository-root .env that the
 * README documents. Lookup order (first value wins, already-set
 * variables are never overridden):
 *   1. apps/backend/.env (cwd)
 *   2. <repo root>/.env  (resolved from this file: src/config or dist/config)
 */
config({
  path: [resolve(process.cwd(), '.env'), resolve(__dirname, '../../../../.env')],
  quiet: true,
});

/**
 * DATABASE_URL is the single connection setting the application reads.
 * When it is absent but discrete DB_* variables are configured, derive
 * it from them. An explicitly empty DATABASE_URL (e.g. the no-db e2e
 * setup) is respected and never overridden.
 */
function databaseUrlFromParts(): string | undefined {
  const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;
  if (!DB_HOST || !DB_USERNAME || !DB_DATABASE) {
    return undefined;
  }
  const credentials =
    encodeURIComponent(DB_USERNAME) +
    (DB_PASSWORD ? `:${encodeURIComponent(DB_PASSWORD)}` : '');
  return `postgresql://${credentials}@${DB_HOST}:${DB_PORT ?? '5432'}/${encodeURIComponent(DB_DATABASE)}`;
}

if (process.env.DATABASE_URL === undefined) {
  const derived = databaseUrlFromParts();
  if (derived) {
    process.env.DATABASE_URL = derived;
  }
}
