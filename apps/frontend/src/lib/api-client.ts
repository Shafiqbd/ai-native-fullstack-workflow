import type { HealthReport } from '@ai-workflow/shared-types';

/**
 * Central API client for server components.
 *
 * API_BASE_URL is a server-side environment variable (no NEXT_PUBLIC_
 * prefix): these calls happen on the server, never in the browser.
 */

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001';

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

/**
 * Fetches the backend health report.
 *
 * Returns `null` on any failure (network error, non-2xx, invalid body)
 * instead of throwing: the status page renders a degraded state rather
 * than crashing the request.
 */
export async function getHealth(): Promise<HealthReport | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as HealthReport;
  } catch {
    return null;
  }
}
