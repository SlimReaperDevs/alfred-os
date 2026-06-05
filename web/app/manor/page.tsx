import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/actions/auth';

export default async function ManorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <main className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-gold flex items-center justify-center">
            <span className="text-gold font-bold">A</span>
          </div>
          <div>
            <p className="text-muted font-mono text-[10px] tracking-[0.2em] uppercase">
              Alfred OS · The Manor
            </p>
            <p className="text-text text-sm">{user.email}</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="border border-border text-muted font-mono text-[10px] tracking-[0.2em] uppercase px-4 py-2 hover:border-gold hover:text-gold transition-colors"
          >
            Sign Out
          </button>
        </form>
      </header>

      {/* Authenticated shell placeholder */}
      <div className="border border-border bg-surface p-8">
        <p className="text-gold font-mono text-[10px] tracking-[0.2em] uppercase mb-2">
          System Online
        </p>
        <h1 className="text-text text-2xl font-bold mb-3">
          Good day. You are authenticated.
        </h1>
        <p className="text-muted text-sm leading-relaxed max-w-xl">
          This is the authenticated shell of Alfred Web. Your account is connected
          to the same Supabase backend as the mobile app — your tracks, character,
          and progress will appear here once the dashboard, Battlegrounds, Study,
          and Hall of Records are built (issues #21–#25).
        </p>
      </div>
    </main>
  );
}
