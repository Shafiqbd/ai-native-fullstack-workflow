import type { ActionState } from './action-state';
import { ApiError } from './api-client';
import { submittedValues } from './form-data';

/**
 * Runs an API mutation for a server action and converts expected
 * failures into form state instead of an error boundary:
 * - ApiError (400/404/409 ...) -> the backend's message.
 * - TypeError from fetch       -> the API is unreachable.
 * Anything else is a bug and is rethrown.
 */
export async function runAction(
  mutation: () => Promise<unknown>,
  formData?: FormData,
): Promise<ActionState> {
  try {
    await mutation();
    return { error: null };
  } catch (error: unknown) {
    const values = formData ? submittedValues(formData) : undefined;
    if (error instanceof ApiError) {
      return { error: error.message, values };
    }
    if (error instanceof TypeError) {
      return { error: 'The API is unreachable. Is the backend running?', values };
    }
    throw error;
  }
}
