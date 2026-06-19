import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireOnboarded, getTracks } from '@/lib/data';
import { getTemplate } from '@engine/templates';
import AppShell from '@/components/AppShell';
import { Panel, Tag } from '@/components/ui';

export default async function CodexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const record = await requireOnboarded();
  const honorific = record?.honorific ?? 'Sir';
  const tracks = (await getTracks()).filter((t) => t.status === 'active');

  return (
    <AppShell active="" honorific={honorific}>
      <Tag color="var(--color-blue)">The Codex</Tag>
      <h1 className="text-text text-2xl font-bold mb-6">Resource Library</h1>

      {tracks.length === 0 ? (
        <Panel>
          <p className="text-muted text-sm">
            No active tracks, {honorific}. Resources appear here once you begin a track.
          </p>
        </Panel>
      ) : (
        <div className="flex flex-col gap-4">
          {tracks.map((track) => {
            const resources = getTemplate(track.templateType).resources;
            return (
              <Panel key={track.id}>
                <Tag color="var(--color-blue)">{track.templateType}</Tag>
                <p className="text-text font-bold mb-3">{track.name}</p>
                <div className="flex flex-col">
                  {resources.map((r, i) =>
                    r.url ? (
                      <a
                        key={i}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 py-2.5 border-b border-border last:border-0 hover:px-1 transition-all"
                      >
                        <span className="w-1 h-1 rounded-full bg-gold mt-2 shrink-0" />
                        <span className="flex-1">
                          <span className="block text-text text-sm font-medium">{r.title}</span>
                          {r.notes && <span className="block text-muted text-[11px] mt-0.5">{r.notes}</span>}
                        </span>
                        <span className="text-muted">→</span>
                      </a>
                    ) : (
                      <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
                        <span className="w-1 h-1 rounded-full bg-gold mt-2 shrink-0" />
                        <span className="flex-1">
                          <span className="block text-text text-sm font-medium">{r.title}</span>
                          {r.notes && <span className="block text-muted text-[11px] mt-0.5">{r.notes}</span>}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
