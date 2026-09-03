import { isValidEmail, slugify } from './index';

describe('slugify', () => {
  it('converts a title into a lowercase hyphenated slug', () => {
    expect(slugify('My First Project')).toBe('my-first-project');
  });

  it('strips punctuation and collapses separators', () => {
    expect(slugify('  Hello,   World!  ')).toBe('hello-world');
  });

  it('strips diacritics', () => {
    expect(slugify('Café Müller')).toBe('cafe-muller');
  });

  it('returns an empty string when there is nothing alphanumeric', () => {
    expect(slugify('---')).toBe('');
    expect(slugify('')).toBe('');
  });
});

describe('isValidEmail', () => {
  it('accepts standard email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('first.last@sub.domain.org')).toBe(true);
  });

  it('rejects strings without a domain', () => {
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user@example')).toBe(false);
  });

  it('rejects strings with whitespace or missing local part', () => {
    expect(isValidEmail('user name@example.com')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});
