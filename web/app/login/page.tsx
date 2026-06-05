'use client';

import { useActionState, useState } from 'react';
import { login, signup, type AuthResult } from '@/app/actions/auth';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const action = mode === 'login' ? login : signup;
  const [state, formAction, pending] = useActionState<AuthResult, FormData>(action, {});

  return (
    <main className="flex-1 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Crest */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(201,168,76,0.35)]">
            <span className="text-gold text-4xl font-bold">A</span>
          </div>
          <p className="text-gold font-mono text-[10px] tracking-[0.25em] uppercase">
            Alfred OS · v2.0
          </p>
          <h1 className="text-text text-xl font-semibold mt-2">
            {mode === 'login' ? 'Welcome back.' : 'Forge your account.'}
          </h1>
          <p className="text-muted text-sm mt-1 text-center">
            {mode === 'login'
              ? 'Sign in and the System will resume.'
              : 'Create an account to commence your service.'}
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="flex flex-col gap-3">
          <div>
            <label className="text-muted font-mono text-[10px] tracking-[0.2em] uppercase block mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full bg-surface border border-border text-text px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-muted font-mono text-[10px] tracking-[0.2em] uppercase block mb-1">
              Passphrase
            </label>
            <input
              name="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              className="w-full bg-surface border border-border text-text px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
              placeholder="••••••••"
            />
          </div>

          {state.error && (
            <p className="text-strength text-xs border border-strength/40 bg-strength/10 px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="border border-gold text-gold font-mono text-xs tracking-[0.2em] uppercase py-3.5 mt-2 hover:bg-gold hover:text-bg transition-colors disabled:opacity-50"
          >
            {pending
              ? 'Engaging…'
              : mode === 'login'
                ? 'Sign In →'
                : 'Create Account →'}
          </button>
        </form>

        {/* Mode toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-muted text-xs hover:text-gold transition-colors"
          >
            {mode === 'login'
              ? "No account yet? Forge one."
              : 'Already in service? Sign in.'}
          </button>
        </div>
      </div>
    </main>
  );
}
