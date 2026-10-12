import type { ReactElement, ReactNode } from 'react';

interface EmptyStateProps {
  children: ReactNode;
}

/** Placeholder shown when a list has no rows. */
export default function EmptyState({ children }: EmptyStateProps): ReactElement {
  return (
    <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
      {children}
    </p>
  );
}
