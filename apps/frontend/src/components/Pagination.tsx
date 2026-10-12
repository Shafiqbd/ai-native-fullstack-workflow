import Link from 'next/link';
import type { ReactElement } from 'react';
import { linkClass } from '@/lib/ui';

interface PaginationProps {
  basePath: string;
  page: number;
  totalPages: number;
}

/** Previous/next links driven by the `?page=` search param. */
export default function Pagination({
  basePath,
  page,
  totalPages,
}: PaginationProps): ReactElement | null {
  if (totalPages <= 1) {
    return null;
  }
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between text-sm">
      {page > 1 ? (
        <Link href={`${basePath}?page=${page - 1}`} className={linkClass}>
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-slate-500">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={`${basePath}?page=${page + 1}`} className={linkClass}>
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
