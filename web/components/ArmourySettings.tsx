'use client';

import { useState, useTransition } from 'react';
import { updateCharacterAction } from '@/app/actions/app';

export default function ArmourySettings({
  initial,
}: {
  initial: { honorific: string; name: string; career: string };
}) {
  const [honorific, setHonorific] = useState(initial.honorific);
  const [name, setName] = useState(initial.name);
  const [career, setCareer] = useState(initial.career);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const input = 'w-full bg-bg border border-border text-text px-3 py-2.5 text-sm outline-none focus:border-gold transition-colors';

  return (
    <div className="flex flex-col gap-3">
      {[
        { label: 'Honorific (how Alfred addresses you)', value: honorific, set: setHonorific },
        { label: 'Name', value: name, set: setName },
        { label: 'Career', value: career, set: setCareer },
      ].map((f) => (
        <div key={f.label}>
          <label className="text-muted font-mono text-[9px] tracking-[0.2em] uppercase block mb-1">{f.label}</label>
          <input className={input} value={f.value} onChange={(e) => { f.set(e.target.value); setSaved(false); }} />
        </div>
      ))}
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            await updateCharacterAction({ honorific, name, career, displayName: name });
            setSaved(true);
          })
        }
        className="border border-gold text-gold font-mono text-[10px] tracking-[0.15em] uppercase py-3 mt-1 hover:bg-gold hover:text-bg transition-colors disabled:opacity-50"
      >
        {pending ? 'Saving…' : saved ? '✓ Saved' : 'Save Settings'}
      </button>
    </div>
  );
}
