import { describe, expect, it } from 'vitest';
import { readOptionalId, readOptionalString, readString, submittedValues } from './form-data';

function form(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    data.set(key, value);
  }
  return data;
}

describe('form-data helpers', () => {
  it('trims strings and defaults missing fields to empty', () => {
    const data = form({ name: '  Ada  ' });
    expect(readString(data, 'name')).toBe('Ada');
    expect(readString(data, 'missing')).toBe('');
  });

  it('treats blank optional strings as absent', () => {
    expect(readOptionalString(form({ description: '   ' }), 'description')).toBeUndefined();
    expect(readOptionalString(form({ description: 'Hi' }), 'description')).toBe('Hi');
  });

  it('parses ids and maps blank to null', () => {
    expect(readOptionalId(form({ assigneeId: '7' }), 'assigneeId')).toBe(7);
    expect(readOptionalId(form({ assigneeId: '' }), 'assigneeId')).toBeNull();
    expect(readOptionalId(form({ assigneeId: 'abc' }), 'assigneeId')).toBeNaN();
  });

  it('drops React internal fields from submitted values', () => {
    const data = form({ email: 'a@b.co', $ACTION_ID_abc: '' });
    expect(submittedValues(data)).toEqual({ email: 'a@b.co' });
  });
});
