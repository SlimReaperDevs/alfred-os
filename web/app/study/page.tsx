import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ensureUserRecord, getTracks, getActivity } from '@/lib/data';
import { computeCharacterState } from '@engine/XpEngine';
import { generateCompulsoryQuests } from '@engine/QuestEngine';
import type { AlfredContext } from '@engine/AlfredEngine';
import AppShell from '@/components/AppShell';
import { Tag } from '@/components/ui';
import Chat from '@/components/Chat';
import type { CharacterData } from '@shared/types';

const DEFAULT_CHARACTER: CharacterData = {
  name: '', career: '', age: null, height: null, weight: null,
  hobbies: '', backstory: '', charisma: 10,
};

export default async function StudyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const record = await ensureUserRecord();
  const honorific = record?.honorific ?? 'Sir';
  const [tracks, activity] = await Promise.all([getTracks(), getActivity()]);
  const state = computeCharacterState(activity, record?.characterData ?? DEFAULT_CHARACTER);
  const activeTracks = tracks.filter((t) => t.status === 'active');
  const quests = generateCompulsoryQuests(user.id, activeTracks);

  const context: AlfredContext = {
    honorific,
    displayName: record?.displayName ?? honorific,
    tracks,
    activity,
    activeQuests: quests,
    totalXp: state.totalXp,
    overallLevel: state.overallLevel,
  };

  return (
    <AppShell active="study" honorific={honorific}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full border border-gold flex items-center justify-center">
          <span className="text-gold font-bold">A</span>
        </div>
        <div>
          <Tag color="var(--color-cyan)">The Study</Tag>
          <p className="text-text font-bold">
            Alfred <span className="text-run text-xs font-normal">● Active</span>
          </p>
        </div>
      </div>
      <Chat context={context} />
    </AppShell>
  );
}
