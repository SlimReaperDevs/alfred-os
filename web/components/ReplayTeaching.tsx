'use client';

import { useState } from 'react';
import { EXPLAINER_BEATS } from '@/lib/explainer';
import { resetSectionTips } from '@/components/SectionTip';

/** Guildhall "Replay onboarding" — re-shows the explainer beats and re-arms the
 *  contextual tooltips. Never touches user data. */
export default function ReplayTeaching() {
  const [open, setOpen] = useState(false);
  const [beat, setBeat] = useState(0);

  function start() {
    resetSectionTips();
    setBeat(0);
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={start}
        className="border border-blue text-blue font-mono text-[10px] tracking-[0.15em] uppercase px-4 py-3 hover:bg-blue hover:text-bg transition-colors"
      >
        Replay Onboarding
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setOpen(false)}>
          <div className="bg-surface border border-border p-8 max-w-md w-full text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl mb-4">{EXPLAINER_BEATS[beat].icon}</div>
            <p className="text-gold font-mono text-[10px] tracking-[0.25em] uppercase mb-2">{beat + 1} of {EXPLAINER_BEATS.length}</p>
            <p className="text-text text-xl font-bold mb-3">{EXPLAINER_BEATS[beat].title}</p>
            <p className="text-muted text-sm leading-relaxed mb-6">{EXPLAINER_BEATS[beat].body}</p>
            <button
              onClick={() => (beat < EXPLAINER_BEATS.length - 1 ? setBeat(beat + 1) : setOpen(false))}
              className="border border-gold text-gold font-mono text-xs tracking-[0.2em] uppercase px-10 py-3 hover:bg-gold hover:text-bg transition-colors"
            >
              {beat < EXPLAINER_BEATS.length - 1 ? 'Next →' : 'Done'}
            </button>
            <p className="text-muted text-[11px] mt-4">Section tips have been re-armed — you&apos;ll see them again as you explore.</p>
          </div>
        </div>
      )}
    </>
  );
}
