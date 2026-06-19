import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireOnboarded } from '@/lib/data';
import { logout } from '@/app/actions/auth';
import AppShell from '@/components/AppShell';
import { Panel, Tag } from '@/components/ui';
import ArmourySettings from '@/components/ArmourySettings';
import StartAnew from '@/components/StartAnew';

export default async function ArmouryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const record = await requireOnboarded();
  const honorific = record?.honorific ?? 'Sir';

  return (
    <AppShell active="" honorific={honorific}>
      <Tag color="var(--color-gold)">The Armoury</Tag>
      <h1 className="text-text text-2xl font-bold mb-6">Settings</h1>

      <div className="max-w-md flex flex-col gap-4">
        <Panel>
          <Tag color="var(--color-gold)">Identity</Tag>
          <div className="mt-2">
            <ArmourySettings
              initial={{
                honorific,
                name: record?.characterData.name ?? '',
                career: record?.characterData.career ?? '',
              }}
            />
          </div>
        </Panel>

        <Panel>
          <Tag>Account</Tag>
          <p className="text-text text-sm mt-2">{user.email}</p>
          <p className="text-muted text-[11px] mt-1 mb-3">
            Synced to the same vault as your mobile app.
          </p>
          <form action={logout}>
            <button className="border border-border text-muted font-mono text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 hover:border-strength hover:text-strength transition-colors">
              Sign Out
            </button>
          </form>
        </Panel>

        <Panel>
          <Tag color="var(--color-strength)">Danger Zone</Tag>
          <p className="text-muted text-[11px] mt-2 mb-3">
            Sign Out keeps your data. Start Anew erases everything and restarts onboarding —
            your login stays the same.
          </p>
          <StartAnew honorific={honorific} />
        </Panel>
      </div>
    </AppShell>
  );
}
