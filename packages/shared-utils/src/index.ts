/**
 * Pure utility functions shared between the frontend and backend.
 *
 * Rules for this package:
 * - No framework imports (no NestJS, no React, no TypeORM).
 * - No side effects, no I/O. Functions must be pure and deterministic.
 * - Every exported function ships with unit tests in the same commit.
 */

/**
 * Converts an arbitrary string into a URL-safe slug.
 *
 * Used for readable resource identifiers (e.g. project names in URLs).
 *
 * @param value - The raw string to slugify.
 * @returns A lowercase, hyphen-delimited slug. Empty string for input
 * that contains no alphanumeric characters.
 *
 * @example slugify('My First Project!') // 'my-first-project'
 */
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritics (U+0300-U+036F)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Checks whether a string is a syntactically valid email address.
 *
 * Intentionally pragmatic (not RFC 5322-exhaustive): it validates the
 * shape `local@domain.tld` which covers real-world addresses. The
 * backend additionally verifies reachability via confirmation emails.
 *
 * @param value - The string to validate.
 * @returns True when the value looks like a valid email address.
 */
export function isValidEmail(value: string): boolean {
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return EMAIL_PATTERN.test(value);
}
