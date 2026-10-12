import type { Paginated } from '@ai-workflow/shared-types';

/**
 * Wraps a result page in the standard pagination envelope defined by
 * `Paginated<T>` in @ai-workflow/shared-types.
 */
export function buildPaginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): Paginated<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
