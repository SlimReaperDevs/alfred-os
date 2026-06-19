import {
  reconcileQuests,
  applyStreakMultiplier,
  generateCompulsoryQuests,
  generateStarterQuest,
} from '../QuestEngine';
import type { Quest, ActivityEntry, Track } from '../../types';

function quest(partial: Partial<Quest>): Quest {
  return {
    id: 'q1',
    userId: 'u',
    trackId: 't',
    type: 'compulsory',
    title: 'Test Session',
    description: '',
    xpReward: 100,
    xpPenalty: 75,
    status: 'active',
    dueDate: new Date(Date.now() + 60_000).toISOString(), // not yet due
    completedAt: null,
    ...partial,
  };
}

function activity(partial: Partial<ActivityEntry>): ActivityEntry {
  return {
    id: Math.random().toString(36),
    userId: 'u',
    trackId: 't',
    actionType: 'session_complete',
    metadata: {},
    xpAwarded: 50,
    loggedAt: new Date().toISOString(),
    ...partial,
  };
}

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

describe('reconcileQuests — completion', () => {
  it('completes a compulsory quest when its session is logged today', () => {
    const q = quest({ sessionId: 's1' });
    const acts = [activity({ actionType: 'session_complete', metadata: { sessionId: 's1' } })];
    const { quests } = reconcileQuests('u', [q], acts, 'Sir');
    expect(quests[0].status).toBe('completed');
    expect(quests[0].completedAt).not.toBeNull();
  });

  it('leaves a compulsory quest active when no matching session is logged', () => {
    const q = quest({ sessionId: 's1' });
    const { quests } = reconcileQuests('u', [q], [], 'Sir');
    expect(quests[0].status).toBe('active');
  });
});

describe('reconcileQuests — misses & penalties', () => {
  it('marks a past-due compulsory quest missed and emits one penalty', () => {
    const q = quest({ dueDate: daysAgoISO(1) });
    const { quests, penalties, rebukes } = reconcileQuests('u', [q], [], 'Sir');
    expect(quests[0].status).toBe('missed');
    expect(penalties).toHaveLength(1);
    expect(penalties[0].xpAwarded).toBe(-75);
    expect(rebukes[0]).toContain('Sir');
  });

  it('does not penalise the same missed quest twice', () => {
    const q = quest({ dueDate: daysAgoISO(1), status: 'missed', penaltyApplied: true });
    const { penalties } = reconcileQuests('u', [q], [], 'Sir');
    expect(penalties).toHaveLength(0);
  });

  it('expires past-due side and bounty quests without penalty', () => {
    const side = quest({ id: 's', type: 'side', xpPenalty: 0, dueDate: daysAgoISO(1) });
    const { quests, penalties } = reconcileQuests('u', [side], [], 'Sir');
    expect(quests[0].status).toBe('expired');
    expect(penalties).toHaveLength(0);
  });

  it('flags regression after 3 missed quests inside the window', () => {
    const misses = [
      activity({ actionType: 'quest_missed', loggedAt: daysAgoISO(1) }),
      activity({ actionType: 'quest_missed', loggedAt: daysAgoISO(2) }),
      activity({ actionType: 'quest_missed', loggedAt: daysAgoISO(3) }),
    ];
    const { shouldRegress } = reconcileQuests('u', [], misses, 'Sir');
    expect(shouldRegress).toBe(true);
  });

  it('does not flag regression for old misses outside the window', () => {
    const misses = [
      activity({ actionType: 'quest_missed', loggedAt: daysAgoISO(20) }),
      activity({ actionType: 'quest_missed', loggedAt: daysAgoISO(21) }),
      activity({ actionType: 'quest_missed', loggedAt: daysAgoISO(22) }),
    ];
    const { shouldRegress } = reconcileQuests('u', [], misses, 'Sir');
    expect(shouldRegress).toBe(false);
  });
});

describe('applyStreakMultiplier', () => {
  it('returns base XP below a 7-day streak', () => {
    expect(applyStreakMultiplier(100, [])).toBe(100);
  });

  it('scales XP with streak tiers', () => {
    const make = (days: number) =>
      Array.from({ length: days }, (_, i) => activity({ loggedAt: daysAgoISO(i) }));
    expect(applyStreakMultiplier(100, make(7))).toBe(125);
    expect(applyStreakMultiplier(100, make(14))).toBe(150);
    expect(applyStreakMultiplier(100, make(30))).toBe(200);
  });
});

describe('generateStarterQuest', () => {
  it('produces a deterministic, always-available starter quest with XP', () => {
    const q = generateStarterQuest('user-1');
    expect(q.id).toBe('starter-user-1');
    expect(q.xpReward).toBeGreaterThan(0);
    expect(q.status).toBe('active');
    expect(new Date(q.dueDate).getTime()).toBeGreaterThan(Date.now()); // not expired
  });
});

describe('generateCompulsoryQuests', () => {
  it('produces deterministic ids and only for active tracks', () => {
    const track: Track = {
      id: 't', userId: 'u', templateType: 'hyrox', name: 'Hyrox',
      currentPhaseIndex: 0, keyDates: [], status: 'active',
      startDate: new Date().toISOString(), createdAt: new Date().toISOString(),
    };
    const a = generateCompulsoryQuests('u', [track]);
    const b = generateCompulsoryQuests('u', [track]);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id)); // idempotent
    a.forEach((q) => expect(q.id.startsWith('cq-')).toBe(true));

    const archived = generateCompulsoryQuests('u', [{ ...track, status: 'archived' }]);
    expect(archived).toHaveLength(0);
  });
});
