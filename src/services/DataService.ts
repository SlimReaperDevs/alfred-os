/**
 * DataService — single point of truth for all reads/writes.
 * Uses AsyncStorage as the local cache. Syncs to Supabase when online
 * and credentials are present. All other modules call only this service.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, hasSupabaseCredentials } from '../lib/supabase';
import type {
  User, Track, ActivityEntry, Settings, Resource,
  Quest, ChatMessage, NotificationPrefs, WidgetLayout,
} from '../types';

// ─── Storage keys ─────────────────────────────────────────────────────────────

const KEYS = {
  USER: 'alfred:user',
  TRACKS: 'alfred:tracks',
  ACTIVITY: 'alfred:activity',
  SETTINGS: 'alfred:settings',
  RESOURCES: 'alfred:resources',
  QUESTS: 'alfred:quests',
  CHAT: 'alfred:chat',
  PENDING_SYNC: 'alfred:pending_sync',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getLocal<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

async function setLocal<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function queueSync(operation: Record<string, unknown>): Promise<void> {
  const queue = (await getLocal<Record<string, unknown>[]>(KEYS.PENDING_SYNC)) ?? [];
  queue.push({ ...operation, queuedAt: new Date().toISOString() });
  await setLocal(KEYS.PENDING_SYNC, queue);
}

// ─── User ─────────────────────────────────────────────────────────────────────

export async function getUser(): Promise<User | null> {
  return getLocal<User>(KEYS.USER);
}

export async function saveUser(user: User): Promise<void> {
  await setLocal(KEYS.USER, user);
  if (hasSupabaseCredentials()) {
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      honorific: user.honorific,
      display_name: user.displayName,
      character_data: user.characterData,
    });
    if (error) await queueSync({ table: 'users', data: user });
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  if (!hasSupabaseCredentials()) throw new Error('Supabase not configured');
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string) {
  if (!hasSupabaseCredentials()) throw new Error('Supabase not configured');
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  if (hasSupabaseCredentials()) await supabase.auth.signOut();
  // Clear local data
  await AsyncStorage.multiRemove(Object.values(KEYS));
}

export async function getSession() {
  if (!hasSupabaseCredentials()) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─── Tracks ───────────────────────────────────────────────────────────────────

export async function getTracks(): Promise<Track[]> {
  return (await getLocal<Track[]>(KEYS.TRACKS)) ?? [];
}

export async function saveTracks(tracks: Track[]): Promise<void> {
  await setLocal(KEYS.TRACKS, tracks);
  if (hasSupabaseCredentials()) {
    for (const track of tracks) {
      const { error } = await supabase.from('tracks').upsert({
        id: track.id,
        user_id: track.userId,
        template_type: track.templateType,
        name: track.name,
        config: { currentPhaseIndex: track.currentPhaseIndex, keyDates: track.keyDates },
        status: track.status,
      });
      if (error) await queueSync({ table: 'tracks', data: track });
    }
  }
}

export async function upsertTrack(track: Track): Promise<void> {
  const tracks = await getTracks();
  const idx = tracks.findIndex(t => t.id === track.id);
  if (idx >= 0) tracks[idx] = track;
  else tracks.push(track);
  await saveTracks(tracks);
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export async function getActivity(): Promise<ActivityEntry[]> {
  return (await getLocal<ActivityEntry[]>(KEYS.ACTIVITY)) ?? [];
}

export async function logActivity(entry: ActivityEntry): Promise<void> {
  const log = await getActivity();
  log.push(entry);
  await setLocal(KEYS.ACTIVITY, log);
  if (hasSupabaseCredentials()) {
    const { error } = await supabase.from('activity_log').insert({
      id: entry.id,
      user_id: entry.userId,
      track_id: entry.trackId,
      action_type: entry.actionType,
      metadata: entry.metadata,
      xp_awarded: entry.xpAwarded,
      logged_at: entry.loggedAt,
    });
    if (error) await queueSync({ table: 'activity_log', data: entry });
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  morningBriefing: true,
  eveningWarning: true,
  streakAtRisk: true,
  milestones: true,
  rewardAlerts: true,
  morningHour: 7,
  eveningHour: 20,
};

const DEFAULT_WIDGET_LAYOUT: WidgetLayout = {
  order: ['briefing', 'xpBar', 'countdowns', 'activeQuests', 'statCards', 'streak', 'missionArc'],
  hidden: [],
};

export async function getSettings(): Promise<Settings> {
  const user = await getUser();
  const stored = await getLocal<Settings>(KEYS.SETTINGS);
  return stored ?? {
    userId: user?.id ?? '',
    notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
    widgetLayout: DEFAULT_WIDGET_LAYOUT,
    updatedAt: new Date().toISOString(),
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await setLocal(KEYS.SETTINGS, settings);
  if (hasSupabaseCredentials()) {
    const { error } = await supabase.from('settings').upsert({
      id: settings.userId,
      user_id: settings.userId,
      notification_prefs: settings.notificationPrefs,
      widget_layout: settings.widgetLayout,
      updated_at: settings.updatedAt,
    });
    if (error) await queueSync({ table: 'settings', data: settings });
  }
}

// ─── Resources ────────────────────────────────────────────────────────────────

export async function getResources(): Promise<Resource[]> {
  return (await getLocal<Resource[]>(KEYS.RESOURCES)) ?? [];
}

export async function saveResources(resources: Resource[]): Promise<void> {
  await setLocal(KEYS.RESOURCES, resources);
}

export async function upsertResource(resource: Resource): Promise<void> {
  const resources = await getResources();
  const idx = resources.findIndex(r => r.id === resource.id);
  if (idx >= 0) resources[idx] = resource;
  else resources.push(resource);
  await saveResources(resources);
  if (hasSupabaseCredentials()) {
    const { error } = await supabase.from('resources').upsert({
      id: resource.id,
      track_id: resource.trackId,
      title: resource.title,
      url: resource.url,
      notes: resource.notes,
      source: resource.source,
    });
    if (error) await queueSync({ table: 'resources', data: resource });
  }
}

// ─── Quests ───────────────────────────────────────────────────────────────────

export async function getQuests(): Promise<Quest[]> {
  return (await getLocal<Quest[]>(KEYS.QUESTS)) ?? [];
}

export async function saveQuests(quests: Quest[]): Promise<void> {
  await setLocal(KEYS.QUESTS, quests);
}

export async function upsertQuest(quest: Quest): Promise<void> {
  const quests = await getQuests();
  const idx = quests.findIndex(q => q.id === quest.id);
  if (idx >= 0) quests[idx] = quest;
  else quests.push(quest);
  await saveQuests(quests);
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export async function getChatHistory(): Promise<ChatMessage[]> {
  return (await getLocal<ChatMessage[]>(KEYS.CHAT)) ?? [];
}

export async function appendChatMessage(message: ChatMessage): Promise<void> {
  const history = await getChatHistory();
  history.push(message);
  // Keep last 200 messages
  const trimmed = history.slice(-200);
  await setLocal(KEYS.CHAT, trimmed);
}

// ─── Sync ─────────────────────────────────────────────────────────────────────

export async function flushPendingSync(): Promise<void> {
  if (!hasSupabaseCredentials()) return;
  const queue = (await getLocal<Record<string, unknown>[]>(KEYS.PENDING_SYNC)) ?? [];
  if (queue.length === 0) return;

  const failed: Record<string, unknown>[] = [];
  for (const op of queue) {
    const { table, data } = op as { table: string; data: Record<string, unknown> };
    const { error } = await supabase.from(table).upsert(data);
    if (error) failed.push(op);
  }
  await setLocal(KEYS.PENDING_SYNC, failed);
}

export async function exportAllData(): Promise<string> {
  const [user, tracks, activity, settings, resources, quests, chat] = await Promise.all([
    getUser(), getTracks(), getActivity(), getSettings(),
    getResources(), getQuests(), getChatHistory(),
  ]);
  return JSON.stringify({ user, tracks, activity, settings, resources, quests, chat, exportedAt: new Date().toISOString() }, null, 2);
}
