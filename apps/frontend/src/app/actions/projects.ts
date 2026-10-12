'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionState } from '@/lib/action-state';
import { apiClient } from '@/lib/api-client';
import { readOptionalId, readOptionalString, readString } from '@/lib/form-data';
import { runAction } from '@/lib/run-action';

/** Server actions for projects (no auth in the MVP; see users.ts). */

export async function createProject(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await runAction(
    () =>
      apiClient.projects.create({
        name: readString(formData, 'name'),
        description: readOptionalString(formData, 'description'),
        // A missing owner becomes NaN -> null and is rejected by the API.
        ownerId: readOptionalId(formData, 'ownerId') ?? Number.NaN,
      }),
    formData,
  );
  revalidatePath('/projects');
  return result;
}

export async function deleteProject(
  id: number,
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const result = await runAction(() => apiClient.projects.remove(id));
  if (result.error !== null) {
    return result;
  }
  revalidatePath('/projects');
  // Outside runAction: redirect() works by throwing.
  redirect('/projects');
}
