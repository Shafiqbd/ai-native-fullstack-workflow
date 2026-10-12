'use client';

import type { MouseEvent, ReactElement } from 'react';
import { useActionState } from 'react';
import { INITIAL_ACTION_STATE } from '@/lib/action-state';
import type { FormAction } from '@/lib/action-state';
import { dangerButtonClass } from '@/lib/ui';
import FormError from './FormError';

interface ActionButtonProps {
  action: FormAction;
  label: string;
  /** Accessible name when the visible label is ambiguous in a list. */
  ariaLabel?: string;
  /** When set, the user must confirm before the action runs. */
  confirmMessage?: string;
}

/**
 * A one-button form for destructive actions (delete). Shows the API
 * error inline, e.g. 409 when a user still owns projects.
 */
export default function ActionButton({
  action,
  label,
  ariaLabel,
  confirmMessage,
}: ActionButtonProps): ReactElement {
  const [state, formAction, pending] = useActionState(action, INITIAL_ACTION_STATE);

  function confirmFirst(event: MouseEvent<HTMLButtonElement>): void {
    if (confirmMessage !== undefined && !window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <button
        type="submit"
        disabled={pending}
        aria-label={ariaLabel}
        onClick={confirmFirst}
        className={dangerButtonClass}
      >
        {pending ? 'Working…' : label}
      </button>
      <FormError message={state.error} />
    </form>
  );
}
