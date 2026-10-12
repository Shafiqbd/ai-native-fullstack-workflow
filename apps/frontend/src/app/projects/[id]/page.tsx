import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { TASK_STATUSES } from '@ai-workflow/shared-types';
import type { Project } from '@ai-workflow/shared-types';
import { deleteProject } from '@/app/actions/projects';
import { deleteTask, updateTask } from '@/app/actions/tasks';
import ActionButton from '@/components/ActionButton';
import AutoSubmitSelect from '@/components/AutoSubmitSelect';
import type { SelectOption } from '@/components/AutoSubmitSelect';
import EmptyState from '@/components/EmptyState';
import CreateTaskForm from '@/components/forms/CreateTaskForm';
import { ApiError, apiClient, MAX_PAGE_SIZE } from '@/lib/api-client';
import { TASK_STATUS_LABELS } from '@/lib/labels';
import { parseId } from '@/lib/search-params';
import { cardClass, linkClass } from '@/lib/ui';

export const dynamic = 'force-dynamic';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

/** Loads the project, mapping malformed ids and API 404s to the not-found page. */
async function loadProject(rawId: string): Promise<Project> {
  const id = parseId(rawId);
  if (id === null) {
    notFound();
  }
  try {
    return await apiClient.projects.get(id);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await loadProject((await params).id);
  return { title: project.name };
}

const STATUS_OPTIONS: SelectOption[] = TASK_STATUSES.map((status) => ({
  value: status,
  label: TASK_STATUS_LABELS[status],
}));

export default async function ProjectPage({ params }: ProjectPageProps): Promise<ReactElement> {
  const project = await loadProject((await params).id);
  // ASSUMPTION: a project shows up to MAX_PAGE_SIZE tasks and the
  // assignee pickers list the first MAX_PAGE_SIZE users (MVP scale).
  const [tasks, users] = await Promise.all([
    apiClient.tasks.list({ projectId: project.id, limit: MAX_PAGE_SIZE }),
    apiClient.users.list({ limit: MAX_PAGE_SIZE }),
  ]);
  const owner = users.data.find((user) => user.id === project.ownerId);
  const assigneeOptions: SelectOption[] = [
    { value: '', label: 'Unassigned' },
    ...users.data.map((user) => ({ value: String(user.id), label: user.name })),
  ];

  return (
    <main className="flex flex-col gap-6">
      <nav className="text-sm">
        <Link href="/projects" className={linkClass}>
          ← All projects
        </Link>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-sm text-slate-500">
            Owned by {owner?.name ?? `User #${project.ownerId}`}
          </p>
          {project.description ? (
            <p className="max-w-2xl whitespace-pre-line text-slate-600 dark:text-slate-400">
              {project.description}
            </p>
          ) : null}
        </div>
        <ActionButton
          action={deleteProject.bind(null, project.id)}
          label="Delete project"
          confirmMessage={`Delete "${project.name}" and all of its tasks?`}
        />
      </header>

      <dl className="grid grid-cols-3 gap-3">
        {TASK_STATUSES.map((status) => (
          <div key={status} className={cardClass}>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {TASK_STATUS_LABELS[status]}
            </dt>
            <dd className="text-2xl font-semibold">
              {tasks.data.filter((task) => task.status === status).length}
            </dd>
          </div>
        ))}
      </dl>

      <CreateTaskForm projectId={project.id} users={users.data} />

      <section aria-labelledby="tasks-heading" className="flex flex-col gap-3">
        <h2 id="tasks-heading" className="text-lg font-semibold">
          Tasks
        </h2>
        {tasks.data.length === 0 ? (
          <EmptyState>No tasks yet. Add one above.</EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.data.map((task) => (
              <li
                key={task.id}
                className={`${cardClass} flex flex-wrap items-start justify-between gap-3`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-medium">{task.title}</span>
                  {task.description ? (
                    <span className="whitespace-pre-line text-sm text-slate-600 dark:text-slate-400">
                      {task.description}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-start gap-2">
                  <AutoSubmitSelect
                    action={updateTask.bind(null, task.id, project.id)}
                    name="status"
                    label={`Status of ${task.title}`}
                    options={STATUS_OPTIONS}
                    value={task.status}
                  />
                  <AutoSubmitSelect
                    action={updateTask.bind(null, task.id, project.id)}
                    name="assigneeId"
                    label={`Assignee of ${task.title}`}
                    options={assigneeOptions}
                    value={task.assigneeId == null ? '' : String(task.assigneeId)}
                  />
                  <ActionButton
                    action={deleteTask.bind(null, task.id, project.id)}
                    label="Delete"
                    ariaLabel={`Delete ${task.title}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
