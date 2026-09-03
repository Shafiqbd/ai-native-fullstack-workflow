import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Application entry point.
 *
 * Conventions enforced here for every route:
 * - Global `api` prefix (`/api/health`, `/api/users`, ...).
 * - DTO validation via ValidationPipe: unknown properties are
 *   stripped (`whitelist`) and rejected (`forbidNonWhitelisted`).
 * - Graceful shutdown hooks so TypeORM connections close cleanly.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  console.log(`API listening on http://localhost:${port}/api`);
}

void bootstrap();
