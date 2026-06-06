import Link from 'next/link';
import { logout } from '@/app/actions/auth';

const NAV = [
  { key: 'manor', label: 'The Manor', href: '/manor' },
  { key: 'battlegrounds', label: 'The Battlegrounds', href: '/battlegrounds' },
  { key: 'study', label: 'The Study', href: '/study' },
  { key: 'hall', label: 'The Hall of Records', href: '/hall' },
];

export default function AppShell({
  active,
  honorific,
  children,
}: {
  active: string;
  honorific: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-surface/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/menu" className="flex items-center gap-3 group" title="The Heraldic Menu">
            <div className="w-9 h-9 rounded-full border border-gold flex items-center justify-center group-hover:shadow-[0_0_14px_rgba(201,168,76,0.5)] transition-shadow">
              <span className="text-gold font-bold">A</span>
            </div>
            <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-text hidden sm:block">
              Alfred <span className="text-gold">OS</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`px-3 py-2 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors ${
                  active === item.key
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-muted hover:text-text'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form action={logout}>
            <button
              type="submit"
              className="border border-border text-muted font-mono text-[10px] tracking-[0.15em] uppercase px-3 py-2 hover:border-gold hover:text-gold transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center overflow-x-auto border-t border-border px-2">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`px-3 py-2.5 font-mono text-[9px] tracking-[0.1em] uppercase whitespace-nowrap transition-colors ${
                active === item.key ? 'text-gold' : 'text-muted'
              }`}
            >
              {item.label.replace('The ', '')}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
