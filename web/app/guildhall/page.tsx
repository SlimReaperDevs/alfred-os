import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireOnboarded } from '@/lib/data';
import AppShell from '@/components/AppShell';
import { Panel, Tag } from '@/components/ui';
import ReplayTeaching from '@/components/ReplayTeaching';

export default async function GuildhallPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const record = await requireOnboarded();
  const honorific = record?.honorific ?? 'Sir';

  const sections = [
    {
      title: 'How Alfred Works',
      color: 'var(--color-blue)',
      items: [
        ['Daily Briefing', 'Generated fresh each visit from your live data.'],
        ['XP System', 'Earn XP for every logged activity. Level up your character.'],
        ['Quest Engine', 'Compulsory quests are derived from your active tracks each day.'],
        ['Lore Drops', "Complete weekly bounties to unlock Alfred's sealed backstory."],
      ],
    },
    {
      title: 'Getting Started',
      color: 'var(--color-gold)',
      items: [
        ['1', 'Add a track from The Grand Registry.'],
        ['2', 'Open it in The Battlegrounds and log your first session.'],
        ['3', 'Watch your character grow in The Hall of Records.'],
        ['4', 'Speak with Alfred in The Study any time.'],
      ],
    },
  ];

  return (
    <AppShell active="" honorific={honorific}>
      <Tag color="var(--color-run)">The Guildhall</Tag>
      <h1 className="text-text text-2xl font-bold mb-6">Help &amp; Info</h1>

      <div className="flex flex-col gap-4 max-w-2xl">
        {sections.map((s) => (
          <Panel key={s.title}>
            <Tag color={s.color}>{s.title}</Tag>
            <div className="mt-2 flex flex-col gap-2.5">
              {s.items.map(([k, v]) => (
                <div key={k}>
                  <p className="text-muted text-[11px]">{k}</p>
                  <p className="text-text text-sm">{v}</p>
                </div>
              ))}
            </div>
          </Panel>
        ))}

        <Panel>
          <Tag color="var(--color-blue)">First-Run Guidance</Tag>
          <p className="text-muted text-[11px] mt-2 mb-3">
            Re-watch the introduction and see the section tips again. Your data is untouched.
          </p>
          <ReplayTeaching />
        </Panel>

        <Panel>
          <Tag color="var(--color-phase2)">Alfred&apos;s Parting Words</Tag>
          <p className="text-muted text-sm italic leading-relaxed mt-2">
            &quot;The Manor is not merely an application, {honorific}. It is a record of who
            you chose to become. I shall continue to serve, as long as you continue to
            endeavour.&quot;
          </p>
          <p className="text-gold text-[11px] mt-2">— Alfred, House Butler &amp; System Overseer</p>
        </Panel>

        <p className="text-muted text-[11px]">Alfred OS · v2.0.0 · Web</p>
      </div>
    </AppShell>
  );
}
