import { describe, expect, it } from 'vitest';
import { ApiError } from './api-client';
import { runAction } from './run-action';

describe('runAction', () => {
  it('returns no error when the mutation succeeds', async () => {
    await expect(runAction(async () => undefined)).resolves.toEqual({ error: null });
  });

  it('maps ApiError to its message and echoes submitted values', async () => {
    const data = new FormData();
    data.set('email', 'dupe@example.com');

    const state = await runAction(async () => {
      throw new ApiError(409, 'Email "dupe@example.com" is already registered');
    }, data);

    expect(state).toEqual({
      error: 'Email "dupe@example.com" is already registered',
      values: { email: 'dupe@example.com' },
    });
  });

  it('reports network failures as an unreachable API', async () => {
    const state = await runAction(async () => {
      throw new TypeError('fetch failed');
    });
    expect(state.error).toMatch(/unreachable/);
  });

  it('rethrows unexpected errors', async () => {
    await expect(
      runAction(async () => {
        throw new Error('bug');
      }),
    ).rejects.toThrow('bug');
  });
});
