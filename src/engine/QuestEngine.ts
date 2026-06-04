import type { Track, Quest, ActivityEntry, Honorific } from '../types';
import { getPhasesForTemplate } from './templates';
import { computeStreak } from './XpEngine';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';

const XP_COMPULSORY = 100;
const XP_PENALTY = 75;
const XP_SIDE_QUEST = 60;
const XP_BOUNTY = 200;
const REGRESSION_THRESHOLD = 3; // consecutive missed compulsory quests

// ─── Date helpers ─────────────────────────────────────────────────────────────

function todayISO(): string {
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

function dayOfWeek(): number {
  return new Date().getDay();
}

// ─── Compulsory quest generation ──────────────────────────────────────────────

export function generateCompulsoryQuests(
  userId: string,
  tracks: Track[],
): Quest[] {
  const today = dayOfWeek();
  const quests: Quest[] = [];

  for (const track of tracks) {
    if (track.status !== 'active') continue;
    const phases = getPhasesForTemplate(track.templateType);
    const phase = phases[track.currentPhaseIndex];
    if (!phase) continue;

    const todaySessions = phase.sessions.filter(s => s.dayOfWeek === today);
    for (const session of todaySessions) {
      quests.push({
        id: uuid(),
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
      });
    }
  }

  return quests;
}

// ─── Side quest generation ────────────────────────────────────────────────────

const SIDE_QUEST_TEMPLATES = [
  (track: Track) => ({
    title: 'Extra Mile',
    description: `Log one additional session or task on ${track.name} today.`,
    xpReward: XP_SIDE_QUEST,
  }),
  (track: Track) => ({
    title: 'Reflection Entry',
    description: `Write a short note on your ${track.name} progress today.`,
    xpReward: XP_SIDE_QUEST,
  }),
  () => ({
    title: 'Early Bird',
    description: 'Log any activity before 9am today.',
    xpReward: XP_SIDE_QUEST + 20,
  }),
  () => ({
    title: 'Hydration Protocol',
    description: 'Drink 2.5L of water today. Log it as a session.',
    xpReward: XP_SIDE_QUEST,
  }),
  () => ({
    title: 'Mobility Work',
    description: '15 minutes of stretching or mobility work. Log it.',
    xpReward: XP_SIDE_QUEST,
  }),
];

export function generateSideQuests(
  userId: string,
  tracks: Track[],
): Quest[] {
  const activeTracks = tracks.filter(t => t.status === 'active');
  if (activeTracks.length === 0) return [];

  // Pick 2 side quests per day
  const quests: Quest[] = [];
  const templateIdx = new Date().getDate() % SIDE_QUEST_TEMPLATES.length;
  const track = activeTracks[new Date().getDay() % activeTracks.length];

  for (let i = 0; i < 2; i++) {
    const idx = (templateIdx + i) % SIDE_QUEST_TEMPLATES.length;
    const data = SIDE_QUEST_TEMPLATES[idx](track);
    quests.push({
      id: uuid(),
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
  (track: Track) => ({
    title: 'Full Week Commitment',
    description: `Complete every scheduled session on ${track.name} this week. Not one missed.`,
    xpReward: XP_BOUNTY,
  }),
  (track: Track) => ({
    title: 'Push Your Limits',
    description: `Log a personal best or high score on ${track.name} this week.`,
    xpReward: XP_BOUNTY,
  }),
  () => ({
    title: 'The Early Campaign',
    description: 'Log activity every morning this week before 9am.',
    xpReward: XP_BOUNTY + 50,
  }),
  () => ({
    title: 'No Excuses Week',
    description: 'Complete all compulsory quests every single day this week.',
    xpReward: XP_BOUNTY + 100,
  }),
];

export function generateWeeklyBounties(
  userId: string,
  tracks: Track[],
): Quest[] {
  const activeTracks = tracks.filter(t => t.status === 'active');
  if (activeTracks.length === 0) return [];

  const quests: Quest[] = [];
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));

  for (let i = 0; i < Math.min(2, activeTracks.length); i++) {
    const track = activeTracks[i];
    const templateIdx = (weekNum + i) % BOUNTY_TEMPLATES.length;
    const data = BOUNTY_TEMPLATES[templateIdx](track);
    quests.push({
      id: uuid(),
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

// ─── Midnight evaluation ──────────────────────────────────────────────────────

export interface QuestEvaluationResult {
  penaltyEntries: ActivityEntry[];
  updatedQuests: Quest[];
  rebukes: string[];
  shouldRegress: boolean;
}

export function evaluateMissedQuests(
  userId: string,
  quests: Quest[],
  activity: ActivityEntry[],
  honorific: Honorific,
): QuestEvaluationResult {
  const today = todayISO();
  const penaltyEntries: ActivityEntry[] = [];
  const rebukes: string[] = [];

  const updatedQuests = quests.map(q => {
    if (q.status !== 'active') return q;
    if (q.type !== 'compulsory') return { ...q, status: 'expired' as const };

    // Check if completed today
    const wasCompleted = activity.some(
      a => a.actionType === 'quest_complete' && a.metadata?.questId === q.id
    );

    if (wasCompleted) return q;

    // Mark missed and create penalty
    const penalty: ActivityEntry = {
      id: uuid(),
      userId,
      trackId: q.trackId,
      actionType: 'quest_missed',
      metadata: { questId: q.id, questTitle: q.title, penalty: q.xpPenalty },
      xpAwarded: -q.xpPenalty,
      loggedAt: new Date().toISOString(),
    };
    penaltyEntries.push(penalty);

    const rebuke = generateRebuke(honorific, q.title, q.xpPenalty);
    rebukes.push(rebuke);

    return { ...q, status: 'missed' as const };
  });

  // Check for regression
  const recentActivity = activity.filter(a => {
    const daysAgo = (Date.now() - new Date(a.loggedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= REGRESSION_THRESHOLD && a.actionType === 'quest_missed';
  });
  const shouldRegress = recentActivity.length >= REGRESSION_THRESHOLD;

  return { penaltyEntries, updatedQuests, rebukes, shouldRegress };
}

// ─── Alfred rebukes ───────────────────────────────────────────────────────────

const REBUKE_TEMPLATES = [
  (honorific: Honorific, title: string, xp: number) =>
    `A disappointing evening, ${honorific}. "${title}" was left unfinished. Your negligence has cost you ${xp} XP. I trust tomorrow will be different.`,
  (honorific: Honorific, title: string, xp: number) =>
    `I must register my displeasure, ${honorific}. "${title}" was not completed. ${xp} XP has been deducted. The System does not forget.`,
  (honorific: Honorific, title: string, xp: number) =>
    `Most unfortunate, ${honorific}. "${title}" remained outstanding at midnight. A penalty of ${xp} XP has been applied. Shall we do better tomorrow?`,
];

export function generateRebuke(honorific: Honorific, questTitle: string, xp: number): string {
  const idx = Math.floor(Math.random() * REBUKE_TEMPLATES.length);
  return REBUKE_TEMPLATES[idx](honorific, questTitle, xp);
}

// ─── Victory speeches ─────────────────────────────────────────────────────────

const VICTORY_SPEECHES = [
  (honorific: Honorific, title: string) =>
    `Exceptional, ${honorific}. "${title}" has been completed with distinction. The System is impressed.`,
  (honorific: Honorific, title: string) =>
    `Well done, ${honorific}. "${title}" is struck from the board. You are building something formidable.`,
  (honorific: Honorific, title: string) =>
    `Outstanding, ${honorific}. "${title}" complete. I have updated your records accordingly. Carry on.`,
  (honorific: Honorific, title: string) =>
    `Splendid work, ${honorific}. "${title}" defeated. Your character grows stronger by the day.`,
];

export function generateVictorySpeech(honorific: Honorific, questTitle: string): string {
  const idx = Math.floor(Math.random() * VICTORY_SPEECHES.length);
  return VICTORY_SPEECHES[idx](honorific, questTitle);
}

// ─── Streak multiplier ────────────────────────────────────────────────────────

export function applyStreakMultiplier(baseXp: number, activity: ActivityEntry[]): number {
  const streak = computeStreak(activity);
  if (streak >= 30) return Math.round(baseXp * 2.0);
  if (streak >= 14) return Math.round(baseXp * 1.5);
  if (streak >= 7) return Math.round(baseXp * 1.25);
  return baseXp;
}
