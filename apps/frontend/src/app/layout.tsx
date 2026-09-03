import type { Metadata } from 'next';
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
        <div className="mx-auto max-w-4xl px-4 py-10">{children}</div>
      </body>
    </html>
  );
}
