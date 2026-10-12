import { vi } from 'vitest';
import type { ObjectLiteral, Repository } from 'typeorm';

/**
 * Creates a TypeORM repository mock with vi.fn() stubs for the
 * methods our services use. Individual tests override return values
 * per case; `create` mirrors the real signature by returning its
 * input merged with nothing (services pass complete entities).
 */
export function mockRepository<T extends ObjectLiteral>(): Repository<T> {
  return {
    findAndCount: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn((entity: Partial<T>) => entity),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as Repository<T>;
}
