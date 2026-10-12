import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { deleteUser } from '@/app/actions/users';
import ActionButton from '@/components/ActionButton';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';
import CreateUserForm from '@/components/forms/CreateUserForm';
import { apiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/labels';
import { parsePage } from '@/lib/search-params';
import type { SearchParamValue } from '@/lib/search-params';
import { cardClass } from '@/lib/ui';

export const metadata: Metadata = { title: 'Users' };
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

interface UsersPageProps {
  searchParams: Promise<{ page?: SearchParamValue }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps): Promise<ReactElement> {
  const page = parsePage((await searchParams).page);
  const users = await apiClient.users.list({ page, limit: PAGE_SIZE });

  return (
    <main className="flex flex-col gap-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <span className="text-sm text-slate-500">{users.total} total</span>
      </header>

      <CreateUserForm />

      {users.data.length === 0 ? (
        <EmptyState>No users yet. Create the first one above.</EmptyState>
      ) : (
        <div className={`${cardClass} overflow-x-auto p-0`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Joined</th>
                <th className="px-4 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.data.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2 font-medium">{user.name}</td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{user.email}</td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <ActionButton
                      action={deleteUser.bind(null, user.id)}
                      label="Delete"
                      ariaLabel={`Delete ${user.name}`}
                      confirmMessage={`Delete user "${user.name}"?`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination basePath="/users" page={page} totalPages={users.totalPages} />
    </main>
  );
}
