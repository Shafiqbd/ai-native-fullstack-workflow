import type { ReactElement } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { getHealth } from '@/lib/api-client';

/**
 * Home page: project overview plus a live view of the backend health
 * endpoint — the first end-to-end slice (Next.js server component ->
 * NestJS API -> shared types) of the workflow.
 *
 * Rendered at request time (`force-dynamic`) so `next build` never
 * depends on a running backend.
 */
export const dynamic = 'force-dynamic';

const PIPELINE_STEPS = [
  'GitHub Issue',
  'Planner Agent',
  'Specification',
  'Implementation Tasks',
  'Coding Agent',
  'Code + Tests',
  'Verification Harness',
  'AI Reviewer',
  'GitHub PR',
  'CI Quality Gates',
  'Human Approval',
  'Deployment',
];

export default async function HomePage(): Promise<ReactElement> {
  const health = await getHealth();

  return (
    <main className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">
          AI-Native Fullstack Workflow
        </h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-400">
          GitHub issues transformed into production-ready code through
          autonomous planning, coding, testing, verification, AI review
          and CI quality gates.
        </p>
      </header>

      <section aria-labelledby="status-heading" className="flex flex-col gap-3">
        <h2 id="status-heading" className="text-lg font-semibold">
          Backend status
        </h2>
        {health === null ? (
          <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950">
            <StatusBadge kind="unreachable" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Start the API with <code className="rounded bg-slate-200 px-1 py-0.5 dark:bg-slate-800">yarn dev:backend</code>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <StatusBadge kind={health.status === 'ok' ? 'ok' : 'degraded'} />
            <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="font-medium">Service</dt>
              <dd>{health.service}</dd>
              <dt className="font-medium">Version</dt>
              <dd>{health.version}</dd>
              <dt className="font-medium">Database</dt>
              <dd>{health.database}</dd>
              <dt className="font-medium">Checked at</dt>
              <dd>
                <time dateTime={health.timestamp}>
                  {new Date(health.timestamp).toLocaleString()}
                </time>
              </dd>
            </dl>
          </div>
        )}
      </section>

      <section aria-labelledby="pipeline-heading" className="flex flex-col gap-3">
        <h2 id="pipeline-heading" className="text-lg font-semibold">
          The pipeline
        </h2>
        <ol className="flex flex-wrap gap-2">
          {PIPELINE_STEPS.map((step, index) => (
            <li key={step} className="flex items-center gap-2">
              <span className="rounded-md bg-slate-200 px-2.5 py-1 text-sm font-medium dark:bg-slate-800">
                {step}
              </span>
              {index < PIPELINE_STEPS.length - 1 && (
                <span aria-hidden="true" className="text-slate-400">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
