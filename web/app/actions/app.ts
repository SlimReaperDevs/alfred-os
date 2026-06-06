'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  logActivity,
  upsertTrack,
  upsertUserRecord,
  getUserRecord,
  getActivity,
} from '@/lib/data';
import { generateId } from '@engine/id';
import { applyStreakMultiplier } from '@engine/QuestEngine';
import { getTemplate } from '@engine/templates';
import type { ActionType, Track, TrackTemplateType } from '@shared/types';

async function authedUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Log any activity entry, awarding XP (with streak multiplier where relevant). */
export async function logAction(
  trackId: string,
  actionType: ActionType,
  metadata: Record<string, unknown>,
  baseXp: number,
  applyStreak = false,
): Promise<void> {
  const uid = await authedUserId();
  if (!uid) return;

  const activity = applyStreak ? await getActivity() : [];
  const xp = applyStreak ? applyStreakMultiplier(baseXp, activity) : baseXp;

  await logActivity({
    id: generateId(),
    userId: uid,
    trackId,
    actionType,
    metadata,
    xpAwarded: xp,
    loggedAt: new Date().toISOString(),
  });

  revalidatePath('/manor');
  revalidatePath('/battlegrounds');
  revalidatePath(`/battlegrounds/${trackId}`);
  revalidatePath('/hall');
}

/** Add a new track from a template. */
export async function addTrackAction(
  templateType: TrackTemplateType,
  name: string,
  keyDate?: string,
): Promise<void> {
  const uid = await authedUserId();
  if (!uid) return;

  const template = getTemplate(templateType);
  const track: Track = {
    id: generateId(),
    userId: uid,
    templateType,
    name: name.trim() || template.name,
    currentPhaseIndex: 0,
    keyDates: keyDate
      ? [{ label: templateType === 'pmp' ? 'Exam Date' : 'Race Date', date: keyDate }]
      : [],
    status: 'active',
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  await upsertTrack(track);
  revalidatePath('/battlegrounds');
  revalidatePath('/manor');
  revalidatePath('/registry');
}

/** Archive a track. */
export async function archiveTrackAction(track: Track): Promise<void> {
  await upsertTrack({ ...track, status: 'archived' });
  revalidatePath('/battlegrounds');
  revalidatePath('/manor');
}

/** Update character / identity fields. */
export async function updateCharacterAction(fields: {
  honorific?: string;
  displayName?: string;
  name?: string;
  career?: string;
  backstory?: string;
}): Promise<void> {
  const record = await getUserRecord();
  if (!record) return;

  await upsertUserRecord({
    ...record,
    honorific: fields.honorific?.trim() || record.honorific,
    displayName: fields.displayName?.trim() ?? record.displayName,
    characterData: {
      ...record.characterData,
      name: fields.name?.trim() ?? record.characterData.name,
      career: fields.career?.trim() ?? record.characterData.career,
      backstory: fields.backstory?.trim() ?? record.characterData.backstory,
    },
  });
  revalidatePath('/hall');
  revalidatePath('/manor');
  revalidatePath('/armoury');
}
