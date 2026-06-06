import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { User, Track, ActivityEntry, Settings, Quest, ChatMessage, CharacterState } from '../types';
import * as DS from '../services/DataService';
import { flushPendingSync } from '../services/DataService';
import { computeCharacterState } from '../engine/XpEngine';
import { generateDailyBriefing } from '../engine/AlfredEngine';
import {
  generateCompulsoryQuests,
  generateSideQuests,
  generateWeeklyBounties,
  reconcileQuests,
  generateVictorySpeech,
  applyStreakMultiplier,
} from '../engine/QuestEngine';
import { generateId } from '../engine/id';
import { AppState } from 'react-native';

const QUEST_RETENTION_DAYS = 14;

interface AppContextValue {
  user: User | null;
  tracks: Track[];
  activity: ActivityEntry[];
  settings: Settings | null;
  quests: Quest[];
  chatHistory: ChatMessage[];
  characterState: CharacterState | null;
  dailyBriefing: string;
  isLoading: boolean;
  reload: () => Promise<void>;
  setUser: (u: User) => Promise<void>;
  upsertTrack: (t: Track) => Promise<void>;
  logActivity: (e: ActivityEntry) => Promise<void>;
  saveSettings: (s: Settings) => Promise<void>;
  upsertQuest: (q: Quest) => Promise<void>;
  completeQuest: (q: Quest) => Promise<string | null>;
  appendChat: (m: ChatMessage) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

/** Merge freshly generated quests into the persisted set without clobbering
 *  existing statuses, then prune anything older than the retention window. */
function mergeQuests(generated: Quest[], existing: Quest[]): Quest[] {
  const byId = new Map(existing.map((q) => [q.id, q]));
  for (const g of generated) if (!byId.has(g.id)) byId.set(g.id, g);

  const cutoff = Date.now() - QUEST_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return [...byId.values()].filter((q) => new Date(q.dueDate).getTime() >= cutoff);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [settings, setSettingsState] = useState<Settings | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const [u, t, a, s, q, c] = await Promise.all([
      DS.getUser(), DS.getTracks(), DS.getActivity(),
      DS.getSettings(), DS.getQuests(), DS.getChatHistory(),
    ]);

    let nextQuests = q;
    let nextActivity = a;

    if (u) {
      // 1. Generate today's quests + this week's bounties (deterministic ids), merge in
      const generated = [
        ...generateCompulsoryQuests(u.id, t),
        ...generateSideQuests(u.id, t),
        ...generateWeeklyBounties(u.id, t),
      ];
      const merged = mergeQuests(generated, q);

      // 2. Reconcile completions + misses against the activity log
      const result = reconcileQuests(u.id, merged, a, u.honorific);
      nextQuests = result.quests;

      // 3. Persist any penalty entries from missed quests
      for (const penalty of result.penalties) {
        await DS.logActivity(penalty);
      }
      nextActivity = [...a, ...result.penalties];
      await DS.saveQuests(nextQuests);
    }

    setUserState(u);
    setTracks(t);
    setActivity(nextActivity);
    setSettingsState(s);
    setQuests(nextQuests);
    setChatHistory(c);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        reload();
        flushPendingSync();
      }
    });
    return () => sub.remove();
  }, [reload]);

  const characterState = useMemo<CharacterState | null>(
    () => (user ? computeCharacterState(activity, user.characterData) : null),
    [user, activity],
  );

  const dailyBriefing = useMemo<string>(() => {
    if (!user || !characterState) return 'Good evening. The System is initialising.';
    return generateDailyBriefing({
      honorific: user.honorific,
      displayName: user.displayName,
      tracks,
      activity,
      activeQuests: quests,
      totalXp: characterState.totalXp,
      overallLevel: characterState.overallLevel,
    });
  }, [user, characterState, tracks, activity, quests]);

  const setUser = async (u: User) => {
    await DS.saveUser(u);
    setUserState(u);
  };

  const upsertTrack = async (t: Track) => {
    await DS.upsertTrack(t);
    setTracks((prev) => {
      const idx = prev.findIndex((x) => x.id === t.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = t; return next; }
      return [...prev, t];
    });
  };

  /** Logs activity, then reconciles quests so a logged session immediately
   *  completes its matching compulsory quest. */
  const logActivity = async (e: ActivityEntry) => {
    await DS.logActivity(e);
    const nextActivity = [...activity, e];
    setActivity(nextActivity);

    if (user) {
      const result = reconcileQuests(user.id, quests, nextActivity, user.honorific);
      if (result.penalties.length > 0) {
        for (const p of result.penalties) await DS.logActivity(p);
        setActivity([...nextActivity, ...result.penalties]);
      }
      await DS.saveQuests(result.quests);
      setQuests(result.quests);
    }
  };

  const saveSettings = async (s: Settings) => {
    await DS.saveSettings(s);
    setSettingsState(s);
  };

  const upsertQuest = async (q: Quest) => {
    await DS.upsertQuest(q);
    setQuests((prev) => {
      const idx = prev.findIndex((x) => x.id === q.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = q; return next; }
      return [...prev, q];
    });
  };

  /** Manually complete a side quest or bounty — awards bonus XP (with streak
   *  multiplier) and, for bounties, emits a bounty_complete that unlocks lore. */
  const completeQuest = async (q: Quest): Promise<string | null> => {
    if (!user || q.status !== 'active' || q.type === 'compulsory') return null;

    const xp = applyStreakMultiplier(q.xpReward, activity);
    const entry: ActivityEntry = {
      id: generateId(),
      userId: user.id,
      trackId: q.trackId,
      actionType: q.type === 'bounty' ? 'bounty_complete' : 'side_quest_complete',
      metadata: { questId: q.id, title: q.title },
      xpAwarded: xp,
      loggedAt: new Date().toISOString(),
    };
    await DS.logActivity(entry);
    setActivity((prev) => [...prev, entry]);

    const updated: Quest = { ...q, status: 'completed', completedAt: new Date().toISOString() };
    await DS.upsertQuest(updated);
    setQuests((prev) => prev.map((x) => (x.id === q.id ? updated : x)));

    return generateVictorySpeech(user.honorific, q.title);
  };

  const appendChat = async (m: ChatMessage) => {
    await DS.appendChatMessage(m);
    setChatHistory((prev) => [...prev, m]);
  };

  return (
    <AppContext.Provider
      value={{
        user, tracks, activity, settings, quests, chatHistory,
        characterState, dailyBriefing, isLoading,
        reload, setUser, upsertTrack, logActivity,
        saveSettings, upsertQuest, completeQuest, appendChat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
