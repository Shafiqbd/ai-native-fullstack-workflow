import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITIES, MIGRATIONS } from './schema';

/**
 * Registers the PostgreSQL (TypeORM) connection.
 *
 * The database is optional at boot: when DATABASE_URL is not set the
 * module registers no connection and the API starts without
 * persistence (skeleton mode, used by CI and the default e2e gate).
 * When DATABASE_URL IS set but the server is unreachable, boot fails
 * fast (2 retries, 1s apart) with a clear error instead of hanging —
 * a misconfigured database must never look like a healthy API.
 *
 * AGENTS.md rules encoded here:
 * - `synchronize: false`  -> schema changes only via migrations.
 * - `migrationsRun: false` -> migrations run explicitly, never on boot.
 */
@Module({})
export class DatabaseModule {
  static register(): DynamicModule {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return { module: DatabaseModule };
    }

    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: databaseUrl,
          entities: ENTITIES,
          migrations: MIGRATIONS,
          migrationsRun: false,
          synchronize: false,
          retryAttempts: 2,
          retryDelay: 1_000,
          logging: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}
