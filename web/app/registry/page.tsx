import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireOnboarded, getTracks } from '@/lib/data';
import { getAllTemplates } from '@engine/templates';
import AppShell from '@/components/AppShell';
import { Tag } from '@/components/ui';
import Registry from '@/components/Registry';

export default async function RegistryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const record = await requireOnboarded();
  const honorific = record?.honorific ?? 'Sir';
  const tracks = await getTracks();
  const activeTypes = tracks.filter((t) => t.status === 'active').map((t) => t.templateType);

  const templates = getAllTemplates().map((t) => ({
    type: t.type,
    name: t.name,
    description: t.description,
    popular: t.popular,
    emoji: t.emoji,
  }));

  return (
    <AppShell active="" honorific={honorific}>
      <Tag color="var(--color-phase2)">The Grand Registry</Tag>
      <h1 className="text-text text-2xl font-bold mb-6">Track Templates</h1>
      <Registry templates={templates} activeTypes={activeTypes} />
    </AppShell>
  );
}
