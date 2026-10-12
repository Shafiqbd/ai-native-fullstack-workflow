// Load .env before any module registration: DatabaseModule.register()
// and the feature-module list below read process.env.DATABASE_URL at
// import time (class decorator evaluation), which happens before
// ConfigModule would load the file.
import './config/load-env';
import 'reflect-metadata';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import configuration from './config/configuration';

/**
 * Feature modules require repositories, which only exist when a
 * database connection is registered. In skeleton mode (no
 * DATABASE_URL) the API exposes only /api/health; with a database the
 * full CRUD surface is mounted. The condition is synchronous because
 * `./config/load-env` above has already populated process.env.
 */
const FEATURE_MODULES =
  process.env.DATABASE_URL ? [UsersModule, ProjectsModule, TasksModule] : [];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule.register(),
    ...FEATURE_MODULES,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
