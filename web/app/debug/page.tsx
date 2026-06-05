import { redirect } from 'next/navigation';
import { getUserRecord, getActivity, getTracks } from '@/lib/data';
import { computeCharacterState, abilityModifier } from '@engine/XpEngine';
import { createClient } from '@/lib/supabase/server';
import type { CharacterData } from '@shared/types';

const DEFAULT_CHARACTER: CharacterData = {
  name: '',
  career: '',
  age: null,
  height: null,
  weight: null,
  hobbies: '',
  backstory: '',
  charisma: 10,
};

/**
 * Debug / verification route for issue #20.
 * Reads the authenticated user's real Supabase data and runs it through the
 * SHARED XP engine (imported from ../src/engine) to render character state.
 */
export default async function DebugPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [userRecord, activity, tracks] = await Promise.all([
    getUserRecord(),
    getActivity(),
    getTracks(),
  ]);

  const characterData = userRecord?.characterData ?? DEFAULT_CHARACTER;
  const state = computeCharacterState(activity, characterData);

  return (
    <main className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full">
      <p className="text-gold font-mono text-[10px] tracking-[0.2em] uppercase mb-1">
        Debug · Issue #20 Verification
      </p>
      <h1 className="text-text text-2xl font-bold mb-6">Shared Engine + Data Layer</h1>

      {/* Pipeline status */}
      <section className="border border-border bg-surface p-5 mb-4">
        <p className="text-muted font-mono text-[10px] tracking-[0.2em] uppercase mb-3">
          Pipeline
        </p>
        <ul className="text-sm space-y-1.5">
          <li className="text-run">✓ Authenticated as {user.email}</li>
          <li className="text-run">
            ✓ Read {activity.length} activity row(s) from Supabase (RLS-scoped)
          </li>
          <li className="text-run">✓ Read {tracks.length} track(s) from Supabase</li>
          <li className="text-run">
            ✓ Computed character via shared engine (imported from ../src/engine)
          </li>
          <li className={userRecord ? 'text-run' : 'text-muted'}>
            {userRecord ? '✓' : '·'} User record:{' '}
            {userRecord ? userRecord.displayName || userRecord.honorific : 'none yet'}
          </li>
        </ul>
      </section>

      {/* Computed character state */}
      <section className="border border-border bg-surface p-5 mb-4">
        <p className="text-muted font-mono text-[10px] tracking-[0.2em] uppercase mb-3">
          Computed Character State
        </p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Stat label="Overall" value={`LV ${state.overallLevel}`} />
          <Stat label="Training" value={`LV ${state.trainingLevel}`} />
          <Stat label="Knowledge" value={`LV ${state.knowledgeLevel}`} />
        </div>
        <p className="text-muted text-xs mb-3">Total XP: {state.totalXp}</p>

        <p className="text-muted font-mono text-[10px] tracking-[0.2em] uppercase mb-2">
          Ability Scores
        </p>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(state.abilityScores).map(([k, v]) => {
            const mod = abilityModifier(v);
            return (
              <div key={k} className="border border-border p-2 text-center">
                <div className="text-muted text-[9px] uppercase tracking-wider">
                  {k.slice(0, 3)}
                </div>
                <div className="text-text text-lg font-bold">{v}</div>
                <div className="text-muted text-xs">
                  {mod >= 0 ? `+${mod}` : mod}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-muted text-xs">
        This route confirms the web app imports the same engine code the mobile app
        uses and reads live data through the web data layer. It will be removed once
        the real screens (#21–#25) are built.
      </p>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-3 text-center">
      <div className="text-muted text-[9px] uppercase tracking-wider mb-1">{label}</div>
      <div className="text-gold text-lg font-bold">{value}</div>
    </div>
  );
}
