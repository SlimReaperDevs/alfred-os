import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ensureUserRecord, getTrackById, getActivity } from '@/lib/data';
import { getPhasesForTemplate } from '@engine/templates';
import AppShell from '@/components/AppShell';
import { Panel, Tag } from '@/components/ui';
import { SessionLoggers, TrackLoggers } from '@/components/Loggers';

export default async function TrackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const record = await ensureUserRecord();
  const honorific = record?.honorific ?? 'Sir';
  const track = await getTrackById(id);
  if (!track) notFound();

  const phases = getPhasesForTemplate(track.templateType);
  const phase = phases[track.currentPhaseIndex];
  const today = new Date().getDay();
  const todaySessions = phase?.sessions.filter((s) => s.dayOfWeek === today) ?? [];

  const activity = (await getActivity())
    .filter((a) => a.trackId === track.id)
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());

  return (
    <AppShell active="battlegrounds" honorific={honorific}>
      <Link href="/battlegrounds" className="text-gold text-sm mb-4 inline-block">
        ← Back to Tracks
      </Link>

      <div className="mb-4">
        <Tag color="var(--color-blue)">{track.templateType}</Tag>
        <h1 className="text-text text-2xl font-bold">{track.name}</h1>
        <p className="text-muted text-sm">
          {phase?.name ?? 'Programme complete'} · Phase {track.currentPhaseIndex + 1} / {phases.length}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Today's session */}
          <Panel>
            <Tag color="var(--color-blue)">Today&apos;s Session</Tag>
            <SessionLoggers trackId={track.id} sessions={todaySessions} />
          </Panel>

          {/* Track-specific loggers */}
          <TrackLoggers trackId={track.id} templateType={track.templateType} />
        </div>

        {/* Activity log */}
        <div>
          <Panel>
            <Tag>Recent Activity</Tag>
            {activity.length === 0 ? (
              <p className="text-muted text-sm">No activity logged yet.</p>
            ) : (
              <div className="flex flex-col">
                {activity.slice(0, 15).map((a) => (
                  <div key={a.id} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-text text-xs capitalize">
                      {a.actionType.replace(/_/g, ' ')}
                    </span>
                    <span className={a.xpAwarded >= 0 ? 'text-gold text-xs' : 'text-strength text-xs'}>
                      {a.xpAwarded >= 0 ? '+' : ''}{a.xpAwarded} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
