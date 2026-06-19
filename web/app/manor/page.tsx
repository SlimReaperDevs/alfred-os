import { requireOnboarded, getTracks, getActivity } from '@/lib/data';
import {
  computeCharacterState,
  xpToLevel,
  xpForNextLevel,
  levelProgress,
  computeStreak,
} from '@engine/XpEngine';
import { generateDailyBriefing } from '@engine/AlfredEngine';
import { generateCompulsoryQuests } from '@engine/QuestEngine';
import AppShell from '@/components/AppShell';
import { Panel, Tag, StatCard } from '@/components/ui';
import SectionTip from '@/components/SectionTip';
import type { CharacterData } from '@shared/types';

const DEFAULT_CHARACTER: CharacterData = {
  name: '', career: '', age: null, height: null, weight: null,
  hobbies: '', backstory: '', charisma: 10,
};

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function ManorPage() {
  const record = await requireOnboarded();
  const [tracks, activity] = await Promise.all([getTracks(), getActivity()]);

  const honorific = record.honorific ?? 'Sir';
  const characterData = record.characterData ?? DEFAULT_CHARACTER;
  const state = computeCharacterState(activity, characterData);
  const streak = computeStreak(activity);
  const activeTracks = tracks.filter((t) => t.status === 'active');
  const quests = generateCompulsoryQuests(record.id, activeTracks);

  const briefing = generateDailyBriefing({
    honorific,
    displayName: record?.displayName ?? honorific,
    tracks,
    activity,
    activeQuests: quests,
    totalXp: state.totalXp,
    overallLevel: state.overallLevel,
  });

  // Countdowns from track key dates (future-dated only)
  const countdowns = activeTracks
    .flatMap((t) => t.keyDates.map((kd) => ({ ...kd, days: daysUntil(kd.date) })))
    .filter((c) => c.days >= 0)
    .sort((a, b) => a.days - b.days);

  return (
    <AppShell active="manor" honorific={honorific}>
      <SectionTip id="manor" text="This is The Manor — your home. My daily briefing sits at the top, locked, and updates from your live progress. Everything below reflects your real data." />
      {/* LOCKED: Alfred's Daily Briefing */}
      <Panel className="mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full border border-gold flex items-center justify-center shrink-0">
            <span className="text-gold font-bold">A</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Tag color="var(--color-gold)">Alfred · Daily Briefing</Tag>
              <span className="text-muted font-mono text-[9px] tracking-widest uppercase">
                ◆ Locked
              </span>
            </div>
            <p className="text-text text-sm leading-relaxed">{briefing}</p>

            {/* XP bar */}
            <div className="mt-4">
              <div className="flex justify-between mb-1.5">
                <span className="text-text text-xs font-semibold">
                  Level {state.overallLevel}
                </span>
                <span className="text-muted text-[11px]">
                  {state.totalXp} XP · {xpForNextLevel(state.totalXp)} to next
                </span>
              </div>
              <div className="h-1.5 bg-border rounded">
                <div
                  className="h-1.5 bg-gold rounded"
                  style={{ width: `${levelProgress(state.totalXp)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Two-column desktop layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Countdowns */}
          {countdowns.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {countdowns.slice(0, 2).map((c) => (
                <Panel key={c.label} className="text-center">
                  <Tag color="var(--color-blue)">{c.label}</Tag>
                  <p className="text-blue text-4xl font-bold">{c.days}</p>
                  <p className="text-muted text-[11px]">days remaining</p>
                </Panel>
              ))}
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Training" value={`LV ${state.trainingLevel}`} color="var(--color-phase1)" />
            <StatCard label="Knowledge" value={`LV ${state.knowledgeLevel}`} color="var(--color-gold)" />
            <StatCard label="Streak" value={`${streak}d`} color="var(--color-cyan)" />
            <StatCard label="Overall" value={`LV ${state.overallLevel}`} color="var(--color-phase2)" />
          </div>

          {/* Active quests */}
          <Panel>
            <Tag>Daily Quest Board</Tag>
            <p className="text-text font-semibold mb-3">Today&apos;s Missions</p>
            {quests.length === 0 ? (
              <p className="text-muted text-sm">
                {activeTracks.length === 0
                  ? `No active tracks yet, ${honorific}. Add one from The Grand Registry.`
                  : `All quests settled for today, ${honorific}. Admirable.`}
              </p>
            ) : (
              <div className="flex flex-col">
                {quests.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-strength shrink-0" />
                    <div className="flex-1">
                      <p className="text-text text-sm">{q.title}</p>
                      <p className="text-muted text-[11px]">compulsory · {q.xpReward} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Mission arc */}
          <Panel>
            <Tag color="var(--color-phase2)">Mission Arc</Tag>
            <p className="text-text font-semibold mb-3">Active Tracks</p>
            {activeTracks.length === 0 ? (
              <p className="text-muted text-sm">No active tracks.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {activeTracks.map((t) => (
                  <div key={t.id}>
                    <p className="text-text text-sm font-medium">{t.name}</p>
                    <p className="text-muted text-[11px] mt-0.5">
                      Phase {t.currentPhaseIndex + 1} · {t.templateType}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Streak */}
          <Panel>
            <Tag color="var(--color-cyan)">Study Streak</Tag>
            <p className="text-cyan text-3xl font-bold">{streak}</p>
            <p className="text-muted text-[11px]">consecutive days</p>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
