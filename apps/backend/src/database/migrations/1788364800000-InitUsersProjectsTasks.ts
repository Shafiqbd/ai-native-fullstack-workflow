import type {
  MigrationInterface,
  QueryRunner} from 'typeorm';
import {
  Table,
  TableIndex,
} from 'typeorm';

/**
 * Initial schema: users, projects, tasks.
 *
 * - users.email is unique.
 * - projects.owner_id  -> users.id (RESTRICT: cannot delete a user who
 *   still owns projects).
 * - tasks.project_id   -> projects.id (CASCADE: deleting a project
 *   removes its tasks).
 * - tasks.assignee_id  -> users.id (RESTRICT; nullable).
 * - tasks.status is varchar(20) validated at the application layer
 *   (TaskStatus enum); kept portable instead of a native PG enum.
 */
export class InitUsersProjectsTasks1788364800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'email', type: 'varchar', length: '255', isUnique: true },
          { name: 'name', type: 'varchar', length: '120' },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'projects',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', length: '120' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'owner_id', type: 'int' },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
        foreignKeys: [
          {
            columnNames: ['owner_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'status', type: 'varchar', length: '20', default: "'TODO'" },
          { name: 'project_id', type: 'int' },
          { name: 'assignee_id', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
        foreignKeys: [
          {
            columnNames: ['project_id'],
            referencedTableName: 'projects',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['assignee_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'tasks',
      new TableIndex({ name: 'IDX_tasks_project_id', columnNames: ['project_id'] }),
    );
    await queryRunner.createIndex(
      'tasks',
      new TableIndex({ name: 'IDX_tasks_status', columnNames: ['status'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Children first so foreign keys never block the rollback.
    await queryRunner.dropTable('tasks');
    await queryRunner.dropTable('projects');
    await queryRunner.dropTable('users');
  }
}
