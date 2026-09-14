import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Unwrapping helper for Supabase calls in the web data layer.
 *
 * Every read and write here used to be written as
 * `const { data } = await supabase.from(...)...`, discarding `error`.
 *
 * On writes that turned a rejected insert into a silent no-op: the uuid type
 * mismatch in onboarding (22P02) was swallowed for weeks, so new users finished
 * onboarding to an empty Manor with no track and no XP.
 *
 * On reads it was worse than invisible — see ensureUserRecord, where a failed
 * read looked like "no row yet" and caused a fresh, blank profile to be written
 * over the real one.
 *
 * Throw instead. A server component or action that cannot reach the database
 * must fail loudly, not invent a plausible empty state.
 */

export class DatabaseError extends Error {
  readonly code: string | undefined;

  constructor(context: string, error: PostgrestError) {
    super(`${context}: ${error.message}${error.code ? ` (${error.code})` : ''}`);
    this.name = 'DatabaseError';
    this.code = error.code;
  }
}

/**
 * Returns `data`, or throws if the call failed.
 *
 * Safe for `.maybeSingle()` and list selects, which return empty rather than
 * erroring when there is nothing to find, and for writes, where `data` is
 * discarded and only the error matters.
 *
 * `context` is included in the thrown message — name the call site.
 */
export function unwrap<T>(
  result: { data: T; error: PostgrestError | null },
  context: string,
): T {
  if (result.error) throw new DatabaseError(context, result.error);
  return result.data;
}
