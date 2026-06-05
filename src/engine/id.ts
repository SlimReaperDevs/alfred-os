/**
 * Dependency-free RFC4122 v4 UUID generator.
 *
 * Used by the shared engines so they carry NO external npm dependency and can be
 * imported by both the React Native app and the Next.js web app without each
 * needing the `uuid` package resolvable on its own module path.
 *
 * Prefers the platform crypto when available (browsers, Node 19+, modern RN),
 * and falls back to Math.random — more than sufficient for client-side entity ids.
 */
export function generateId(): string {
  const c: Crypto | undefined =
    typeof globalThis !== 'undefined'
      ? (globalThis.crypto as Crypto | undefined)
      : undefined;

  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
