'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addTrackAction } from '@/app/actions/app';
import type { TrackTemplateType } from '@shared/types';

interface TemplateInfo {
  type: TrackTemplateType;
  name: string;
  description: string;
  popular: boolean;
  emoji: string;
}

export default function Registry({
  templates,
  activeTypes,
}: {
  templates: TemplateInfo[];
  activeTypes: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<TrackTemplateType | null>(null);
  const [name, setName] = useState('');
  const [keyDate, setKeyDate] = useState('');
  const [pending, start] = useTransition();

  const popular = templates.filter((t) => t.popular);
  const rest = templates.filter((t) => !t.popular);

  function card(t: TemplateInfo) {
    const isActive = activeTypes.includes(t.type);
    const isSel = selected === t.type;
    return (
      <button
        key={t.type}
        disabled={isActive}
        onClick={() => setSelected(isSel ? null : t.type)}
        className="text-left border p-4 transition-colors disabled:opacity-40"
        style={{ borderColor: isSel ? 'var(--color-gold)' : 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{t.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-text font-semibold text-sm">{t.name}</span>
              {t.popular && <span className="bg-gold text-bg text-[9px] font-bold px-1.5 py-0.5">POPULAR</span>}
              {isActive && <span className="bg-run text-bg text-[9px] font-bold px-1.5 py-0.5">ACTIVE</span>}
            </div>
            <p className="text-muted text-[11px] mt-1">{t.description}</p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-gold mb-2">Popular</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">{popular.map(card)}</div>

      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted mb-2">All Templates</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{rest.map(card)}</div>

      {selected && (
        <div className="border border-gold bg-surface p-4 mt-6">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-gold mb-3">Configure Track</p>
          <input
            className="w-full bg-bg border border-border text-text px-3 py-2.5 text-sm mb-2 outline-none focus:border-gold"
            placeholder={templates.find((t) => t.type === selected)?.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="date"
            className="w-full bg-bg border border-border text-text px-3 py-2.5 text-sm mb-3 outline-none focus:border-gold"
            value={keyDate}
            onChange={(e) => setKeyDate(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={() => setSelected(null)} className="flex-1 border border-border text-muted py-2.5 text-sm">
              Cancel
            </button>
            <button
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await addTrackAction(selected, name, keyDate || undefined);
                  router.push('/battlegrounds');
                })
              }
              className="flex-1 border border-gold text-gold font-mono text-[10px] tracking-[0.15em] uppercase py-2.5 hover:bg-gold hover:text-bg transition-colors disabled:opacity-50"
            >
              {pending ? 'Adding…' : 'Add Track'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
