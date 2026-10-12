import type {
  CreateProjectInput,
  CreateTaskInput,
  CreateUserInput,
  HealthReport,
  Paginated,
  Project,
  Task,
  TaskStatus,
  UpdateProjectInput,
  UpdateTaskInput,
  UpdateUserInput,
  User,
} from '@ai-workflow/shared-types';

/**
 * Central API client for server components and server actions.
 *
 * API_BASE_URL is a server-side environment variable (no NEXT_PUBLIC_
 * prefix): these calls happen on the server, never in the browser.
 */

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001';

/** Largest page size the API accepts; used to fill select inputs. */
export const MAX_PAGE_SIZE = 100;

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

/** A non-2xx API response, carrying the NestJS error message. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Extracts a human-readable message from a NestJS error body
 * (`{ statusCode, message, error }`). Validation errors carry
 * `message` as an array of strings.
 */
export function errorMessageFromBody(status: number, body: unknown): string {
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const { message } = body as { message: unknown };
    if (Array.isArray(message)) {
      const parts = message.filter((part): part is string => typeof part === 'string');
      if (parts.length > 0) {
        return parts.join('; ');
      }
    }
    if (typeof message === 'string' && message !== '') {
      return message;
    }
  }
  return `Request failed with status ${status}`;
}

/** Builds `?a=1&b=2`, skipping undefined values. */
export function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query === '' ? '' : `?${query}`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...(init.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new ApiError(response.status, errorMessageFromBody(response.status, body));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

function send<T>(method: 'POST' | 'PATCH', path: string, body: object): Promise<T> {
  return request<T>(path, { method, body: JSON.stringify(body) });
}

function remove(path: string): Promise<void> {
  return request<void>(path, { method: 'DELETE' });
}

interface PageOptions {
  page?: number;
  limit?: number;
}

export const apiClient = {
  users: {
    list: (options: PageOptions = {}): Promise<Paginated<User>> =>
      request(`/users${toQueryString({ ...options })}`),
    get: (id: number): Promise<User> => request(`/users/${id}`),
    create: (input: CreateUserInput): Promise<User> => send('POST', '/users', input),
    update: (id: number, input: UpdateUserInput): Promise<User> =>
      send('PATCH', `/users/${id}`, input),
    remove: (id: number): Promise<void> => remove(`/users/${id}`),
  },
  projects: {
    list: (options: PageOptions & { ownerId?: number } = {}): Promise<Paginated<Project>> =>
      request(`/projects${toQueryString({ ...options })}`),
    get: (id: number): Promise<Project> => request(`/projects/${id}`),
    create: (input: CreateProjectInput): Promise<Project> => send('POST', '/projects', input),
    update: (id: number, input: UpdateProjectInput): Promise<Project> =>
      send('PATCH', `/projects/${id}`, input),
    remove: (id: number): Promise<void> => remove(`/projects/${id}`),
  },
  tasks: {
    list: (
      options: PageOptions & { projectId?: number; status?: TaskStatus; assigneeId?: number } = {},
    ): Promise<Paginated<Task>> => request(`/tasks${toQueryString({ ...options })}`),
    get: (id: number): Promise<Task> => request(`/tasks/${id}`),
    create: (input: CreateTaskInput): Promise<Task> => send('POST', '/tasks', input),
    update: (id: number, input: UpdateTaskInput): Promise<Task> =>
      send('PATCH', `/tasks/${id}`, input),
    remove: (id: number): Promise<void> => remove(`/tasks/${id}`),
  },
};

/**
 * Fetches the backend health report.
 *
 * Returns `null` on any failure (network error, non-2xx, invalid body)
 * instead of throwing: the status page renders a degraded state rather
 * than crashing the request.
 */
export async function getHealth(): Promise<HealthReport | null> {
  try {
    return await request<HealthReport>('/health');
  } catch {
    return null;
  }
}
