import type { DynamicModule} from '@nestjs/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';

/**
 * Registers the PostgreSQL (TypeORM) connection.
 *
 * The database is optional at boot: when DATABASE_URL is not set the
 * module registers no connection and the API starts without
 * persistence. This keeps the skeleton phase and CI runs deterministic
 * without a database service. Phase 3 (entities) will turn the
 * database into a hard requirement.
 *
 * AGENTS.md rules encoded here:
 * - `synchronize: false`  -> schema changes only via migrations.
 * - `migrationsRun: false` -> migrations run explicitly, never on boot.
 */
@Module({})
export class DatabaseModule {
  static register(): DynamicModule {
    if (!process.env.DATABASE_URL) {
      return { module: DatabaseModule };
    }

    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: process.env.DATABASE_URL,
          entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
          migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
          migrationsRun: false,
          synchronize: false,
          logging: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}
