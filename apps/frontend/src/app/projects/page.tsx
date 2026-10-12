import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';
import CreateProjectForm from '@/components/forms/CreateProjectForm';
import { apiClient, MAX_PAGE_SIZE } from '@/lib/api-client';
import { formatDate } from '@/lib/labels';
import { parsePage } from '@/lib/search-params';
import type { SearchParamValue } from '@/lib/search-params';
import { cardClass, linkClass } from '@/lib/ui';

export const metadata: Metadata = { title: 'Projects' };
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

interface ProjectsPageProps {
  searchParams: Promise<{ page?: SearchParamValue }>;
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps): Promise<ReactElement> {
  const page = parsePage((await searchParams).page);
  // ASSUMPTION: the owner picker lists the first MAX_PAGE_SIZE users;
  // a searchable picker is needed once there are more.
  const [projects, users] = await Promise.all([
    apiClient.projects.list({ page, limit: PAGE_SIZE }),
    apiClient.users.list({ limit: MAX_PAGE_SIZE }),
  ]);
  const ownerNames = new Map(users.data.map((user) => [user.id, user.name]));

  return (
    <main className="flex flex-col gap-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <span className="text-sm text-slate-500">{projects.total} total</span>
      </header>

      {users.total === 0 ? (
        <EmptyState>
          Projects need an owner.{' '}
          <Link href="/users" className={linkClass}>
            Create a user
          </Link>{' '}
          first.
        </EmptyState>
      ) : (
        <CreateProjectForm users={users.data} />
      )}

      {projects.data.length === 0 ? (
        <EmptyState>No projects yet.</EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {projects.data.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className={`${cardClass} flex h-full flex-col gap-1 transition hover:border-slate-400 dark:hover:border-slate-600`}
              >
                <span className="font-semibold">{project.name}</span>
                {project.description ? (
                  <span className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                    {project.description}
                  </span>
                ) : null}
                <span className="mt-auto pt-2 text-xs text-slate-500">
                  {ownerNames.get(project.ownerId) ?? `User #${project.ownerId}`} ·{' '}
                  {formatDate(project.createdAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Pagination basePath="/projects" page={page} totalPages={projects.totalPages} />
    </main>
  );
}
