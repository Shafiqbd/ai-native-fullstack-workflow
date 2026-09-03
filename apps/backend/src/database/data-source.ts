// Load .env before building the DataSource so the TypeORM CLI
// (`typeorm-ts-node-esm`) sees DATABASE_URL without extra flags.
import 'dotenv/config';

import { DataSource } from 'typeorm';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and configure the database connection first.',
  );
}

/**
 * Standalone DataSource used by the TypeORM CLI for migrations.
 * Application runtime configuration lives in database.module.ts;
 * keep the two in sync (same entities/migrations globs).
 */
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/modules/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  migrationsRun: false,
  synchronize: false,
});
