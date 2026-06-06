import Link from 'next/link';

const FEATURES = [
  { emoji: '⚔', title: 'Configurable Tracks', body: 'Hyrox, PMP, coding, marathons, languages — any goal becomes a structured, phased programme.' },
  { emoji: '⚡', title: 'Living D&D Character', body: 'Every session logged earns XP and shapes ability scores derived from your real progress.' },
  { emoji: '✦', title: 'Your Personal Butler', body: 'Alfred briefs you daily, holds you accountable, and answers in impeccable British fashion.' },
  { emoji: '🏆', title: 'Quests, Bounties & Lore', body: 'Daily quests, weekly bounties, rare titles, and sealed lore unlocked through discipline.' },
];

export default function LandingPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        <div className="w-24 h-24 rounded-full border-2 border-gold flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(201,168,76,0.35)]">
          <span className="text-gold text-5xl font-bold">A</span>
        </div>
        <p className="text-gold font-mono text-[11px] tracking-[0.3em] uppercase mb-4">Alfred OS · v2.0</p>
        <h1 className="text-text text-4xl sm:text-6xl font-bold max-w-3xl leading-tight">
          Your personal system butler.
        </h1>
        <p className="text-muted text-base sm:text-lg max-w-xl mt-5 leading-relaxed">
          Part British butler, part Dungeon Master. Alfred tracks your goals, gamifies
          your progress with a living D&amp;D character, and ensures you become the finest
          version of yourself.
        </p>
        <Link
          href="/login"
          className="border border-gold text-gold font-mono text-xs tracking-[0.2em] uppercase px-10 py-4 mt-10 hover:bg-gold hover:text-bg transition-colors"
        >
          Commence →
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="border border-border bg-surface p-6">
              <span className="text-3xl">{f.emoji}</span>
              <h3 className="text-text text-lg font-bold mt-3 mb-1.5">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote / CTA */}
      <section className="border-t border-border px-6 py-20 text-center">
        <p className="text-text text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed italic">
          &quot;I have been designed to serve one purpose: to ensure you become the finest
          version of yourself. Shall we commence?&quot;
        </p>
        <p className="text-gold text-xs mt-3">— Alfred, House Butler &amp; System Overseer</p>
        <Link
          href="/login"
          className="inline-block border border-gold text-gold font-mono text-xs tracking-[0.2em] uppercase px-10 py-4 mt-8 hover:bg-gold hover:text-bg transition-colors"
        >
          Enter The Manor →
        </Link>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center">
        <p className="text-muted text-[11px] font-mono tracking-wider">ALFRED OS · v2.0 · Built for those who endeavour</p>
      </footer>
    </main>
  );
}
