import { describe, expect, it } from 'vitest';
import { parseId, parsePage } from './search-params';

describe('parsePage', () => {
  it('accepts positive integers', () => {
    expect(parsePage('3')).toBe(3);
    expect(parsePage(['2', '5'])).toBe(2);
  });

  it('defaults invalid input to page 1', () => {
    for (const value of [undefined, '', '0', '-1', '1.5', 'abc']) {
      expect(parsePage(value)).toBe(1);
    }
  });
});

describe('parseId', () => {
  it('accepts positive integer strings only', () => {
    expect(parseId('42')).toBe(42);
    for (const value of ['0', '-1', '1.5', '1e3', 'abc', '', '99999999999999999999']) {
      expect(parseId(value)).toBeNull();
    }
  });
});
