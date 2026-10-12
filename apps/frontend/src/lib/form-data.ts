/**
 * Helpers for reading HTML form submissions in server actions.
 *
 * Values are only normalized here (trimmed, empty -> absent, numeric
 * ids parsed); real validation stays in the backend DTOs so the rules
 * live in exactly one place.
 */

/** Trimmed string value, or '' when the field is missing. */
export function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

/** Trimmed string value, or undefined when missing or blank. */
export function readOptionalString(formData: FormData, name: string): string | undefined {
  const value = readString(formData, name);
  return value === '' ? undefined : value;
}

/**
 * Integer id, or null when the field is blank (e.g. an "Unassigned"
 * option). Non-numeric input yields NaN, which serializes to JSON null
 * and is rejected by the backend validation with a clear message.
 */
export function readOptionalId(formData: FormData, name: string): number | null {
  const value = readString(formData, name);
  return value === '' ? null : Number(value);
}

/**
 * String entries of a submission, minus React's internal `$ACTION_*`
 * fields. Returned on failed actions so forms can restore what the user
 * typed after React resets them.
 */
export function submittedValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && !key.startsWith('$ACTION')) {
      values[key] = value;
    }
  }
  return values;
}
