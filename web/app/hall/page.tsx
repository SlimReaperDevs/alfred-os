import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserRecord } from '@/lib/data';
import AppShell from '@/components/AppShell';
import { Panel, Tag } from '@/components/ui';

export default async function HallPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const record = await getUserRecord();
  const honorific = record?.honorific ?? 'Sir';

  return (
    <AppShell active="hall" honorific={honorific}>
      <Panel>
        <Tag color="var(--color-phase2)">The Hall of Records</Tag>
        <p className="text-text text-lg font-bold mb-1">Character Sheet</p>
        <p className="text-muted text-sm">
          Coming in issue #24 — your D&amp;D character, {honorific}.
        </p>
      </Panel>
    </AppShell>
  );
}
