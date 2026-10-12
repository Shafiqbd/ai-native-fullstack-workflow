/**
 * Result of a form server action, consumed with React's useActionState.
 * `values` echoes the submitted fields after a failure so the form can
 * show them again instead of clearing the user's input.
 */
export interface ActionState {
  error: string | null;
  values?: Record<string, string>;
}

export const INITIAL_ACTION_STATE: ActionState = { error: null };

/** Signature of a server action usable with useActionState. */
export type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;
