import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ensureUserRecord } from '@/lib/data';
import { getAllTemplates } from '@engine/templates';
import OnboardingFlow from '@/components/OnboardingFlow';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const record = await ensureUserRecord();
  if (record?.onboardingComplete) redirect('/manor');

  const templates = getAllTemplates().map((t) => ({
    type: t.type,
    name: t.name,
    description: t.description,
    popular: t.popular,
    emoji: t.emoji,
  }));

  return (
    <div className="flex-1 flex flex-col">
      <OnboardingFlow templates={templates} email={user.email ?? ''} />
    </div>
  );
}
