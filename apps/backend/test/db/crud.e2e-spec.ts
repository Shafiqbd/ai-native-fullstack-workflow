import type { INestApplication} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import dataSource from '../../src/database/data-source';
import { isDatabaseReachable } from '../support/db-reachable';

/**
 * Full CRUD flow against a real PostgreSQL database.
 *
 * Skips itself (with a visible message) when DATABASE_URL is unset or
 * the server is unreachable, so `yarn test:e2e:db` can run anywhere —
 * unless REQUIRE_DATABASE=true (CI), where that is a failure.
 * When reachable, migrations are applied first so the suite is
 * self-sufficient.
 */
describe('CRUD flow (e2e, database)', () => {
  let app: INestApplication<App>;
  // Hook contexts cannot skip in Vitest 4, so each test skips itself.
  let databaseAvailable = false;

  beforeAll(async () => {
    databaseAvailable = await isDatabaseReachable(process.env.DATABASE_URL);
    // CI sets REQUIRE_DATABASE so a missing database fails the gate
    // instead of silently skipping it.
    if (!databaseAvailable && process.env.REQUIRE_DATABASE === 'true') {
      throw new Error('REQUIRE_DATABASE is set but PostgreSQL is unreachable.');
    }
    if (!databaseAvailable) {
      console.warn(
        '  [crud.e2e] SKIPPED: DATABASE_URL is unset or PostgreSQL is unreachable.',
      );
      return;
    }

    // Bring the schema up to date (no-op when already applied).
    await dataSource.initialize();
    await dataSource.runMigrations();
    await dataSource.destroy();

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('runs the full user → project → task lifecycle', async (ctx) => {
    ctx.skip(!databaseAvailable);
    const server = app.getHttpServer();

    // -- Users -----------------------------------------------------
    const ownerEmail = `owner-${Date.now()}@example.com`;
    const assigneeEmail = `assignee-${Date.now()}@example.com`;

    const ownerRes = await request(server)
      .post('/api/users')
      .send({ email: ownerEmail, name: 'Grace Hopper' })
      .expect(201);
    const ownerId: number = ownerRes.body.id;

    const assigneeRes = await request(server)
      .post('/api/users')
      .send({ email: assigneeEmail, name: 'Alan Turing' })
      .expect(201);
    const assigneeId: number = assigneeRes.body.id;

    // Duplicate email -> 409
    await request(server)
      .post('/api/users')
      .send({ email: ownerEmail, name: 'Duplicate' })
      .expect(409);

    // -- Projects --------------------------------------------------
    const projectRes = await request(server)
      .post('/api/projects')
      .send({ name: 'E2E Lifecycle Project', ownerId })
      .expect(201);
    const projectId: number = projectRes.body.id;

    // Unknown owner -> 404
    await request(server)
      .post('/api/projects')
      .send({ name: 'Orphan', ownerId: 999_999 })
      .expect(404);

    // -- Tasks -----------------------------------------------------
    const taskRes = await request(server)
      .post('/api/tasks')
      .send({
        title: 'Implement feature',
        projectId,
        assigneeId,
        description: 'Created by the CRUD e2e suite',
      })
      .expect(201);
    const taskId: number = taskRes.body.id;
    expect(taskRes.body.status).toBe('TODO');

    // Status transitions
    await request(server)
      .patch(`/api/tasks/${taskId}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('IN_PROGRESS');
      });

    // Unassign with explicit null
    await request(server)
      .patch(`/api/tasks/${taskId}`)
      .send({ assigneeId: null })
      .expect(200)
      .expect((res) => {
        expect(res.body.assigneeId).toBeNull();
      });

    // Invalid status rejected
    await request(server)
      .patch(`/api/tasks/${taskId}`)
      .send({ status: 'NOT_A_STATUS' })
      .expect(400);

    // Filtering
    await request(server)
      .get(`/api/tasks?projectId=${projectId}&status=IN_PROGRESS`)
      .expect(200)
      .expect((res) => {
        expect(res.body.total).toBe(1);
        expect(res.body.data[0].id).toBe(taskId);
      });

    // Unknown project on task create -> 404
    await request(server)
      .post('/api/tasks')
      .send({ title: 'Orphan task', projectId: 999_999 })
      .expect(404);

    // Unknown property rejected (whitelist + forbidNonWhitelisted)
    await request(server)
      .post('/api/users')
      .send({ email: 'x@example.com', name: 'X', isAdmin: true })
      .expect(400);

    // -- Cleanup (delete project cascades its tasks) ----------------
    await request(server).delete(`/api/tasks/${taskId}`).expect(204);
    await request(server).delete(`/api/projects/${projectId}`).expect(204);
    await request(server).delete(`/api/users/${ownerId}`).expect(204);
    await request(server).delete(`/api/users/${assigneeId}`).expect(204);

    // Deleting a missing resource -> 404
    await request(server).get(`/api/tasks/${taskId}`).expect(404);
  });

  it('exposes a health report with a connected database', async (ctx) => {
    ctx.skip(!databaseAvailable);
    await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.database).toBe('connected');
      });
  });
});
