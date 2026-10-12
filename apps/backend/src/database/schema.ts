import { User } from '../modules/users/user.entity';
import { Project } from '../modules/projects/project.entity';
import { Task } from '../modules/tasks/task.entity';
import { InitUsersProjectsTasks1788364800000 } from './migrations/1788364800000-InitUsersProjectsTasks';

/**
 * Explicit entity and migration registries.
 *
 * Classes are listed instead of file globs because TypeORM loads glob
 * matches with Node's native require(), which cannot parse decorated
 * TypeScript outside ts-node (e.g. under Vitest). Class references work
 * identically in the CLI, the test runner and the compiled dist build.
 *
 * Register every new entity and migration here.
 */
export const ENTITIES = [User, Project, Task];

export const MIGRATIONS = [InitUsersProjectsTasks1788364800000];
