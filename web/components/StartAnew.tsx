'use client';

import { useState, useTransition } from 'react';
import { startAnewAction } from '@/app/actions/onboarding';

export default function StartAnew({ honorific }: { honorific: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="border border-strength text-strength font-mono text-[10px] tracking-[0.15em] uppercase px-4 py-3 hover:bg-strength hover:text-bg transition-colors"
      >
        ⚠ Start Anew (wipe progress)
      </button>
    );
  }

  return (
    <div className="border border-strength/50 p-4">
      <p className="text-text text-sm mb-3">
        Are you certain, {honorific}? Every record — tracks, XP, quests, history — will be
        expunged. Your login is kept, but this cannot be undone.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 border border-border text-muted py-2.5 text-sm"
        >
          Cancel
        </button>
        <button
          disabled={pending}
          onClick={() => start(() => startAnewAction())}
          className="flex-1 border border-strength text-strength font-mono text-[10px] tracking-[0.15em] uppercase py-2.5 hover:bg-strength hover:text-bg transition-colors disabled:opacity-50"
        >
          {pending ? 'Expunging…' : 'Expunge Everything'}
        </button>
      </div>
    </div>
  );
}
