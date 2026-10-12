import { describe, expect, it } from 'vitest';
import { errorMessageFromBody, toQueryString } from './api-client';

describe('errorMessageFromBody', () => {
  it('returns a NestJS string message', () => {
    expect(errorMessageFromBody(409, { statusCode: 409, message: 'Email taken' })).toBe(
      'Email taken',
    );
  });

  it('joins validation message arrays', () => {
    const body = { statusCode: 400, message: ['name should not be empty', 'email must be an email'] };
    expect(errorMessageFromBody(400, body)).toBe(
      'name should not be empty; email must be an email',
    );
  });

  it('falls back to the status for unexpected bodies', () => {
    expect(errorMessageFromBody(502, null)).toBe('Request failed with status 502');
    expect(errorMessageFromBody(500, { message: '' })).toBe('Request failed with status 500');
    expect(errorMessageFromBody(400, { message: [42] })).toBe('Request failed with status 400');
  });
});

describe('toQueryString', () => {
  it('skips undefined values', () => {
    expect(toQueryString({ page: 2, limit: undefined, status: 'DONE' })).toBe('?page=2&status=DONE');
  });

  it('returns an empty string when nothing is set', () => {
    expect(toQueryString({ page: undefined })).toBe('');
  });
});
