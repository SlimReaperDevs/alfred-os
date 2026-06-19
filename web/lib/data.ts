/**
 * Web data-access layer — the single point through which the web app reads and
 * writes Supabase. Web pages call only this module, never Supabase directly.
 *
 * Maps snake_case DB rows <-> the shared camelCase domain types (../src/types),
 * which are the same types the mobile app uses.
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type {
  User,
  Track,
  ActivityEntry,
  Settings,
  Resource,
  CharacterData,
  NotificationPrefs,
  WidgetLayout,
} from '@shared/types';

// ─── Row → domain mappers ──────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapUser(row: any): User {
  return {
    id: row.id,
    email: row.email ?? '',
    honorific: row.honorific ?? 'Sir',
    displayName: row.display_name ?? '',
    characterData: (row.character_data ?? {}) as CharacterData,
    onboardingComplete: row.onboarding_complete ?? false,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

function mapTrack(row: any): Track {
  const config = row.config ?? {};
  return {
    id: row.id,
    userId: row.user_id,
    templateType: row.template_type,
    name: row.name,
    currentPhaseIndex: config.currentPhaseIndex ?? 0,
    keyDates: config.keyDates ?? [],
    status: row.status ?? 'active',
    startDate: config.startDate ?? row.created_at ?? new Date().toISOString(),
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

function mapActivity(row: any): ActivityEntry {
  return {
    id: row.id,
    userId: row.user_id,
    trackId: row.track_id,
    actionType: row.action_type,
    metadata: row.metadata ?? {},
    xpAwarded: row.xp_awarded ?? 0,
    loggedAt: row.logged_at ?? new Date().toISOString(),
  };
}

function mapResource(row: any): Resource {
  return {
    id: row.id,
    trackId: row.track_id,
    title: row.title,
    url: row.url ?? '',
    notes: row.notes ?? '',
    source: row.source ?? 'user',
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// ─── Reads ─────────────────────────────────────────────────────────────────────

/** The authenticated Supabase user's id, or null if not signed in. */
export async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getUserRecord(): Promise<User | null> {
  const supabase = await createClient();
  const uid = await getAuthUserId();
  if (!uid) return null;

  const { data } = await supabase.from('users').select('*').eq('id', uid).maybeSingle();
  return data ? mapUser(data) : null;
}

export async function getTracks(): Promise<Track[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('tracks')
    .select('*')
    .order('created_at', { ascending: true });
  return (data ?? []).map(mapTrack);
}

export async function getTrackById(id: string): Promise<Track | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('tracks').select('*').eq('id', id).maybeSingle();
  return data ? mapTrack(data) : null;
}

/**
 * Ensures a row exists in `users` for the authenticated account, creating a
 * sensible default if this is the user's first web visit. Returns the record.
 */
export async function ensureUserRecord(): Promise<User | null> {
  const existing = await getUserRecord();
  if (existing) return existing;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const fresh: User = {
    id: user.id,
    email: user.email ?? '',
    honorific: 'Sir',
    displayName: '',
    characterData: {
      name: '', career: '', age: null, height: null, weight: null,
      hobbies: '', backstory: '', charisma: 10,
    },
    onboardingComplete: false,
    createdAt: new Date().toISOString(),
  };
  await upsertUserRecord(fresh);
  return fresh;
}

export async function getActivity(): Promise<ActivityEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('activity_log')
    .select('*')
    .order('logged_at', { ascending: true });
  return (data ?? []).map(mapActivity);
}

export async function getResources(): Promise<Resource[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('resources').select('*');
  return (data ?? []).map(mapResource);
}

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
  const supabase = await createClient();
  const uid = await getAuthUserId();
  const { data } = await supabase.from('settings').select('*').maybeSingle();
  return {
    userId: uid ?? '',
    notificationPrefs: data?.notification_prefs ?? DEFAULT_NOTIFICATION_PREFS,
    widgetLayout: data?.widget_layout ?? DEFAULT_WIDGET_LAYOUT,
    updatedAt: data?.updated_at ?? new Date().toISOString(),
  };
}

// ─── Writes ────────────────────────────────────────────────────────────────────

export async function logActivity(entry: ActivityEntry): Promise<void> {
  const supabase = await createClient();
  await supabase.from('activity_log').insert({
    id: entry.id,
    user_id: entry.userId,
    track_id: entry.trackId,
    action_type: entry.actionType,
    metadata: entry.metadata,
    xp_awarded: entry.xpAwarded,
    logged_at: entry.loggedAt,
  });
}

export async function upsertTrack(track: Track): Promise<void> {
  const supabase = await createClient();
  await supabase.from('tracks').upsert({
    id: track.id,
    user_id: track.userId,
    template_type: track.templateType,
    name: track.name,
    config: {
      currentPhaseIndex: track.currentPhaseIndex,
      keyDates: track.keyDates,
      startDate: track.startDate,
    },
    status: track.status,
  });
}

/**
 * Gate for authenticated app pages: ensures the user exists, redirects to
 * /login if not signed in, or to /onboarding if they haven't finished it.
 * Returns the user record for the page to use.
 */
export async function requireOnboarded(): Promise<User> {
  const record = await ensureUserRecord();
  if (!record) redirect('/login');
  if (!record.onboardingComplete) redirect('/onboarding');
  return record;
}

export async function upsertUserRecord(user: User): Promise<void> {
  const supabase = await createClient();
  await supabase.from('users').upsert({
    id: user.id,
    email: user.email,
    honorific: user.honorific,
    display_name: user.displayName,
    character_data: user.characterData,
    onboarding_complete: user.onboardingComplete,
  });
}
