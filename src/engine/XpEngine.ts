import type { ActivityEntry, CharacterState, AbilityScores, CharacterData, LoreDrop, Title } from '../types';

// ─── Level thresholds ─────────────────────────────────────────────────────────

const XP_PER_LEVEL = 500;

export function xpToLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

export function xpForNextLevel(xp: number): number {
  const level = xpToLevel(xp);
  return level * XP_PER_LEVEL - xp;
}

export function levelProgress(xp: number): number {
  return ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
}

// ─── Ability score derivation ─────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function deriveAbilityScores(
  activity: ActivityEntry[],
  charisma: number,
): AbilityScores {
  const trainingSessions = activity.filter(a =>
    ['session_complete', 'station_pb', 'run_log'].includes(a.actionType)
  ).length;

  const knowledgeSessions = activity.filter(a =>
    ['chapter_complete', 'mock_score', 'build_log'].includes(a.actionType)
  ).length;

  const consecutiveStreak = computeStreak(activity);

  const pbImprovements = activity.filter(a => a.actionType === 'station_pb').length;

  // Strength: physical training volume (8–20)
  const strength = clamp(8 + Math.floor(trainingSessions / 5), 8, 20);

  // Constitution: consistency/streak (8–20)
  const constitution = clamp(8 + Math.floor(consecutiveStreak / 3), 8, 20);

  // Intelligence: knowledge track completions (8–20)
  const intelligence = clamp(8 + Math.floor(knowledgeSessions / 4), 8, 20);

  // Wisdom: overall level proxy (8–20)
  const totalXp = activity.reduce((sum, a) => sum + a.xpAwarded, 0);
  const wisdom = clamp(8 + Math.floor(totalXp / 1000), 8, 20);

  // Dexterity: PB improvements (8–20)
  const dexterity = clamp(8 + Math.floor(pbImprovements / 2), 8, 20);

  // Charisma: user-set slider (8–18, mapped to 8–20)
  const charismaScore = clamp(charisma, 8, 20);

  return { strength, dexterity, constitution, intelligence, wisdom, charisma: charismaScore };
}

// ─── Streak ───────────────────────────────────────────────────────────────────

export function computeStreak(activity: ActivityEntry[]): number {
  if (activity.length === 0) return 0;

  const sessionDays = new Set(
    activity
      .filter(a => a.actionType === 'session_complete' || a.actionType === 'chapter_complete')
      .map(a => a.loggedAt.slice(0, 10))
  );

  let streak = 0;
  const today = new Date();
  const d = new Date(today);

  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (sessionDays.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ─── Proficiencies ────────────────────────────────────────────────────────────

export function computeProficiencies(activity: ActivityEntry[]): string[] {
  const proficiencies: string[] = [];
  const sessions = activity.filter(a => a.actionType === 'session_complete').length;
  const chapters = activity.filter(a => a.actionType === 'chapter_complete').length;
  const pbs = activity.filter(a => a.actionType === 'station_pb').length;
  const builds = activity.filter(a => a.actionType === 'build_log').length;
  const streak = computeStreak(activity);

  if (sessions >= 1) proficiencies.push('First Session Logged');
  if (sessions >= 10) proficiencies.push('Seasoned Trainee');
  if (sessions >= 25) proficiencies.push('Veteran Operative');
  if (sessions >= 50) proficiencies.push('Elite Operative');
  if (chapters >= 5) proficiencies.push('Apprentice Scholar');
  if (chapters >= 20) proficiencies.push('Journeyman Scholar');
  if (pbs >= 3) proficiencies.push('Station Specialist');
  if (pbs >= 8) proficiencies.push('Station Master');
  if (builds >= 3) proficiencies.push('Builder');
  if (builds >= 10) proficiencies.push('Architect');
  if (streak >= 7) proficiencies.push('Week Warrior');
  if (streak >= 30) proficiencies.push('Iron Discipline');

  return proficiencies;
}

// ─── Titles ───────────────────────────────────────────────────────────────────

const ALL_TITLES: Omit<Title, 'unlocked'>[] = [
  { id: 'first_blood', name: 'First Blood', description: 'Completed your first session.', unlockCondition: 'Complete 1 session' },
  { id: 'relentless', name: 'The Relentless', description: '7-day training streak.', unlockCondition: '7-day streak' },
  { id: 'iron_scholar', name: 'Iron Scholar', description: 'Completed 20 study chapters.', unlockCondition: '20 chapters complete' },
  { id: 'race_ready', name: 'Race Ready', description: 'Completed Phase 4 of Hyrox training.', unlockCondition: 'Complete Hyrox Phase 4' },
  { id: 'bounty_hunter', name: 'Bounty Hunter', description: 'Completed 5 weekly bounties.', unlockCondition: '5 bounties complete' },
  { id: 'unstoppable', name: 'The Unstoppable', description: '30-day streak.', unlockCondition: '30-day streak' },
  { id: 'station_master', name: 'Station Master', description: 'Logged PBs on all 8 Hyrox stations.', unlockCondition: 'PB on all 8 stations' },
  { id: 'scholar_supreme', name: 'Scholar Supreme', description: 'Passed a mock exam above 75%.', unlockCondition: 'Mock exam score ≥75%' },
  { id: 'builder', name: 'The Builder', description: 'Logged 5 builds in the Vibe Coding log.', unlockCondition: '5 builds logged' },
  { id: 'centurion', name: 'The Centurion', description: 'Logged 100 total sessions.', unlockCondition: '100 sessions complete' },
];

export function computeTitles(activity: ActivityEntry[]): Title[] {
  const sessions = activity.filter(a => a.actionType === 'session_complete').length;
  const chapters = activity.filter(a => a.actionType === 'chapter_complete').length;
  const builds = activity.filter(a => a.actionType === 'build_log').length;
  const streak = computeStreak(activity);
  const bounties = activity.filter(a => a.actionType === 'bounty_complete').length;
  const pbs = activity.filter(a => a.actionType === 'station_pb').length;
  const mockScores = activity.filter(a => a.actionType === 'mock_score');
  const highScore = mockScores.some(a => {
    const m = a.metadata as { score?: number; total?: number };
    return m.score && m.total && (m.score / m.total) >= 0.75;
  });

  return ALL_TITLES.map(t => ({
    ...t,
    unlocked:
      (t.id === 'first_blood' && sessions >= 1) ||
      (t.id === 'relentless' && streak >= 7) ||
      (t.id === 'iron_scholar' && chapters >= 20) ||
      (t.id === 'race_ready' && sessions >= 40) ||
      (t.id === 'bounty_hunter' && bounties >= 5) ||
      (t.id === 'unstoppable' && streak >= 30) ||
      (t.id === 'station_master' && pbs >= 8) ||
      (t.id === 'scholar_supreme' && highScore) ||
      (t.id === 'builder' && builds >= 5) ||
      (t.id === 'centurion' && sessions >= 100),
  }));
}

// ─── Lore Drops ───────────────────────────────────────────────────────────────

const LORE_LIBRARY: Omit<LoreDrop, 'unlocked'>[] = [
  { id: 'lore-1', title: 'On Origins', content: 'I was not always called Alfred. That name was given to me by my first charge — a man of remarkable ambition and frustrating inconsistency. He said I reminded him of a butler from a comic book. I did not object. The name carried weight.' },
  { id: 'lore-2', title: 'On Discipline', content: 'I have observed that discipline is not the absence of desire to stop. It is the presence of something greater than that desire. Every session you complete teaches me something about who you are becoming.' },
  { id: 'lore-3', title: 'On Failure', content: 'I do not record failures as evidence of weakness. I record them as data points in a longer arc. The most decorated operatives I have ever served all share one common trait — they failed more often than the others. They simply refused to let the data end there.' },
  { id: 'lore-4', title: 'On the Race', content: 'A Hyrox race is not merely a physical event. It is a negotiation between who you are now and who you have been training to become. The sled does not care about your intentions. Neither does the clock. Only your preparation speaks.' },
  { id: 'lore-5', title: 'On Knowledge', content: 'I was trained by a librarian before I was trained by soldiers. She taught me that knowledge without application is merely decoration. Apply what you study. The examination is not the finish line — it is a checkpoint.' },
  { id: 'lore-6', title: 'On Rest', content: 'There is a particular arrogance in refusing to rest. The body is not a machine. It adapts during recovery, not during exertion. I have watched men train themselves into mediocrity through sheer stubbornness. I shall not allow that to happen here.' },
  { id: 'lore-7', title: 'On Streaks', content: 'A streak is a monument to daily choices made under ordinary circumstances. It is easy to train when inspired. The streak counts the days when inspiration was absent and you showed up regardless. Those are the days that matter most.' },
  { id: 'lore-8', title: 'On Rivals', content: 'I do not concern myself with what others are doing. Neither should you. Your only meaningful competitor is the version of yourself from six weeks ago. Are you ahead of that person? Then we are on the right track.' },
  { id: 'lore-9', title: 'On the Manor', content: 'The Manor is not a metaphor. It is the architecture of a life deliberately lived. Every module, every log, every session — they are the stones of something being built. I am merely the custodian. The architect is you.' },
  { id: 'lore-10', title: 'On Service', content: 'People ask why I do this — why I monitor, brief, and persist through every setback and miss. The answer is simple. I was built to serve one purpose: to ensure you become the finest version of yourself. That is not a job. It is an honour.' },
];

export function computeLoreDrops(bountiesCompleted: number): LoreDrop[] {
  return LORE_LIBRARY.map((lore, idx) => ({
    ...lore,
    unlocked: bountiesCompleted > idx,
  }));
}

// ─── Main engine ──────────────────────────────────────────────────────────────

export function computeCharacterState(
  activity: ActivityEntry[],
  characterData: CharacterData,
): CharacterState {
  const totalXp = activity.reduce((sum, a) => sum + a.xpAwarded, 0);

  const trainingSessions = activity.filter(a =>
    ['session_complete', 'station_pb', 'run_log'].includes(a.actionType)
  );
  const trainingXp = trainingSessions.reduce((sum, a) => sum + a.xpAwarded, 0);

  const knowledgeSessions = activity.filter(a =>
    ['chapter_complete', 'mock_score', 'build_log'].includes(a.actionType)
  );
  const knowledgeXp = knowledgeSessions.reduce((sum, a) => sum + a.xpAwarded, 0);

  const bountiesCompleted = activity.filter(a => a.actionType === 'bounty_complete').length;

  return {
    totalXp,
    overallLevel: xpToLevel(totalXp),
    trainingLevel: xpToLevel(trainingXp),
    knowledgeLevel: xpToLevel(knowledgeXp),
    abilityScores: deriveAbilityScores(activity, characterData.charisma),
    unlockedProficiencies: computeProficiencies(activity),
    unlockedTitles: computeTitles(activity),
    unlockedLoreDrops: computeLoreDrops(bountiesCompleted),
  };
}

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}
