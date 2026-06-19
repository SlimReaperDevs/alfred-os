import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireOnboarded, getActivity } from '@/lib/data';
import { computeCharacterState, abilityModifier, levelProgress, xpForNextLevel } from '@engine/XpEngine';
import AppShell from '@/components/AppShell';
import { Panel, Tag } from '@/components/ui';
import SectionTip from '@/components/SectionTip';
import EditCharacter from '@/components/EditCharacter';
import type { CharacterData } from '@shared/types';

const DEFAULT_CHARACTER: CharacterData = {
  name: '', career: '', age: null, height: null, weight: null,
  hobbies: '', backstory: '', charisma: 10,
};

const ABILITY_COLORS: Record<string, string> = {
  strength: 'var(--color-strength)',
  dexterity: 'var(--color-run)',
  constitution: 'var(--color-blue)',
  intelligence: 'var(--color-gold)',
  wisdom: 'var(--color-phase2)',
  charisma: 'var(--color-cyan)',
};

export default async function HallPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const record = await requireOnboarded();
  const honorific = record?.honorific ?? 'Sir';
  const character = record?.characterData ?? DEFAULT_CHARACTER;
  const activity = await getActivity();
  const state = computeCharacterState(activity, character);
  const displayName = character.name || record?.displayName || honorific;

  return (
    <AppShell active="hall" honorific={honorific}>
      <SectionTip id="hall" text="The Hall of Records is your character sheet. Your ability scores are derived from real progress, titles unlock at milestones, and sealed lore is revealed as you complete weekly bounties." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Header */}
        <Panel className="lg:col-span-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-gold flex items-center justify-center shrink-0">
              <span className="text-gold text-2xl font-bold">{displayName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <Tag color="var(--color-phase2)">Character Sheet</Tag>
              <p className="text-text text-xl font-bold">{displayName}</p>
              <p className="text-muted text-xs">{character.career || 'Adventurer'} · Level {state.overallLevel}</p>
            </div>
            <EditCharacter
              initial={{ honorific, name: character.name, career: character.career, backstory: character.backstory }}
            />
          </div>
          <div className="mt-4">
            <div className="flex justify-between mb-1.5">
              <span className="text-text text-xs font-semibold">Level {state.overallLevel}</span>
              <span className="text-muted text-[11px]">{state.totalXp} XP · {xpForNextLevel(state.totalXp)} to next</span>
            </div>
            <div className="h-1.5 bg-border rounded">
              <div className="h-1.5 bg-phase2 rounded" style={{ width: `${levelProgress(state.totalXp)}%` }} />
            </div>
          </div>
        </Panel>

        {/* Ability scores */}
        <Panel className="lg:col-span-2">
          <Tag color="var(--color-gold)">Ability Scores</Tag>
          <p className="text-text font-semibold mb-3">Derived from real progress</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {Object.entries(state.abilityScores).map(([k, v]) => {
              const mod = abilityModifier(v);
              return (
                <div key={k} className="border border-border p-2 text-center" style={{ borderColor: ABILITY_COLORS[k] }}>
                  <div className="text-[9px] uppercase tracking-wider" style={{ color: ABILITY_COLORS[k] }}>{k.slice(0, 3)}</div>
                  <div className="text-text text-lg font-bold">{v}</div>
                  <div className="text-muted text-xs">{mod >= 0 ? `+${mod}` : mod}</div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Level breakdown */}
        <Panel>
          <Tag>Progression</Tag>
          <p className="text-text font-semibold mb-3">Level Breakdown</p>
          {[
            { label: 'Training', value: state.trainingLevel, color: 'var(--color-phase1)' },
            { label: 'Knowledge', value: state.knowledgeLevel, color: 'var(--color-gold)' },
            { label: 'Overall', value: state.overallLevel, color: 'var(--color-phase2)' },
          ].map((l) => (
            <div key={l.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <span className="text-text text-sm">{l.label}</span>
              <span className="text-base font-bold" style={{ color: l.color }}>LV {l.value}</span>
            </div>
          ))}
        </Panel>

        {/* Proficiencies */}
        <Panel className="lg:col-span-1">
          <Tag>Proficiencies &amp; Feats</Tag>
          {state.unlockedProficiencies.length === 0 ? (
            <p className="text-muted text-sm mt-2">Complete sessions to unlock proficiencies.</p>
          ) : (
            <div className="flex flex-col mt-2">
              {state.unlockedProficiencies.map((p) => (
                <div key={p} className="flex items-center gap-2 py-1.5">
                  <span className="text-run text-xs">✓</span>
                  <span className="text-text text-sm">{p}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Titles */}
        <Panel className="lg:col-span-2">
          <Tag color="var(--color-gold)">Titles &amp; Badges</Tag>
          <div className="flex flex-wrap gap-2 mt-2">
            {state.unlockedTitles.map((t) => (
              <div
                key={t.id}
                className="border px-2.5 py-2"
                style={{ borderColor: t.unlocked ? 'var(--color-gold)' : 'var(--color-border)', opacity: t.unlocked ? 1 : 0.35 }}
              >
                <div className="text-xs font-bold" style={{ color: t.unlocked ? 'var(--color-gold)' : 'var(--color-muted)' }}>
                  {t.unlocked ? t.name : '???'}
                </div>
                <div className="text-muted text-[10px] mt-0.5">{t.unlockCondition}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Lore drops */}
        <Panel className="lg:col-span-3">
          <Tag color="var(--color-cyan)">Alfred&apos;s Sealed Lore</Tag>
          <p className="text-muted text-[11px] mb-3">Complete weekly bounties to unlock entries.</p>
          <div className="flex flex-col gap-2">
            {state.unlockedLoreDrops.map((lore, idx) => (
              <div key={lore.id} className="border border-border p-3" style={{ opacity: lore.unlocked ? 1 : 0.4 }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-cyan text-[11px]">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="font-bold text-sm" style={{ color: lore.unlocked ? 'var(--color-text)' : 'var(--color-muted)' }}>
                    {lore.unlocked ? lore.title : 'Sealed Entry'}
                  </span>
                </div>
                <p className="text-muted text-xs leading-relaxed">
                  {lore.unlocked ? lore.content : 'Complete another weekly bounty to unlock.'}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        {/* Background */}
        {character.backstory && (
          <Panel className="lg:col-span-3">
            <Tag>Character Background</Tag>
            <p className="text-text text-sm leading-relaxed mt-2">{character.backstory}</p>
            {character.age && (
              <p className="text-muted text-xs mt-2">
                Age {character.age} · Height {character.height}cm · Weight {character.weight}kg
              </p>
            )}
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
