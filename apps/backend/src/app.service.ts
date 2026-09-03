import { Inject, Injectable, Optional } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import type { DataSource } from 'typeorm';
import type { HealthReport } from '@ai-workflow/shared-types';

const SERVICE_NAME = 'ai-native-fullstack-workflow API';
const SERVICE_VERSION = '0.1.0';

/**
 * Application-wide service. Currently owns the health report; feature
 * services (users, projects, tasks) arrive in Phase 3.
 */
@Injectable()
export class AppService {
  // Optional: when DatabaseModule registered no connection (no
  // DATABASE_URL), the DataSource token does not exist and injection
  // resolves to undefined instead of failing startup.
  constructor(
    @Optional()
    @Inject(getDataSourceToken())
    private readonly dataSource?: DataSource,
  ) {}

  /**
   * Builds the health report consumed by `GET /api/health` and the
   * frontend status page.
   */
  getHealth(): HealthReport {
    const database = this.resolveDatabaseState();
    return {
      status: 'ok',
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      timestamp: new Date().toISOString(),
      database,
    };
  }

  private resolveDatabaseState(): HealthReport['database'] {
    if (!this.dataSource) {
      return 'unconfigured';
    }
    return this.dataSource.isInitialized ? 'connected' : 'unreachable';
  }
}
