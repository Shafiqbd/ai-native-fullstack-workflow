/** Raw Next.js search param value. */
export type SearchParamValue = string | string[] | undefined;

/** Positive page number from `?page=`, defaulting to 1 for anything invalid. */
export function parsePage(value: SearchParamValue): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

/** Positive integer id from a route param, or null when malformed. */
export function parseId(value: string): number | null {
  const id = Number(value);
  return /^\d+$/.test(value) && Number.isSafeInteger(id) && id >= 1 ? id : null;
}
