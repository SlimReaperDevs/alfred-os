'use client';

import { useState, useTransition } from 'react';
import { logAction } from '@/app/actions/app';
import type { TrackTemplateType, TrackSession } from '@shared/types';

const HYROX_STATIONS = [
  'SkiErg', 'Sled Push', 'Sled Pull', 'Burpee Broad Jumps',
  'Rowing', "Farmer's Carry", 'Sandbag Lunges', 'Wall Balls',
];

const inputCls =
  'w-full bg-bg border border-border text-text px-3 py-2.5 text-sm outline-none focus:border-gold transition-colors';
const btnCls =
  'border border-gold text-gold font-mono text-[10px] tracking-[0.15em] uppercase py-3 hover:bg-gold hover:text-bg transition-colors disabled:opacity-50';

function Panel({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div className="border border-border bg-surface p-4">
      <div className="h-0.5 w-8 mb-3" style={{ backgroundColor: accent }} />
      {children}
    </div>
  );
}

export function SessionLoggers({
  trackId,
  sessions,
}: {
  trackId: string;
  sessions: TrackSession[];
}) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<string[]>([]);

  if (sessions.length === 0) {
    return <p className="text-muted text-sm">Rest day. Recovery is part of the programme.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {sessions.map((s) => (
        <div key={s.id}>
          <p className="text-text font-semibold text-sm">{s.title}</p>
          <p className="text-muted text-xs mb-2">{s.description}</p>
          <button
            disabled={pending || done.includes(s.id)}
            onClick={() =>
              start(async () => {
                await logAction(trackId, 'session_complete', { title: s.title, sessionId: s.id }, s.xpReward, true);
                setDone((d) => [...d, s.id]);
              })
            }
            className="w-full border border-blue text-blue font-mono text-[10px] tracking-[0.15em] uppercase py-3 hover:bg-blue hover:text-bg transition-colors disabled:opacity-40"
          >
            {done.includes(s.id) ? '✓ Logged' : '[ Log Session Complete ]'}
          </button>
        </div>
      ))}
    </div>
  );
}

export function TrackLoggers({
  trackId,
  templateType,
}: {
  trackId: string;
  templateType: TrackTemplateType;
}) {
  const isFitness = ['hyrox', 'marathon', 'cycling'].includes(templateType);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {isFitness && <RunLogger trackId={trackId} />}
      {templateType === 'hyrox' && <StationLogger trackId={trackId} />}
      {templateType === 'pmp' && <MockScoreLogger trackId={trackId} />}
      {templateType === 'product_owner' && <BuildLogger trackId={trackId} />}
    </div>
  );
}

function RunLogger({ trackId }: { trackId: string }) {
  const [km, setKm] = useState('');
  const [min, setMin] = useState('');
  const [pending, start] = useTransition();
  return (
    <Panel accent="var(--color-run)">
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-run mb-3">Run Tracker</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input className={inputCls} placeholder="km" value={km} onChange={(e) => setKm(e.target.value)} inputMode="decimal" />
        <input className={inputCls} placeholder="min" value={min} onChange={(e) => setMin(e.target.value)} inputMode="decimal" />
      </div>
      <button
        disabled={pending || !km}
        className={`${btnCls} w-full`}
        onClick={() =>
          start(async () => {
            await logAction(trackId, 'run_log', { km: parseFloat(km), minutes: parseFloat(min) || 0 }, Math.round((parseFloat(km) || 0) * 12));
            setKm(''); setMin('');
          })
        }
      >
        {pending ? 'Logging…' : '+ Log Run'}
      </button>
    </Panel>
  );
}

function StationLogger({ trackId }: { trackId: string }) {
  const [station, setStation] = useState(HYROX_STATIONS[0]);
  const [time, setTime] = useState('');
  const [pending, start] = useTransition();
  return (
    <Panel accent="var(--color-strength)">
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-strength mb-3">Station PB</p>
      <select className={`${inputCls} mb-2`} value={station} onChange={(e) => setStation(e.target.value)}>
        {HYROX_STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <input className={`${inputCls} mb-2`} placeholder="Time e.g. 4:20" value={time} onChange={(e) => setTime(e.target.value)} />
      <button
        disabled={pending || !time}
        className={`${btnCls} w-full`}
        style={{ borderColor: 'var(--color-strength)', color: 'var(--color-strength)' }}
        onClick={() =>
          start(async () => {
            await logAction(trackId, 'station_pb', { station, time }, 80);
            setTime('');
          })
        }
      >
        {pending ? 'Logging…' : '+ Log Station PB'}
      </button>
    </Panel>
  );
}

function MockScoreLogger({ trackId }: { trackId: string }) {
  const [score, setScore] = useState('');
  const [total, setTotal] = useState('180');
  const [pending, start] = useTransition();
  return (
    <Panel accent="var(--color-gold)">
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-gold mb-3">Mock Exam Tracker</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input className={inputCls} placeholder="Score" value={score} onChange={(e) => setScore(e.target.value)} inputMode="numeric" />
        <input className={inputCls} placeholder="Total" value={total} onChange={(e) => setTotal(e.target.value)} inputMode="numeric" />
      </div>
      <button
        disabled={pending || !score}
        className={`${btnCls} w-full`}
        onClick={() =>
          start(async () => {
            const s = parseInt(score), t = parseInt(total) || 180;
            const pct = Math.round((s / t) * 100);
            await logAction(trackId, 'mock_score', { score: s, total: t, percentage: pct }, pct >= 75 ? 200 : pct >= 60 ? 120 : 80);
            setScore('');
          })
        }
      >
        {pending ? 'Logging…' : '+ Log Score'}
      </button>
    </Panel>
  );
}

function BuildLogger({ trackId }: { trackId: string }) {
  const [project, setProject] = useState('');
  const [desc, setDesc] = useState('');
  const [pending, start] = useTransition();
  return (
    <Panel accent="var(--color-cyan)">
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-cyan mb-3">Vibe Coding Log</p>
      <input className={`${inputCls} mb-2`} placeholder="Project name" value={project} onChange={(e) => setProject(e.target.value)} />
      <textarea className={`${inputCls} mb-2`} placeholder="What did you build or ship?" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
      <button
        disabled={pending || !project}
        className={`${btnCls} w-full`}
        style={{ borderColor: 'var(--color-cyan)', color: 'var(--color-cyan)' }}
        onClick={() =>
          start(async () => {
            await logAction(trackId, 'build_log', { project, description: desc }, 120);
            setProject(''); setDesc('');
          })
        }
      >
        {pending ? 'Logging…' : '+ Log Build'}
      </button>
    </Panel>
  );
}
