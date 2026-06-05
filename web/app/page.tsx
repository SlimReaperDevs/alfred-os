import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 rounded-full border-2 border-gold flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(201,168,76,0.35)]">
        <span className="text-gold text-5xl font-bold">A</span>
      </div>

      <p className="text-gold font-mono text-[11px] tracking-[0.3em] uppercase mb-4">
        Alfred OS · v2.0
      </p>

      <h1 className="text-text text-4xl sm:text-5xl font-bold max-w-2xl leading-tight">
        Your personal system butler.
      </h1>

      <p className="text-muted text-base sm:text-lg max-w-xl mt-5 leading-relaxed">
        Part British butler, part Dungeon Master. Alfred tracks your goals,
        gamifies your progress with a living D&amp;D character, and ensures you
        become the finest version of yourself.
      </p>

      <div className="flex gap-4 mt-10">
        <Link
          href="/login"
          className="border border-gold text-gold font-mono text-xs tracking-[0.2em] uppercase px-8 py-4 hover:bg-gold hover:text-bg transition-colors"
        >
          Commence →
        </Link>
      </div>

      <p className="text-muted text-xs mt-12 max-w-md">
        &quot;I have been designed to serve one purpose: to ensure you become the
        finest version of yourself.&quot;
        <span className="block mt-1 text-gold/70">— Alfred, House Butler &amp; System Overseer</span>
      </p>
    </main>
  );
}
