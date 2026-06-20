'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { completeOnboardingAction, logStarterQuestAction } from '@/app/actions/onboarding';
import { EXPLAINER_BEATS } from '@/lib/explainer';
import type { TrackTemplateType, CharacterData } from '@shared/types';

interface TemplateInfo {
  type: TrackTemplateType;
  name: string;
  description: string;
  popular: boolean;
  emoji: string;
}

// The cinematic "Commence" intro lives on the public landing page (before login),
// to match mobile. Onboarding here begins straight at setup.
type Phase = 'setup' | 'explainer' | 'guided' | 'welcome';
type SetupStep = 'honorific' | 'name' | 'character' | 'track' | 'date';

const HONORIFICS = ['Sir', "Ma'am", 'Mx', 'Commander'];

const EXPLAINER = EXPLAINER_BEATS;

const input = 'w-full bg-bg border border-border text-text px-4 py-3 text-sm outline-none focus:border-gold transition-colors';

export default function OnboardingFlow({
  templates,
  email,
}: {
  templates: TemplateInfo[];
  email: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('setup');
  const [, startTransition] = useTransition();

  // setup state
  const [setupStep, setSetupStep] = useState<SetupStep>('honorific');
  const [honorific, setHonorific] = useState('Sir');
  const [customHonorific, setCustomHonorific] = useState('');
  const [name, setName] = useState('');
  const [career, setCareer] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [backstory, setBackstory] = useState('');
  const [charisma, setCharisma] = useState(10);
  const [templateType, setTemplateType] = useState<TrackTemplateType>('hyrox');
  const [trackName, setTrackName] = useState('');
  const [keyDate, setKeyDate] = useState('');

  // explainer / guided
  const [beat, setBeat] = useState(0);
  const [starterXp, setStarterXp] = useState<number | null>(null);
  const [questing, setQuesting] = useState(false);

  const finalHonorific = customHonorific.trim() || honorific;

  function buildCharacter(): CharacterData {
    return {
      name: name.trim(),
      career: career.trim(),
      age: age ? parseInt(age) : null,
      height: height ? parseInt(height) : null,
      weight: weight ? parseInt(weight) : null,
      hobbies: hobbies.trim(),
      backstory: backstory.trim(),
      charisma,
    };
  }

  function finish() {
    startTransition(async () => {
      await completeOnboardingAction({
        honorific: finalHonorific,
        displayName: name,
        character: buildCharacter(),
        templateType,
        trackName,
        keyDate: keyDate || undefined,
      });
      router.push('/manor');
      router.refresh();
    });
  }

  if (phase === 'guided') {
    return (
      <Centered>
        <Crest />
        <p className="text-gold font-mono text-[10px] tracking-[0.25em] uppercase mt-6 mb-2">Your First Directive</p>
        {starterXp === null ? (
          <>
            <p className="text-text text-lg font-semibold mb-1">Log your arrival to the Manor</p>
            <p className="text-muted text-sm mb-6 text-center max-w-sm">Mark your arrival, {finalHonorific}, and feel the System record it.</p>
            <button
              disabled={questing}
              onClick={() => {
                setQuesting(true);
                startTransition(async () => {
                  const xp = await logStarterQuestAction();
                  setStarterXp(xp);
                  setQuesting(false);
                });
              }}
              className="border border-gold text-gold font-mono text-xs tracking-[0.2em] uppercase px-10 py-4 hover:bg-gold hover:text-bg transition-colors disabled:opacity-50"
            >
              {questing ? 'Recording…' : 'Mark Arrival'}
            </button>
          </>
        ) : (
          <>
            <p className="text-run text-3xl font-bold mb-1">+{starterXp} XP</p>
            <p className="text-muted text-sm mb-6 text-center max-w-sm">Your journey is recorded. That is the loop, {finalHonorific} — act, and be rewarded.</p>
            <button onClick={() => setPhase('welcome')} className="border border-gold text-gold font-mono text-xs tracking-[0.2em] uppercase px-10 py-4 hover:bg-gold hover:text-bg transition-colors">
              Continue →
            </button>
          </>
        )}
      </Centered>
    );
  }

  if (phase === 'welcome') {
    return (
      <Centered>
        <Crest big />
        <p className="text-text text-xl font-bold mt-8 mb-2 text-center">The Manor is ready, {finalHonorific}.</p>
        <p className="text-muted text-sm mb-8">Welcome home.</p>
        <button onClick={finish} className="border border-gold text-gold font-mono text-xs tracking-[0.2em] uppercase px-10 py-4 hover:bg-gold hover:text-bg transition-colors">
          Enter The Manor →
        </button>
      </Centered>
    );
  }

  if (phase === 'explainer') {
    const b = EXPLAINER[beat];
    return (
      <Centered>
        <div className="text-5xl mb-4">{b.icon}</div>
        <p className="text-gold font-mono text-[10px] tracking-[0.25em] uppercase mb-2">{beat + 1} of {EXPLAINER.length}</p>
        <p className="text-text text-xl font-bold mb-3 text-center">{b.title}</p>
        <p className="text-muted text-sm text-center max-w-sm leading-relaxed mb-8">{b.body}</p>
        <div className="flex gap-3">
          <button onClick={() => setPhase('guided')} className="text-muted text-xs px-4 py-3 hover:text-text transition-colors">Skip</button>
          <button
            onClick={() => (beat < EXPLAINER.length - 1 ? setBeat(beat + 1) : setPhase('guided'))}
            className="border border-gold text-gold font-mono text-xs tracking-[0.2em] uppercase px-10 py-3 hover:bg-gold hover:text-bg transition-colors"
          >
            {beat < EXPLAINER.length - 1 ? 'Next →' : 'Got it →'}
          </button>
        </div>
        <div className="flex gap-1.5 mt-6">
          {EXPLAINER.map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === beat ? 'bg-gold' : 'bg-border'}`} />
          ))}
        </div>
      </Centered>
    );
  }

  // ── setup wizard ──
  const steps: SetupStep[] = ['honorific', 'name', 'character', 'track', 'date'];
  const stepIdx = steps.indexOf(setupStep);
  const goNext = () => (stepIdx < steps.length - 1 ? setSetupStep(steps[stepIdx + 1]) : setPhase('explainer'));

  return (
    <div className="flex-1 flex flex-col items-center px-6 py-10 max-w-md mx-auto w-full">
      {/* progress */}
      <div className="flex gap-1.5 mb-8 w-full">
        {steps.map((s, i) => (
          <span key={s} className={`h-1 flex-1 rounded-full ${i <= stepIdx ? 'bg-gold' : 'bg-border'}`} />
        ))}
      </div>

      {setupStep === 'honorific' && (
        <Step title="How shall I address you?" sub="Choose how the System will refer to you.">
          <div className="flex flex-wrap gap-2 mb-3">
            {HONORIFICS.map((h) => (
              <button key={h} onClick={() => { setHonorific(h); setCustomHonorific(''); }}
                className={`px-5 py-3 border ${(customHonorific ? '' : honorific === h) ? 'border-gold text-gold' : 'border-border text-muted'}`}>
                {h}
              </button>
            ))}
          </div>
          <input className={input} placeholder="Or a custom title…" value={customHonorific} onChange={(e) => setCustomHonorific(e.target.value)} />
          <Next onClick={goNext} />
        </Step>
      )}

      {setupStep === 'name' && (
        <Step title={`And your name, ${finalHonorific}?`} sub="How shall the System know you?">
          <input className={input} placeholder="Your name…" value={name} onChange={(e) => setName(e.target.value)} />
          <Next onClick={goNext} disabled={!name.trim()} />
        </Step>
      )}

      {setupStep === 'character' && (
        <Step title="A few details" sub="These shape your D&D ability scores. All optional.">
          {[
            { ph: 'Career / Profession', v: career, s: setCareer },
            { ph: 'Age', v: age, s: setAge },
            { ph: 'Height (cm)', v: height, s: setHeight },
            { ph: 'Weight (kg)', v: weight, s: setWeight },
            { ph: 'Hobbies & interests', v: hobbies, s: setHobbies },
          ].map((f) => (
            <input key={f.ph} className={`${input} mb-2`} placeholder={f.ph} value={f.v} onChange={(e) => f.s(e.target.value)} />
          ))}
          <textarea className={`${input} mb-2`} placeholder="Backstory (optional)" rows={2} value={backstory} onChange={(e) => setBackstory(e.target.value)} />
          <p className="text-muted font-mono text-[10px] tracking-[0.2em] uppercase mb-1">Charisma: {charisma}</p>
          <input type="range" min={8} max={18} value={charisma} onChange={(e) => setCharisma(parseInt(e.target.value))} className="w-full mb-1 accent-gold" />
          <Next onClick={goNext} />
        </Step>
      )}

      {setupStep === 'track' && (
        <Step title="Choose your first track" sub="The System will structure your quests around it.">
          <div className="flex flex-col gap-2 mb-3 w-full max-h-72 overflow-y-auto">
            {templates.map((t) => (
              <button key={t.type} onClick={() => setTemplateType(t.type)}
                className="text-left border p-3 transition-colors"
                style={{ borderColor: templateType === t.type ? 'var(--color-gold)' : 'var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{t.emoji}</span>
                  <span className="text-text text-sm font-semibold">{t.name}</span>
                  {t.popular && <span className="bg-gold text-bg text-[9px] font-bold px-1.5 py-0.5">POPULAR</span>}
                </div>
              </button>
            ))}
          </div>
          <input className={input} placeholder="Custom name (optional)" value={trackName} onChange={(e) => setTrackName(e.target.value)} />
          <Next onClick={goNext} />
        </Step>
      )}

      {setupStep === 'date' && (
        <Step title="When is your target?" sub="I shall begin the countdown at once.">
          <input type="date" className={input} value={keyDate} onChange={(e) => setKeyDate(e.target.value)} />
          <Next onClick={goNext} label="Continue →" />
        </Step>
      )}
    </div>
  );
}

// ── small presentational helpers ──

function Crest({ big }: { big?: boolean }) {
  const s = big ? 'w-20 h-20 text-4xl' : 'w-16 h-16 text-3xl';
  return (
    <div className={`${s} rounded-full border-2 border-gold flex items-center justify-center shadow-[0_0_30px_rgba(201,168,76,0.35)]`}>
      <span className="text-gold font-bold">A</span>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 flex flex-col items-center justify-center px-6">{children}</div>;
}

function Step({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="w-full">
      <h1 className="text-text text-2xl font-bold mb-1">{title}</h1>
      <p className="text-muted text-sm mb-5">{sub}</p>
      {children}
    </div>
  );
}

function Next({ onClick, disabled, label = 'Confirm →' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`w-full border py-3.5 mt-4 font-mono text-xs tracking-[0.2em] uppercase transition-colors ${disabled ? 'border-border text-muted' : 'border-gold text-gold hover:bg-gold hover:text-bg'}`}>
      {label}
    </button>
  );
}
