import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = moduleRef.get<AppController>(AppController);
  });

  describe('getHealth', () => {
    it('returns a health report with status ok', () => {
      const report = controller.getHealth();

      expect(report.status).toBe('ok');
      expect(report.service).toBe('ai-native-fullstack-workflow API');
    });

    it('reports an ISO timestamp', () => {
      const before = new Date().toISOString();
      const report = controller.getHealth();
      const after = new Date().toISOString();

      expect(report.timestamp >= before).toBe(true);
      expect(report.timestamp <= after).toBe(true);
    });

    it('reports the database as unconfigured when no DataSource is present', () => {
      const report = controller.getHealth();

      expect(report.database).toBe('unconfigured');
    });
  });
});
