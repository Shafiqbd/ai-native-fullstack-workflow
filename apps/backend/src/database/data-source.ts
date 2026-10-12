// Load .env before building the DataSource so the TypeORM CLI
// (`typeorm-ts-node-commonjs`) sees DATABASE_URL without extra flags.
import '../config/load-env';

import { DataSource } from 'typeorm';
import { ENTITIES, MIGRATIONS } from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and configure the database connection first.',
  );
}

/**
 * Standalone DataSource used by the TypeORM CLI for migrations.
 * Application runtime configuration lives in database.module.ts; both
 * share the entity/migration registries in schema.ts.
 */
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ENTITIES,
  migrations: MIGRATIONS,
  migrationsRun: false,
  synchronize: false,
});
