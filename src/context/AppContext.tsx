import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Track, ActivityEntry, Settings, Quest, ChatMessage, CharacterState } from '../types';
import * as DS from '../services/DataService';
import { computeCharacterState } from '../engine/XpEngine';
import { generateDailyBriefing } from '../engine/AlfredEngine';
import { flushPendingSync } from '../services/DataService';
import { AppState } from 'react-native';

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
  appendChat: (m: ChatMessage) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

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
    setUserState(u);
    setTracks(t);
    setActivity(a);
    setSettingsState(s);
    setQuests(q);
    setChatHistory(c);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        reload();
        flushPendingSync();
      }
    });
    return () => sub.remove();
  }, [reload]);

  const characterState = user
    ? computeCharacterState(activity, user.characterData)
    : null;

  const dailyBriefing = user && characterState
    ? generateDailyBriefing({
        honorific: user.honorific,
        displayName: user.displayName,
        tracks,
        activity,
        activeQuests: quests,
        totalXp: characterState.totalXp,
        overallLevel: characterState.overallLevel,
      })
    : 'Good evening. The System is initialising.';

  const setUser = async (u: User) => {
    await DS.saveUser(u);
    setUserState(u);
  };

  const upsertTrack = async (t: Track) => {
    await DS.upsertTrack(t);
    setTracks(prev => {
      const idx = prev.findIndex(x => x.id === t.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = t; return next; }
      return [...prev, t];
    });
  };

  const logActivity = async (e: ActivityEntry) => {
    await DS.logActivity(e);
    setActivity(prev => [...prev, e]);
  };

  const saveSettings = async (s: Settings) => {
    await DS.saveSettings(s);
    setSettingsState(s);
  };

  const upsertQuest = async (q: Quest) => {
    await DS.upsertQuest(q);
    setQuests(prev => {
      const idx = prev.findIndex(x => x.id === q.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = q; return next; }
      return [...prev, q];
    });
  };

  const appendChat = async (m: ChatMessage) => {
    await DS.appendChatMessage(m);
    setChatHistory(prev => [...prev, m]);
  };

  return (
    <AppContext.Provider value={{
      user, tracks, activity, settings, quests, chatHistory,
      characterState, dailyBriefing, isLoading,
      reload, setUser, upsertTrack, logActivity,
      saveSettings, upsertQuest, appendChat,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
