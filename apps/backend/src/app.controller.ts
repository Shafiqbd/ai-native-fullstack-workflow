import { Controller, Get } from '@nestjs/common';
import type { HealthReport } from '@ai-workflow/shared-types';
// Value import required: NestJS emits design:paramtypes metadata from
// constructor parameter types, and `import type` erases that metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
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
