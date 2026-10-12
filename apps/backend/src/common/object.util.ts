/**
 * Returns a copy of the object without `undefined` properties.
 *
 * Used before passing PATCH DTOs to TypeORM `update()`: an explicit
 * `undefined` must mean "not provided" (leave the column alone),
 * never "write NULL".
 */
export function stripUndefined<T extends object>(input: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      result[key as keyof T] = value as T[keyof T];
    }
  }
  return result;
}
