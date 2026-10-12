'use client';

import type { ReactElement } from 'react';
import { primaryButtonClass } from '@/lib/ui';

interface ErrorPageProps {
  error: Error & { digest?: string };
  retry: () => void;
}

/**
 * Route error boundary. Most failures here mean the API is down or runs
 * without a database (CRUD routes are only mounted with DATABASE_URL).
 * In production the message is replaced by a generic one; the digest
 * matches the server log entry.
 */
export default function ErrorPage({ error, retry }: ErrorPageProps): ReactElement {
  return (
    <main className="flex flex-col items-start gap-4 rounded-lg border border-rose-200 bg-rose-50 p-6 dark:border-rose-900 dark:bg-rose-950">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-slate-700 dark:text-slate-300">
        The data could not be loaded. Check that the API is running (
        <code>yarn dev:backend</code>) and that a database is configured.
      </p>
      <p className="text-xs text-slate-500">
        {error.message}
        {error.digest ? ` (ref: ${error.digest})` : null}
      </p>
      <button type="button" onClick={() => retry()} className={primaryButtonClass}>
        Try again
      </button>
    </main>
  );
}
