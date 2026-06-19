import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireOnboarded, getTracks } from '@/lib/data';
import { getPhasesForTemplate } from '@engine/templates';
import AppShell from '@/components/AppShell';
import { Panel, Tag } from '@/components/ui';
import SectionTip from '@/components/SectionTip';

export default async function BattlegroundsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const record = await requireOnboarded();
  const honorific = record?.honorific ?? 'Sir';
  const tracks = (await getTracks()).filter((t) => t.status === 'active');

  return (
    <AppShell active="battlegrounds" honorific={honorific}>
      <SectionTip id="battlegrounds" text="The Battlegrounds hold your active tracks. Open one to log today's session, runs, PBs or scores — each entry earns XP. Add new tracks from The Grand Registry." />
      <div className="flex items-center justify-between mb-4">
        <div>
          <Tag color="var(--color-blue)">The Battlegrounds</Tag>
          <h1 className="text-text text-2xl font-bold">Active Tracks</h1>
        </div>
        <Link
          href="/registry"
          className="border border-gold text-gold font-mono text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 hover:bg-gold hover:text-bg transition-colors"
        >
          + Add Track
        </Link>
      </div>

      {tracks.length === 0 ? (
        <Panel>
          <p className="text-muted text-sm">
            No active tracks yet, {honorific}. Visit{' '}
            <Link href="/registry" className="text-gold underline">
              The Grand Registry
            </Link>{' '}
            to begin a new mission.
          </p>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tracks.map((t) => {
            const phases = getPhasesForTemplate(t.templateType);
            const phase = phases[t.currentPhaseIndex];
            return (
              <Link key={t.id} href={`/battlegrounds/${t.id}`}>
                <Panel className="hover:border-gold transition-colors h-full">
                  <Tag color="var(--color-blue)">{t.templateType}</Tag>
                  <p className="text-text text-lg font-bold mb-1">{t.name}</p>
                  <p className="text-muted text-xs mb-3">{phase?.name ?? 'Programme complete'}</p>
                  <div className="flex justify-between">
                    <span className="text-blue text-[11px]">
                      Phase {t.currentPhaseIndex + 1} / {phases.length}
                    </span>
                    <span className="text-gold text-[11px]">Open →</span>
                  </div>
                </Panel>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
