'use client';

import type { ReactElement } from 'react';
import { useActionState } from 'react';
import { INITIAL_ACTION_STATE } from '@/lib/action-state';
import type { FormAction } from '@/lib/action-state';
import FormError from './FormError';

export interface SelectOption {
  value: string;
  label: string;
}

interface AutoSubmitSelectProps {
  action: FormAction;
  name: string;
  label: string;
  options: SelectOption[];
  value: string;
}

/**
 * Inline editor: a select that saves as soon as it changes. Keyed on
 * the server value so it re-syncs after revalidation (or snaps back
 * when the update fails).
 */
export default function AutoSubmitSelect({
  action,
  name,
  label,
  options,
  value,
}: AutoSubmitSelectProps): ReactElement {
  const [state, formAction, pending] = useActionState(action, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <select
        key={value}
        name={name}
        aria-label={label}
        defaultValue={value}
        aria-busy={pending}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm aria-busy:opacity-60 dark:border-slate-700 dark:bg-slate-950"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FormError message={state.error} />
    </form>
  );
}
