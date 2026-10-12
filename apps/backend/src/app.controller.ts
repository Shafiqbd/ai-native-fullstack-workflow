import { Controller, Get } from '@nestjs/common';
import type { HealthReport } from '@ai-workflow/shared-types';
import { AppService } from './app.service';

/**
 * Application-level endpoints. All routes live under the global
 * `api` prefix set in main.ts.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Liveness/readiness report. */
  @Get('health')
  getHealth(): HealthReport {
    return this.appService.getHealth();
  }
}
