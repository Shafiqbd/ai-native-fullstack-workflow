import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { AppConfig } from './config/configuration';

/**
 * Application entry point.
 *
 * Conventions enforced here for every route:
 * - Global `api` prefix (`/api/health`, `/api/users`, ...).
 * - DTO validation via ValidationPipe: unknown properties are
 *   stripped (`whitelist`) and rejected (`forbidNonWhitelisted`).
 * - CORS restricted to the configured frontend origin so browser
 *   clients can call the API directly.
 * - Graceful shutdown hooks so TypeORM connections close cleanly.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const config = app.get<ConfigService<AppConfig>>(ConfigService);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: config.get('frontendUrl', 'http://localhost:3000') });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();

  const port = config.get('port', 3001);
  await app.listen(port);

  console.log(`API listening on http://localhost:${port}/api`);
}

void bootstrap();
