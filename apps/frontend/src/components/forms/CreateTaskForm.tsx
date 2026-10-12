'use client';

import type { ReactElement } from 'react';
import { useActionState } from 'react';
import { TASK_STATUSES, TaskStatus } from '@ai-workflow/shared-types';
import type { User } from '@ai-workflow/shared-types';
import { createTask } from '@/app/actions/tasks';
import { INITIAL_ACTION_STATE } from '@/lib/action-state';
import { TASK_STATUS_LABELS } from '@/lib/labels';
import { cardClass, inputClass, labelClass, primaryButtonClass } from '@/lib/ui';
import FormError from '../FormError';

interface CreateTaskFormProps {
  projectId: number;
  users: User[];
}

/** Create-task form scoped to one project. */
export default function CreateTaskForm({ projectId, users }: CreateTaskFormProps): ReactElement {
  const [state, formAction, pending] = useActionState(
    createTask.bind(null, projectId),
    INITIAL_ACTION_STATE,
  );

  return (
    <form action={formAction} className={`${cardClass} flex flex-col gap-3`}>
      <h2 className="font-semibold">New task</h2>
      <label className={labelClass}>
        Title
        <input
          name="title"
          required
          maxLength={200}
          defaultValue={state.values?.title}
          className={inputClass}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Status
          <select
            name="status"
            defaultValue={state.values?.status ?? TaskStatus.TODO}
            className={inputClass}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Assignee
          <select
            name="assigneeId"
            defaultValue={state.values?.assigneeId ?? ''}
            className={inputClass}
          >
            <option value="">Unassigned</option>
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
          {pending ? 'Adding…' : 'Add task'}
        </button>
      </div>
    </form>
  );
}
