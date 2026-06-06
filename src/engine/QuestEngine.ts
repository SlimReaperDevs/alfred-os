// Platform-agnostic quest engine. No platform-specific imports — the
// `react-native-get-random-values` polyfill lives at the mobile App.tsx entry
// point, so this module is safely shared with the Next.js web app.
import type { Track, Quest, ActivityEntry, Honorific } from '../types';
import { getPhasesForTemplate } from './templates';
import { computeStreak } from './XpEngine';
import { generateId } from './id';

const XP_COMPULSORY = 100;
const XP_PENALTY = 75;
const XP_SIDE_QUEST = 60;
const XP_BOUNTY = 200;

// Regression triggers after this many missed compulsory quests within the window.
const REGRESSION_WINDOW_DAYS = 7;
const REGRESSION_COUNT = 3;

// ─── Date helpers ─────────────────────────────────────────────────────────────

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function endOfToday(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function endOfWeekSunday(): string {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() + (7 - day));
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function weekNumber(): number {
  return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
}

// ─── Compulsory quest generation (deterministic ids → idempotent) ──────────────

export function generateCompulsoryQuests(userId: string, tracks: Track[]): Quest[] {
  const today = new Date().getDay();
  const dateKey = todayKey();
  const quests: Quest[] = [];

  for (const track of tracks) {
    if (track.status !== 'active') continue;
    const phase = getPhasesForTemplate(track.templateType)[track.currentPhaseIndex];
    if (!phase) continue;

    for (const session of phase.sessions.filter((s) => s.dayOfWeek === today)) {
      quests.push({
        id: `cq-${dateKey}-${track.id}-${session.id}`,
        userId,
        trackId: track.id,
        type: 'compulsory',
        title: session.title,
        description: session.description,
        xpReward: session.xpReward ?? XP_COMPULSORY,
        xpPenalty: XP_PENALTY,
        status: 'active',
        dueDate: endOfToday(),
        completedAt: null,
        sessionId: session.id,
      });
    }
  }
  return quests;
}

// ─── Side quest generation ────────────────────────────────────────────────────

const SIDE_QUEST_TEMPLATES = [
  (t: Track) => ({ title: 'Extra Mile', description: `Log an additional session on ${t.name} today.`, xpReward: XP_SIDE_QUEST }),
  (t: Track) => ({ title: 'Reflection Entry', description: `Note your ${t.name} progress today.`, xpReward: XP_SIDE_QUEST }),
  () => ({ title: 'Early Bird', description: 'Log any activity before 9am today.', xpReward: XP_SIDE_QUEST + 20 }),
  () => ({ title: 'Hydration Protocol', description: 'Drink 2.5L of water today.', xpReward: XP_SIDE_QUEST }),
  () => ({ title: 'Mobility Work', description: '15 minutes of stretching or mobility work.', xpReward: XP_SIDE_QUEST }),
];

export function generateSideQuests(userId: string, tracks: Track[]): Quest[] {
  const activeTracks = tracks.filter((t) => t.status === 'active');
  if (activeTracks.length === 0) return [];

  const dateKey = todayKey();
  const baseIdx = new Date().getDate() % SIDE_QUEST_TEMPLATES.length;
  const track = activeTracks[new Date().getDay() % activeTracks.length];
  const quests: Quest[] = [];

  for (let i = 0; i < 2; i++) {
    const idx = (baseIdx + i) % SIDE_QUEST_TEMPLATES.length;
    const data = SIDE_QUEST_TEMPLATES[idx](track);
    quests.push({
      id: `sq-${dateKey}-${idx}`,
      userId,
      trackId: track.id,
      type: 'side',
      title: data.title,
      description: data.description,
      xpReward: data.xpReward,
      xpPenalty: 0,
      status: 'active',
      dueDate: endOfToday(),
      completedAt: null,
    });
  }
  return quests;
}

// ─── Weekly bounty generation ─────────────────────────────────────────────────

const BOUNTY_TEMPLATES = [
  (t: Track) => ({ title: 'Full Week Commitment', description: `Complete every scheduled session on ${t.name} this week.`, xpReward: XP_BOUNTY }),
  (t: Track) => ({ title: 'Push Your Limits', description: `Log a personal best or high score on ${t.name} this week.`, xpReward: XP_BOUNTY }),
  () => ({ title: 'The Early Campaign', description: 'Log activity every morning this week before 9am.', xpReward: XP_BOUNTY + 50 }),
  () => ({ title: 'No Excuses Week', description: 'Complete all compulsory quests every single day this week.', xpReward: XP_BOUNTY + 100 }),
];

export function generateWeeklyBounties(userId: string, tracks: Track[]): Quest[] {
  const activeTracks = tracks.filter((t) => t.status === 'active');
  if (activeTracks.length === 0) return [];

  const week = weekNumber();
  const quests: Quest[] = [];
  for (let i = 0; i < Math.min(2, activeTracks.length); i++) {
    const track = activeTracks[i];
    const idx = (week + i) % BOUNTY_TEMPLATES.length;
    const data = BOUNTY_TEMPLATES[idx](track);
    quests.push({
      id: `wb-${week}-${track.id}-${idx}`,
      userId,
      trackId: track.id,
      type: 'bounty',
      title: data.title,
      description: data.description,
      xpReward: data.xpReward,
      xpPenalty: 0,
      status: 'active',
      dueDate: endOfWeekSunday(),
      completedAt: null,
    });
  }
  return quests;
}

// ─── Reconciliation: completion + misses in one pass ───────────────────────────

export interface ReconcileResult {
  quests: Quest[];
  penalties: ActivityEntry[];
  rebukes: string[];
  shouldRegress: boolean;
}

function loggedToday(activity: ActivityEntry[]): ActivityEntry[] {
  const key = todayKey();
  return activity.filter((a) => a.loggedAt.slice(0, 10) === key);
}

/**
 * Reconciles persisted quests against the activity log:
 *  - compulsory quests auto-complete when their session is logged today
 *  - past-due active compulsory quests become 'missed' (penalty emitted once)
 *  - past-due side/bounty quests expire
 * Pure: returns new quest objects + any penalty entries to persist.
 */
export function reconcileQuests(
  userId: string,
  quests: Quest[],
  activity: ActivityEntry[],
  honorific: Honorific,
): ReconcileResult {
  const now = Date.now();
  const todays = loggedToday(activity);
  const penalties: ActivityEntry[] = [];
  const rebukes: string[] = [];

  const updated = quests.map((q): Quest => {
    if (q.status !== 'active') return q;

    // Auto-complete compulsory quests when the matching session is logged today
    if (q.type === 'compulsory') {
      const done = todays.some(
        (a) =>
          a.actionType === 'session_complete' &&
          (a.metadata?.sessionId === q.sessionId ||
            (a.trackId === q.trackId && a.metadata?.title === q.title)),
      );
      if (done) return { ...q, status: 'completed', completedAt: new Date().toISOString() };
    }

    // Past-due handling
    if (new Date(q.dueDate).getTime() < now) {
      if (q.type === 'compulsory' && !q.penaltyApplied) {
        penalties.push({
          id: generateId(),
          userId,
          trackId: q.trackId,
          actionType: 'quest_missed',
          metadata: { questId: q.id, questTitle: q.title, penalty: q.xpPenalty },
          xpAwarded: -q.xpPenalty,
          loggedAt: new Date().toISOString(),
        });
        rebukes.push(generateRebuke(honorific, q.title, q.xpPenalty));
        return { ...q, status: 'missed', penaltyApplied: true };
      }
      if (q.type !== 'compulsory') return { ...q, status: 'expired' };
    }

    return q;
  });

  // Regression: enough missed compulsory quests inside the recent window
  const windowMs = REGRESSION_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const recentMisses = [...activity, ...penalties].filter(
    (a) => a.actionType === 'quest_missed' && now - new Date(a.loggedAt).getTime() <= windowMs,
  );
  const shouldRegress = recentMisses.length >= REGRESSION_COUNT;

  return { quests: updated, penalties, rebukes, shouldRegress };
}

// ─── Alfred rebukes ───────────────────────────────────────────────────────────

const REBUKE_TEMPLATES = [
  (h: Honorific, t: string, xp: number) => `A disappointing evening, ${h}. "${t}" was left unfinished. Your negligence has cost you ${xp} XP. I trust tomorrow will be different.`,
  (h: Honorific, t: string, xp: number) => `I must register my displeasure, ${h}. "${t}" was not completed. ${xp} XP has been deducted. The System does not forget.`,
  (h: Honorific, t: string, xp: number) => `Most unfortunate, ${h}. "${t}" remained outstanding at midnight. A penalty of ${xp} XP has been applied. Shall we do better tomorrow?`,
];

export function generateRebuke(honorific: Honorific, questTitle: string, xp: number): string {
  return REBUKE_TEMPLATES[Math.floor(Math.random() * REBUKE_TEMPLATES.length)](honorific, questTitle, xp);
}

// ─── Victory speeches ─────────────────────────────────────────────────────────

const VICTORY_SPEECHES = [
  (h: Honorific, t: string) => `Exceptional, ${h}. "${t}" has been completed with distinction. The System is impressed.`,
  (h: Honorific, t: string) => `Well done, ${h}. "${t}" is struck from the board. You are building something formidable.`,
  (h: Honorific, t: string) => `Outstanding, ${h}. "${t}" complete. I have updated your records accordingly. Carry on.`,
  (h: Honorific, t: string) => `Splendid work, ${h}. "${t}" defeated. Your character grows stronger by the day.`,
];

export function generateVictorySpeech(honorific: Honorific, questTitle: string): string {
  return VICTORY_SPEECHES[Math.floor(Math.random() * VICTORY_SPEECHES.length)](honorific, questTitle);
}

// ─── Streak multiplier ────────────────────────────────────────────────────────

export function applyStreakMultiplier(baseXp: number, activity: ActivityEntry[]): number {
  const streak = computeStreak(activity);
  if (streak >= 30) return Math.round(baseXp * 2.0);
  if (streak >= 14) return Math.round(baseXp * 1.5);
  if (streak >= 7) return Math.round(baseXp * 1.25);
  return baseXp;
}
