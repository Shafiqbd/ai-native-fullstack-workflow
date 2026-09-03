import type { ReactElement } from 'react';

type StatusKind = 'ok' | 'degraded' | 'unreachable';

const STATUS_STYLES: Record<StatusKind, { label: string; className: string }> = {
  ok: {
    label: 'Healthy',
    className: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
  },
  degraded: {
    label: 'Degraded',
    className: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  },
  unreachable: {
    label: 'Backend unreachable',
    className: 'bg-rose-100 text-rose-800 ring-rose-600/20',
  },
};

interface StatusBadgeProps {
  kind: StatusKind;
}

/** Small pill communicating system status at a glance. */
export default function StatusBadge({ kind }: StatusBadgeProps): ReactElement {
  const style = STATUS_STYLES[kind];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${style.className}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${kind === 'ok' ? 'bg-emerald-500' : kind === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'}`}
      />
      {style.label}
    </span>
  );
}
