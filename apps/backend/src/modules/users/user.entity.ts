import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * A registered user.
 *
 * MVP note: entities intentionally use flat foreign-key columns
 * (`ownerId`, `projectId`, `assigneeId`) instead of TypeORM relation
 * properties, so the API shape matches @ai-workflow/shared-types
 * exactly. Referential integrity is enforced by the FK constraints in
 * the corresponding database migration, not by the ORM.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
