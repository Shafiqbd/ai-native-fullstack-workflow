'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { apiClient } from '@/lib/api-client';
import { readString } from '@/lib/form-data';
import { runAction } from '@/lib/run-action';

/**
 * Server actions for users. No authorization checks yet: the API has no
 * authentication in the MVP (see README Phase 3). Add them here once it
 * does, since server actions are publicly reachable endpoints.
 */

export async function createUser(_state: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(
    () =>
      apiClient.users.create({
        email: readString(formData, 'email'),
        name: readString(formData, 'name'),
      }),
    formData,
  );
  revalidatePath('/users');
  return result;
}

export async function deleteUser(
  id: number,
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const result = await runAction(() => apiClient.users.remove(id));
  revalidatePath('/users');
  return result;
}
