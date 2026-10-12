// Setup file for the default (database-less) e2e run.
//
// Sets DATABASE_URL to an empty string BEFORE test modules import
// `src/config/load-env.ts`. dotenv never overrides already-set variables, so
// the value from .env is ignored and the application boots in
// skeleton mode (no persistence). This keeps the default e2e gate
// deterministic on any machine, with or without a database.
//
// Suites that need a real database use vitest.config.e2e-db.mts,
// which does not apply this setup file.
process.env.DATABASE_URL = '';
