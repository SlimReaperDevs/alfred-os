'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { logActivity, upsertTrack, upsertUserRecord, getAuthUserId } from '@/lib/data';
import { generateStarterQuest } from '@engine/QuestEngine';
import { getTemplate } from '@engine/templates';
import type { TrackTemplateType, Track, User, CharacterData } from '@shared/types';

export interface OnboardingPayload {
  honorific: string;
  displayName: string;
  character: CharacterData;
  templateType: TrackTemplateType;
  trackName: string;
  keyDate?: string;
}

/** Logs the one-off starter quest XP during the guided first action. */
export async function logStarterQuestAction(): Promise<number> {
  const uid = await getAuthUserId();
  if (!uid) return 0;
  const quest = generateStarterQuest(uid);
  await logActivity({
    id: `${quest.id}-done`,
    userId: uid,
    trackId: quest.trackId || (null as unknown as string),
    actionType: 'side_quest_complete',
    metadata: { questId: quest.id, title: quest.title, starter: true },
    xpAwarded: quest.xpReward,
    loggedAt: new Date().toISOString(),
  });
  revalidatePath('/manor');
  return quest.xpReward;
}

/**
 * "Start Anew" — wipes all the user's data but keeps the auth account, then
 * re-runs onboarding. Deleting tracks cascades to their resources.
 */
export async function startAnewAction(): Promise<void> {
  const uid = await getAuthUserId();
  if (!uid) return;
  const supabase = await createClient();

  await supabase.from('activity_log').delete().eq('user_id', uid);
  await supabase.from('tracks').delete().eq('user_id', uid); // cascades resources
  await supabase.from('users').update({
    display_name: '',
    character_data: {
      name: '', career: '', age: null, height: null, weight: null,
      hobbies: '', backstory: '', charisma: 10,
    },
    onboarding_complete: false,
  }).eq('id', uid);

  revalidatePath('/', 'layout');
  redirect('/onboarding');
}

/** Persists the full onboarding result and marks the account onboarded. */
export async function completeOnboardingAction(payload: OnboardingPayload): Promise<void> {
  const uid = await getAuthUserId();
  if (!uid) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const record: User = {
    id: uid,
    email: user?.email ?? '',
    honorific: payload.honorific.trim() || 'Sir',
    displayName: payload.displayName.trim() || payload.honorific.trim() || 'Sir',
    characterData: payload.character,
    onboardingComplete: true,
    createdAt: new Date().toISOString(),
  };
  await upsertUserRecord(record);

  const template = getTemplate(payload.templateType);
  const track: Track = {
    id: `${uid}-${payload.templateType}-${Date.now()}`,
    userId: uid,
    templateType: payload.templateType,
    name: payload.trackName.trim() || template.name,
    currentPhaseIndex: 0,
    keyDates: payload.keyDate
      ? [{ label: payload.templateType === 'pmp' ? 'Exam Date' : 'Race Date', date: payload.keyDate }]
      : [],
    status: 'active',
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  await upsertTrack(track);

  revalidatePath('/', 'layout');
}
