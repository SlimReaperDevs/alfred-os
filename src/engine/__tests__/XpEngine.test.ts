import {
  xpToLevel,
  xpForNextLevel,
  levelProgress,
  abilityModifier,
  computeStreak,
  computeCharacterState,
} from '../XpEngine';
import type { ActivityEntry, CharacterData } from '../../types';

const CHAR: CharacterData = {
  name: 'Test', career: '', age: null, height: null, weight: null,
  hobbies: '', backstory: '', charisma: 12,
};

function entry(partial: Partial<ActivityEntry>): ActivityEntry {
  return {
    id: Math.random().toString(36),
    userId: 'u',
    trackId: 't',
    actionType: 'session_complete',
    metadata: {},
    xpAwarded: 0,
    loggedAt: new Date().toISOString(),
    ...partial,
  };
}

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

describe('level maths', () => {
  it('maps XP to levels at 500 XP per level', () => {
    expect(xpToLevel(0)).toBe(1);
    expect(xpToLevel(499)).toBe(1);
    expect(xpToLevel(500)).toBe(2);
    expect(xpToLevel(1000)).toBe(3);
  });

  it('never returns a level below 1, even for negative XP', () => {
    expect(xpToLevel(-200)).toBe(1);
  });

  it('reports XP remaining to the next level', () => {
    expect(xpForNextLevel(0)).toBe(500);
    expect(xpForNextLevel(450)).toBe(50);
  });

  it('reports progress within the current level as a percentage', () => {
    expect(levelProgress(0)).toBe(0);
    expect(levelProgress(250)).toBe(50);
  });
});

describe('abilityModifier', () => {
  it('follows D&D modifier rules', () => {
    expect(abilityModifier(10)).toBe(0);
    expect(abilityModifier(12)).toBe(1);
    expect(abilityModifier(8)).toBe(-1);
    expect(abilityModifier(20)).toBe(5);
  });
});

describe('computeStreak', () => {
  it('is 0 with no activity', () => {
    expect(computeStreak([])).toBe(0);
  });

  it('counts consecutive days back from today', () => {
    const activity = [
      entry({ loggedAt: daysAgoISO(0) }),
      entry({ loggedAt: daysAgoISO(1) }),
      entry({ loggedAt: daysAgoISO(2) }),
    ];
    expect(computeStreak(activity)).toBe(3);
  });

  it('stops at a gap', () => {
    const activity = [
      entry({ loggedAt: daysAgoISO(0) }),
      entry({ loggedAt: daysAgoISO(2) }), // missed day 1
    ];
    expect(computeStreak(activity)).toBe(1);
  });
});

describe('computeCharacterState', () => {
  it('sums XP and derives the overall level', () => {
    const activity = [
      entry({ xpAwarded: 300 }),
      entry({ xpAwarded: 300, actionType: 'chapter_complete' }),
    ];
    const state = computeCharacterState(activity, CHAR);
    expect(state.totalXp).toBe(600);
    expect(state.overallLevel).toBe(2);
  });

  it('applies XP penalties (negative xpAwarded) to the total', () => {
    const activity = [
      entry({ xpAwarded: 200 }),
      entry({ xpAwarded: -75, actionType: 'quest_missed' }),
    ];
    expect(computeCharacterState(activity, CHAR).totalXp).toBe(125);
  });

  it('keeps ability scores within the 8–20 band and reflects charisma', () => {
    const state = computeCharacterState([], CHAR);
    Object.values(state.abilityScores).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(8);
      expect(v).toBeLessThanOrEqual(20);
    });
    expect(state.abilityScores.charisma).toBe(12);
  });

  it('unlocks the first-session title after one session', () => {
    const state = computeCharacterState([entry({})], CHAR);
    const firstBlood = state.unlockedTitles.find((t) => t.id === 'first_blood');
    expect(firstBlood?.unlocked).toBe(true);
  });

  it('unlocks lore drops in sequence as bounties are completed', () => {
    const none = computeCharacterState([], CHAR);
    expect(none.unlockedLoreDrops.filter((l) => l.unlocked)).toHaveLength(0);

    const twoBounties = computeCharacterState(
      [entry({ actionType: 'bounty_complete' }), entry({ actionType: 'bounty_complete' })],
      CHAR,
    );
    expect(twoBounties.unlockedLoreDrops.filter((l) => l.unlocked)).toHaveLength(2);
  });
});
