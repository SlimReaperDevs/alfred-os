'use client';

import { useState, useTransition } from 'react';
import { updateCharacterAction } from '@/app/actions/app';

export default function EditCharacter({
  initial,
}: {
  initial: { honorific: string; name: string; career: string; backstory: string };
}) {
  const [open, setOpen] = useState(false);
  const [honorific, setHonorific] = useState(initial.honorific);
  const [name, setName] = useState(initial.name);
  const [career, setCareer] = useState(initial.career);
  const [backstory, setBackstory] = useState(initial.backstory);
  const [pending, start] = useTransition();

  const input = 'w-full bg-bg border border-border text-text px-3 py-2.5 text-sm outline-none focus:border-gold transition-colors';

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="border border-border text-muted text-[11px] px-3 py-2 hover:border-gold hover:text-gold transition-colors"
      >
        ✎ Edit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div className="bg-surface border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-phase2 mb-4">Edit Character</p>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Honorific', value: honorific, set: setHonorific },
            { label: 'Name', value: name, set: setName },
            { label: 'Career', value: career, set: setCareer },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-muted font-mono text-[9px] tracking-[0.2em] uppercase block mb-1">{f.label}</label>
              <input className={input} value={f.value} onChange={(e) => f.set(e.target.value)} />
            </div>
          ))}
          <div>
            <label className="text-muted font-mono text-[9px] tracking-[0.2em] uppercase block mb-1">Backstory</label>
            <textarea className={input} rows={3} value={backstory} onChange={(e) => setBackstory(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={() => setOpen(false)} className="flex-1 border border-border text-muted py-2.5 text-sm">
            Cancel
          </button>
          <button
            disabled={pending}
            onClick={() =>
              start(async () => {
                await updateCharacterAction({ honorific, name, career, backstory, displayName: name });
                setOpen(false);
              })
            }
            className="flex-1 border border-gold text-gold font-mono text-[10px] tracking-[0.15em] uppercase py-2.5 hover:bg-gold hover:text-bg transition-colors disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
