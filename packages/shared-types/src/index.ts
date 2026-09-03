/**
 * Shared types for ai-native-fullstack-workflow.
 *
 * These types are the contract between the Next.js frontend and the
 * NestJS backend. Both applications consume them from
 * `@ai-workflow/shared-types`; neither may redefine them locally.
 *
 * JSON serialization notes:
 * - Dates are represented as ISO 8601 strings (`string`), matching how
 *   they cross the REST API boundary.
 * - Optional fields are declared with `?` only when the API may omit
 *   them entirely.
 */

/** Lifecycle status of a task. */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

/** All valid task status values (list form, useful for UI iteration). */
export const TASK_STATUSES: readonly TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.DONE,
] as const;

/** A registered user of the system. */
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/** A project owned by a user. */
export interface Project {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

/** A task that belongs to a project and may be assigned to a user. */
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  projectId: number;
  assigneeId?: number;
  createdAt: string;
  updatedAt: string;
}

/** Health report returned by `GET /api/health`. */
export interface HealthReport {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  timestamp: string;
  database: 'connected' | 'unconfigured' | 'unreachable';
}

/** Standard pagination envelope for list endpoints. */
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
