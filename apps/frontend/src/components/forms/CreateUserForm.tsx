'use client';

import type { ReactElement } from 'react';
import { useActionState } from 'react';
import { createUser } from '@/app/actions/users';
import { INITIAL_ACTION_STATE } from '@/lib/action-state';
import { cardClass, inputClass, labelClass, primaryButtonClass } from '@/lib/ui';
import FormError from '../FormError';

/** Create-user form; keeps the input when the API rejects it (e.g. 409). */
export default function CreateUserForm(): ReactElement {
  const [state, formAction, pending] = useActionState(createUser, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className={`${cardClass} flex flex-col gap-3`}>
      <h2 className="font-semibold">New user</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Name
          <input
            name="name"
            required
            maxLength={120}
            defaultValue={state.values?.name}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Email
          <input
            name="email"
            type="email"
            required
            maxLength={255}
            defaultValue={state.values?.email}
            className={inputClass}
          />
        </label>
      </div>
      <FormError message={state.error} />
      <div>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? 'Creating…' : 'Create user'}
        </button>
      </div>
    </form>
  );
}
