'use client';

import type { ReactElement } from 'react';
import { useActionState } from 'react';
import type { User } from '@ai-workflow/shared-types';
import { createProject } from '@/app/actions/projects';
import { INITIAL_ACTION_STATE } from '@/lib/action-state';
import { cardClass, inputClass, labelClass, primaryButtonClass } from '@/lib/ui';
import FormError from '../FormError';

interface CreateProjectFormProps {
  users: User[];
}

/** Create-project form; the owner is picked from existing users. */
export default function CreateProjectForm({ users }: CreateProjectFormProps): ReactElement {
  const [state, formAction, pending] = useActionState(createProject, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className={`${cardClass} flex flex-col gap-3`}>
      <h2 className="font-semibold">New project</h2>
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
          Owner
          <select
            name="ownerId"
            required
            defaultValue={state.values?.ownerId ?? ''}
            className={inputClass}
          >
            <option value="" disabled>
              Select a user…
            </option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className={labelClass}>
        <span>
          Description <span className="font-normal text-slate-500">(optional)</span>
        </span>
        <textarea
          name="description"
          rows={2}
          maxLength={2000}
          defaultValue={state.values?.description}
          className={inputClass}
        />
      </label>
      <FormError message={state.error} />
      <div>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? 'Creating…' : 'Create project'}
        </button>
      </div>
    </form>
  );
}
