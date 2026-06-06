import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserRecord } from '@/lib/data';
import AppShell from '@/components/AppShell';
import { Panel, Tag } from '@/components/ui';

export default async function StudyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const record = await getUserRecord();
  const honorific = record?.honorific ?? 'Sir';

  return (
    <AppShell active="study" honorific={honorific}>
      <Panel>
        <Tag color="var(--color-cyan)">The Study</Tag>
        <p className="text-text text-lg font-bold mb-1">Alfred</p>
        <p className="text-muted text-sm">
          Coming in issue #23 — chat with Alfred, {honorific}.
        </p>
      </Panel>
    </AppShell>
  );
}
