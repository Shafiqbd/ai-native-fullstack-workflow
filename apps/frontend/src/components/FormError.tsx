import type { ReactElement } from 'react';

interface FormErrorProps {
  message: string | null;
}

/** Inline error announced to screen readers; renders nothing when empty. */
export default function FormError({ message }: FormErrorProps): ReactElement | null {
  if (message === null) {
    return null;
  }
  return (
    <p role="alert" className="text-sm text-rose-700 dark:text-rose-400">
      {message}
    </p>
  );
}
