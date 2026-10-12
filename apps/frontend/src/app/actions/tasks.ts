'use server';

import { revalidatePath } from 'next/cache';
import type { TaskStatus, UpdateTaskInput } from '@ai-workflow/shared-types';
import type { ActionState } from '@/lib/action-state';
import { apiClient } from '@/lib/api-client';
import { readOptionalId, readOptionalString, readString } from '@/lib/form-data';
import { runAction } from '@/lib/run-action';

/** Server actions for tasks (no auth in the MVP; see users.ts). */

function projectPath(projectId: number): string {
  return `/projects/${projectId}`;
}

export async function createTask(
  projectId: number,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await runAction(
    () =>
      apiClient.tasks.create({
        title: readString(formData, 'title'),
        description: readOptionalString(formData, 'description'),
        // Backend @IsEnum validation rejects anything else.
        status: readOptionalString(formData, 'status') as TaskStatus | undefined,
        projectId,
        assigneeId: readOptionalId(formData, 'assigneeId'),
      }),
    formData,
  );
  revalidatePath(projectPath(projectId));
  return result;
}

/**
 * Updates whichever of `status` / `assigneeId` the submitting form
 * carries, so one action serves every inline task editor.
 */
export async function updateTask(
  taskId: number,
  projectId: number,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const changes: UpdateTaskInput = {};
  if (formData.has('status')) {
    changes.status = readString(formData, 'status') as TaskStatus;
  }
  if (formData.has('assigneeId')) {
    changes.assigneeId = readOptionalId(formData, 'assigneeId');
  }
  const result = await runAction(() => apiClient.tasks.update(taskId, changes));
  revalidatePath(projectPath(projectId));
  return result;
}

export async function deleteTask(
  taskId: number,
  projectId: number,
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const result = await runAction(() => apiClient.tasks.remove(taskId));
  revalidatePath(projectPath(projectId));
  return result;
}
