import Link from 'next/link';
import type { ReactElement } from 'react';
import { linkClass } from '@/lib/ui';

export default function NotFound(): ReactElement {
  return (
    <main className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold tracking-tight">Not found</h1>
      <p className="text-slate-600 dark:text-slate-400">
        The page or record you are looking for does not exist.
      </p>
      <Link href="/projects" className={linkClass}>
        Back to projects
      </Link>
    </main>
  );
}
