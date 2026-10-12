import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AI-Native Fullstack Workflow',
    template: '%s | AI-Native Fullstack Workflow',
  },
  description:
    'An AI-native software engineering workflow: GitHub issues to production-ready code through planning, coding, verification, review and CI quality gates.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactElement {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 dark:border-slate-800">
          <nav
            aria-label="Main"
            className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3 text-sm"
          >
            <Link href="/" className="font-semibold">
              AI-Native Workflow
            </Link>
            <Link href="/projects" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
              Projects
            </Link>
            <Link href="/users" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
              Users
            </Link>
          </nav>
        </header>
        <div className="mx-auto max-w-4xl px-4 py-10">{children}</div>
      </body>
    </html>
  );
}
