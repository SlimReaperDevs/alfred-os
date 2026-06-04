import type { Track, ActivityEntry, Quest, Honorific } from '../types';
import { computeStreak, xpToLevel } from './XpEngine';
import { getPhasesForTemplate } from './templates';

// ─── Context ──────────────────────────────────────────────────────────────────

export interface AlfredContext {
  honorific: Honorific;
  displayName: string;
  tracks: Track[];
  activity: ActivityEntry[];
  activeQuests: Quest[];
  totalXp: number;
  overallLevel: number;
}

export interface AlfredResponse {
  text: string;
  intent: string;
}

// ─── Intent patterns ──────────────────────────────────────────────────────────

const INTENTS = [
  { name: 'greeting',       patterns: [/^(hello|hi|hey|good\s*(morning|evening|afternoon|night)|greetings|sup|yo)/i] },
  { name: 'how_am_i',       patterns: [/how\s*(am\s*i|are\s*we|is\s*my|'?s\s*my)\s*(doing|going|progress|training|prep)/i, /status\s*report/i, /progress\s*update/i, /how.*look/i] },
  { name: 'train_today',    patterns: [/what\s*(should|do)\s*i\s*(train|do|work(out)?|exercise)/i, /today('?s)?\s*(session|training|workout|exercise)/i, /train.*today/i] },
  { name: 'quest_status',   patterns: [/quest|mission|task.*today|what.*complete|daily.*mission/i] },
  { name: 'pmp_advice',     patterns: [/pmp|project\s*management|exam\s*(tip|advice|help|prep)|study\s*tip/i] },
  { name: 'po_advice',      patterns: [/product\s*owner|po\s*(advice|tip|help|learning)|frontend|coding|build/i] },
  { name: 'motivation',     patterns: [/motivat|inspire|encourage|pump\s*me\s*up|give\s*me.*push|i\s*(feel|am)\s*(tired|exhausted|unmotivated|lazy)/i] },
  { name: 'nutrition',      patterns: [/nutri|eat|food|diet|meal|protein|carb|supplement|creatine|fuel/i] },
  { name: 'race_strategy',  patterns: [/race\s*(strategy|plan|day|tips?|advice|prep)/i, /hyrox\s*(tips?|advice|strategy)/i, /station|sled|skierg|wall\s*ball|rowing|burpee|sandbag|farmer/i] },
  { name: 'race_day',       patterns: [/race\s*day|when.*race|how.*long.*race|countdown/i] },
  { name: 'rest_recovery',  patterns: [/rest|recover|sleep|sore|tired|exhausted|overtraining|tak(e|ing)\s*a\s*day\s*off/i] },
  { name: 'injury',         patterns: [/injur|pain|hurt|knee|back\s*pain|shin|ache|sore\s+(knee|back|shin|hip)/i] },
  { name: 'streak_status',  patterns: [/streak|consecutive|habit|how\s*long/i] },
  { name: 'level_check',    patterns: [/level|xp|experience|character|progress/i] },
  { name: 'thanks',         patterns: [/thank|cheers|appreciate|brilliant|great|perfect|excellent/i] },
  { name: 'joke',           patterns: [/joke|funny|laugh|humor|entertain/i] },
  { name: 'who_are_you',    patterns: [/who\s*are\s*you|what\s*are\s*you|tell\s*me\s*about\s*yourself/i] },
  { name: 'week_plan',      patterns: [/this\s*week|weekly\s*plan|plan\s*for\s*the\s*week|schedule/i] },
];

function detectIntent(input: string): string {
  for (const intent of INTENTS) {
    if (intent.patterns.some(p => p.test(input))) return intent.name;
  }
  return 'unknown';
}

// ─── Context helpers ──────────────────────────────────────────────────────────

function daysUntil(isoDate: string): number {
  return Math.ceil((new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function getTodaySessions(tracks: Track[]): string[] {
  const today = new Date().getDay();
  const sessions: string[] = [];
  for (const track of tracks) {
    if (track.status !== 'active') continue;
    const phases = getPhasesForTemplate(track.templateType);
    const phase = phases[track.currentPhaseIndex];
    if (!phase) continue;
    phase.sessions.filter(s => s.dayOfWeek === today).forEach(s => sessions.push(s.title));
  }
  return sessions;
}

function getActiveRaceCountdown(tracks: Track[]): { label: string; days: number } | null {
  for (const track of tracks) {
    for (const kd of track.keyDates) {
      if (kd.label.toLowerCase().includes('race') && daysUntil(kd.date) > 0) {
        return { label: kd.label, days: daysUntil(kd.date) };
      }
    }
  }
  return null;
}

function getActiveExamCountdown(tracks: Track[]): { label: string; days: number } | null {
  for (const track of tracks) {
    for (const kd of track.keyDates) {
      if ((kd.label.toLowerCase().includes('exam') || kd.label.toLowerCase().includes('pmp')) && daysUntil(kd.date) > 0) {
        return { label: kd.label, days: daysUntil(kd.date) };
      }
    }
  }
  return null;
}

// ─── Response library ─────────────────────────────────────────────────────────

function respond(intent: string, ctx: AlfredContext): string {
  const h = ctx.honorific;
  const streak = computeStreak(ctx.activity);
  const todaySessions = getTodaySessions(ctx.tracks);
  const race = getActiveRaceCountdown(ctx.tracks);
  const exam = getActiveExamCountdown(ctx.tracks);
  const activeQuests = ctx.activeQuests.filter(q => q.status === 'active');

  switch (intent) {
    case 'greeting': {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      return `${greeting}, ${h}. The System is active and monitoring your progress. ${race ? `You have ${race.days} days until race day.` : ''} How may I assist?`;
    }

    case 'how_am_i': {
      const raceInfo = race ? `You have ${race.days} days until race day. ` : '';
      const examInfo = exam ? `Your ${exam.label} is in ${exam.days} days. ` : '';
      const streakInfo = streak > 0 ? `Your current streak stands at ${streak} days. ` : 'No active streak. ';
      return `${raceInfo}${examInfo}${streakInfo}Overall level: ${ctx.overallLevel}. Total XP: ${ctx.totalXp}. ${streak >= 7 ? `Impressive consistency, ${h}.` : `Keep pushing, ${h}.`}`;
    }

    case 'train_today': {
      if (todaySessions.length === 0) return `Today is a rest day, ${h}. Use it wisely — recovery is part of the programme.`;
      return `Today's sessions, ${h}: ${todaySessions.join(', ')}. ${race ? `${race.days} days to race day.` : ''} I suggest you begin promptly.`;
    }

    case 'quest_status': {
      if (activeQuests.length === 0) return `All quests are settled for today, ${h}. Admirable work.`;
      const titles = activeQuests.map(q => `"${q.title}"`).join(', ');
      return `You have ${activeQuests.length} active quest${activeQuests.length > 1 ? 's' : ''}, ${h}: ${titles}. The clock is running.`;
    }

    case 'pmp_advice': {
      const examInfo = exam ? `With ${exam.days} days remaining, ` : '';
      return `${examInfo}my counsel for the PMP, ${h}: prioritise mock examinations above all else. The question style is unlike any other exam. Study the ITTOs, but more importantly — study how PMI thinks. Situational questions reward mindset, not memorisation.`;
    }

    case 'po_advice':
      return `The most effective product owners, ${h}, are those who speak both languages — the language of business and the language of engineering. Build something small every week. Ship it. That one habit will separate you from every other candidate.`;

    case 'motivation': {
      const raceInfo = race ? ` You have ${race.days} days. ` : '';
      return `Discipline, ${h}, is choosing your future self over your present comfort.${raceInfo}The sessions you are most reluctant to begin are often the ones that matter most. The System is watching. Get to work.`;
    }

    case 'nutrition':
      return `Fuel strategy, ${h}: protein at every meal — minimum 1.6g per kg of bodyweight for a training athlete. Carbohydrates before and after sessions. Creatine 3–5g daily. Hydration is non-negotiable. The body performs to the quality of its fuel. Do not cut corners here.`;

    case 'race_strategy':
      return `The 1:30 plan, ${h}: 52 minutes of running — 8 km at 6:30/km pace. 35 minutes on the stations — 4–5 minutes average. 3 minutes in transitions — no dawdling. You do not win Hyrox in the stations. You lose it in the transitions. Stay sharp between efforts.`;

    case 'race_day': {
      if (!race) return `No race date has been set, ${h}. I cannot brief you on race day until we have a target.`;
      if (race.days <= 0) return `Race day has arrived, ${h}. Everything you have built brought you to this moment. Trust your preparation. Execute the plan.`;
      return `${race.days} days remain until race day, ${h}. The countdown is live. Make each session count.`;
    }

    case 'rest_recovery':
      return `Rest is not weakness, ${h}. It is the phase during which your body adapts to the training stimulus. Without recovery, there is only accumulation of fatigue. Sleep eight hours. Eat well. Trust the programme.`;

    case 'injury':
      return `I am not a physician, ${h}, and I would be remiss to act as one. My counsel: if there is sharp or persistent pain, cease training and consult a professional. Modify, do not eliminate — if the knee is the issue, the upper body can still work. Protect the asset.`;

    case 'streak_status':
      return streak > 0
        ? `Your current streak is ${streak} days, ${h}. ${streak >= 30 ? 'Extraordinary.' : streak >= 14 ? 'Formidable consistency.' : streak >= 7 ? 'A solid foundation.' : 'Keep going — seven days is the first real milestone.'}`
        : `No active streak, ${h}. Today is the day to start one.`;

    case 'level_check':
      return `You are Level ${ctx.overallLevel}, ${h}, with ${ctx.totalXp} total XP. ${ctx.overallLevel >= 5 ? 'Your character is developing considerable depth.' : 'The journey is young. Consistent effort will change these numbers rapidly.'}`;

    case 'thanks':
      return `Always a pleasure, ${h}. The System remains at your service.`;

    case 'joke':
      return `Very well, ${h}. Why did the project manager cross the road? To stay on schedule. I acknowledge that was beneath my usual standard. I shall do better.`;

    case 'who_are_you':
      return `I am Alfred — your personal system butler. I was designed for one purpose: to ensure you become the finest version of yourself. I monitor your progress, brief you each morning, and hold you accountable with a level of discretion that I like to think is rather elegant.`;

    case 'week_plan': {
      const sessions = getTodaySessions(ctx.tracks);
      return `This week's priorities, ${h}: maintain your active tracks, complete all compulsory quests, and do not neglect the weekly bounty. ${sessions.length > 0 ? `Today specifically: ${sessions.join(', ')}.` : 'Today is a recovery day.'} ${race ? `${race.days} days to race day — every session matters.` : ''}`;
    }

    default:
      return `Forgive me, ${h} — that falls outside my current briefing parameters. Might I suggest rephrasing, or consulting The Codex for reference materials?`;
  }
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export function query(input: string, ctx: AlfredContext): AlfredResponse {
  const intent = detectIntent(input.trim());
  const text = respond(intent, ctx);
  return { text, intent };
}

// ─── Daily briefing ───────────────────────────────────────────────────────────

export function generateDailyBriefing(ctx: AlfredContext): string {
  const h = ctx.honorific;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const streak = computeStreak(ctx.activity);
  const todaySessions = getTodaySessions(ctx.tracks);
  const race = getActiveRaceCountdown(ctx.tracks);
  const exam = getActiveExamCountdown(ctx.tracks);
  const activeQuests = ctx.activeQuests.filter(q => q.status === 'active');

  const parts: string[] = [`${greeting}, ${h}.`];

  if (race) parts.push(`${race.days} day${race.days !== 1 ? 's' : ''} until race day.`);
  if (exam) parts.push(`${exam.days} day${exam.days !== 1 ? 's' : ''} until your ${exam.label}.`);

  if (todaySessions.length > 0) {
    parts.push(`Today's session${todaySessions.length > 1 ? 's' : ''}: ${todaySessions.join(', ')}.`);
  } else {
    parts.push('Today is a scheduled rest day.');
  }

  if (streak >= 7) parts.push(`Study streak: ${streak} days. Maintain it.`);
  else if (streak > 0) parts.push(`Current streak: ${streak} days.`);

  if (activeQuests.length > 0) {
    parts.push(`${activeQuests.length} active quest${activeQuests.length > 1 ? 's' : ''} await.`);
  }

  parts.push('The System is ready when you are.');

  return parts.join(' ');
}
