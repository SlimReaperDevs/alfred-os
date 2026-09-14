'use client';

import { useEffect } from 'react';

/**
 * App error boundary.
 *
 * The data layer throws a DatabaseError rather than returning a plausible empty
 * state (see lib/db.ts). Without this, those throws would surface as a blank
 * screen; with it, the failure is visible and recoverable.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[alfred]', error);
  }, [error]);

  return (
    <main className="flex-1 flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center mb-6 mx-auto">
          <span className="text-gold text-4xl font-bold">!</span>
        </div>

        <p className="text-gold font-mono text-[10px] tracking-[0.25em] uppercase">
          Alfred OS · System fault
        </p>

        <h1 className="text-text text-xl font-semibold mt-2">
          A moment, Sir.
        </h1>

        <p className="text-muted text-sm mt-2">
          I could not reach your records. Nothing has been altered. Allow me to
          try again.
        </p>

        <button
          onClick={reset}
          className="mt-6 w-full bg-gold text-bg py-3 text-sm font-semibold tracking-wide uppercase"
        >
          Try again
        </button>

        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-6 text-left text-muted text-[11px] whitespace-pre-wrap border border-border p-3 overflow-x-auto">
            {error.message}
            {error.digest ? `\n\ndigest: ${error.digest}` : ''}
          </pre>
        )}
      </div>
    </main>
  );
}
