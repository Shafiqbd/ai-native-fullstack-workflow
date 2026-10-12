import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskStatus } from '@ai-workflow/shared-types';

/**
 * A task inside a project, assignable to a user. Status is stored as
 * varchar (validated by DTOs with @IsEnum) rather than a native
 * Postgres enum, keeping migrations portable and additive.
 */
@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 20, enum: TaskStatus, default: TaskStatus.TODO })
  status!: TaskStatus;

  @Column({ type: 'int', name: 'project_id' })
  projectId!: number;

  @Column({ type: 'int', name: 'assignee_id', nullable: true })
  assigneeId!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
