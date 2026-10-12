import { stripUndefined } from './object.util';

describe('stripUndefined', () => {
  it('removes undefined properties but keeps null, zero and empty string', () => {
    const input = {
      title: 'A',
      description: undefined,
      status: 'TODO',
      assigneeId: null,
      count: 0,
      label: '',
    };

    const result = stripUndefined(input);

    expect(result).toEqual({
      title: 'A',
      status: 'TODO',
      assigneeId: null,
      count: 0,
      label: '',
    });
  });

  it('does not mutate the input object', () => {
    const input = { a: 1, b: undefined };
    stripUndefined(input);
    expect('b' in input).toBe(true);
  });

  it('returns an empty object when everything is undefined', () => {
    expect(stripUndefined({ a: undefined, b: undefined })).toEqual({});
  });
});
