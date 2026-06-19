'use client';

import { useState, useEffect } from 'react';

const PREFIX = 'alfred:tip:';

/**
 * One-time, per-device contextual tooltip shown the first time a user visits a
 * section. "Seen" state lives in localStorage (lightweight nudge, deliberately
 * not synced per-account). Replaying onboarding clears these keys.
 */
export default function SectionTip({ id, text }: { id: string; text: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(PREFIX + id)) setShow(true);
    } catch {}
  }, [id]);

  if (!show) return null;

  function dismiss() {
    try { localStorage.setItem(PREFIX + id, '1'); } catch {}
    setShow(false);
  }

  return (
    <div className="flex items-start gap-3 border border-gold/40 bg-gold/5 p-3 mb-4 rounded">
      <div className="w-7 h-7 rounded-full border border-gold flex items-center justify-center shrink-0">
        <span className="text-gold text-xs font-bold">A</span>
      </div>
      <p className="flex-1 text-text text-xs leading-relaxed">{text}</p>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="text-muted hover:text-gold text-sm leading-none px-1"
      >
        ✕
      </button>
    </div>
  );
}

/** Clears all tooltip seen-state so they show again (used by onboarding replay). */
export function resetSectionTips() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}
