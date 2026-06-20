'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const INTRO =
  'I am Alfred — your personal system butler. I have been designed to serve one purpose: to ensure you become the finest version of yourself. Shall we commence?';

const SEEN_KEY = 'alfred:web_intro_seen';

export default function LandingPage() {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Returning visitors skip the typewriter and see the full line immediately.
    let seen = false;
    try { seen = !!localStorage.getItem(SEEN_KEY); } catch {}
    if (seen) {
      setShown(INTRO);
      setDone(true);
      return;
    }

    let i = 0;
    const t = setInterval(() => {
      i++;
      setShown(INTRO.slice(0, i));
      if (i >= INTRO.length) {
        clearInterval(t);
        setDone(true);
        try { localStorage.setItem(SEEN_KEY, '1'); } catch {}
      }
    }, 26);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
      {/* Crest */}
      <div className="w-24 h-24 rounded-full border-2 border-gold flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(201,168,76,0.35)] animate-[pulse_2.4s_ease-in-out_infinite]">
        <span className="text-gold text-5xl font-bold">A</span>
      </div>
      <p className="text-gold font-mono text-[11px] tracking-[0.3em] uppercase mb-8">Alfred OS · v2.0</p>

      {/* Typewriter intro */}
      <p className="text-text text-base sm:text-lg text-center leading-8 max-w-xl font-mono min-h-[160px] sm:min-h-[120px]">
        {shown}
        {!done && <span className="text-gold">|</span>}
      </p>

      {done && (
        <Link
          href="/login"
          className="border border-gold text-gold font-mono text-xs tracking-[0.2em] uppercase px-12 py-4 mt-6 hover:bg-gold hover:text-bg transition-colors"
        >
          Commence →
        </Link>
      )}

      <p className="text-muted text-[11px] font-mono tracking-wider mt-16">
        ALFRED OS · Built for those who endeavour
      </p>
    </main>
  );
}
