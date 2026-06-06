import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ensureUserRecord, getTracks, getActivity, getResources } from '@/lib/data';
import AppShell from '@/components/AppShell';
import { Panel, Tag } from '@/components/ui';
import LedgerExport from '@/components/LedgerExport';

export default async function LedgerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [record, tracks, activity, resources] = await Promise.all([
    ensureUserRecord(), getTracks(), getActivity(), getResources(),
  ]);
  const honorific = record?.honorific ?? 'Sir';

  const json = JSON.stringify(
    { user: record, tracks, activity, resources, exportedAt: new Date().toISOString() },
    null,
    2,
  );

  return (
    <AppShell active="" honorific={honorific}>
      <Tag color="var(--color-cyan)">The Ledger</Tag>
      <h1 className="text-text text-2xl font-bold mb-6">Data &amp; Backup</h1>

      <div className="max-w-md flex flex-col gap-4">
        <Panel>
          <Tag color="var(--color-cyan)">Export</Tag>
          <p className="text-muted text-sm my-3">
            Download all your data as a JSON file — character, tracks, activity, and
            resources. {tracks.length} track(s), {activity.length} activity entries.
          </p>
          <LedgerExport json={json} />
        </Panel>

        <Panel>
          <Tag>Cloud Backup</Tag>
          <p className="text-muted text-sm mt-2">
            Your data lives in Supabase and is always backed up automatically, {honorific}.
            No manual sync required on the web.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
