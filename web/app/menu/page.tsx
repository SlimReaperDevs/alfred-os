import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ensureUserRecord } from '@/lib/data';
import AppShell from '@/components/AppShell';
import { Tag } from '@/components/ui';

const ITEMS = [
  { href: '/codex', label: 'The Codex', sub: 'Resource library per track', color: 'var(--color-blue)' },
  { href: '/armoury', label: 'The Armoury', sub: 'Settings & preferences', color: 'var(--color-gold)' },
  { href: '/registry', label: 'The Grand Registry', sub: 'Browse & add track templates', color: 'var(--color-phase2)' },
  { href: '/ledger', label: 'The Ledger', sub: 'Data export & backup', color: 'var(--color-cyan)' },
  { href: '/guildhall', label: 'The Guildhall', sub: 'Help, about & onboarding', color: 'var(--color-run)' },
];

export default async function MenuPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const record = await ensureUserRecord();
  const honorific = record?.honorific ?? 'Sir';

  return (
    <AppShell active="" honorific={honorific}>
      <div className="max-w-lg mx-auto">
        <Tag color="var(--color-gold)">The Heraldic Menu</Tag>
        <h1 className="text-text text-2xl font-bold mb-6">How may I assist, {honorific}?</h1>
        <div className="flex flex-col">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 py-4 border-b border-border hover:px-2 transition-all"
            >
              <span className="w-1 h-8 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="flex-1">
                <span className="block text-text font-semibold">{item.label}</span>
                <span className="block text-muted text-xs">{item.sub}</span>
              </span>
              <span className="text-muted">›</span>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
