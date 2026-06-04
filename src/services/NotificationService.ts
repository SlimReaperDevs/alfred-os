import * as Notifications from 'expo-notifications';
import type { User, Track, Quest, ActivityEntry, Settings } from '../types';
import { computeStreak } from '../engine/XpEngine';
import { generateDailyBriefing } from '../engine/AlfredEngine';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleAllNotifications(
  user: User,
  tracks: Track[],
  activity: ActivityEntry[],
  quests: Quest[],
  settings: Settings,
): Promise<void> {
  const prefs = settings.notificationPrefs;
  await Notifications.cancelAllScheduledNotificationsAsync();

  const ctx = {
    honorific: user.honorific,
    displayName: user.displayName,
    tracks,
    activity,
    activeQuests: quests,
    totalXp: activity.reduce((s, a) => s + a.xpAwarded, 0),
    overallLevel: 1,
  };

  // 1. Morning Briefing
  if (prefs.morningBriefing) {
    const briefing = generateDailyBriefing(ctx);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Good morning, ${user.honorific}. Alfred reporting.`,
        body: briefing.slice(0, 150),
        data: { type: 'morning_briefing' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: prefs.morningHour,
        minute: 0,
      },
    });
  }

  // 2. Evening Warning (compulsory quest check)
  if (prefs.eveningWarning) {
    const hasActiveCompulsory = quests.some(q => q.type === 'compulsory' && q.status === 'active');
    if (hasActiveCompulsory) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `The evening draws near, ${user.honorific}.`,
          body: 'Your compulsory quest remains unfinished. The penalty approaches.',
          data: { type: 'evening_warning' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: prefs.eveningHour,
          minute: 0,
        },
      });
    }
  }

  // 3. Streak at risk
  if (prefs.streakAtRisk) {
    const streak = computeStreak(activity);
    if (streak > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Streak alert, ${user.honorific}.`,
          body: `Your ${streak}-day streak is at risk. Log activity before midnight.`,
          data: { type: 'streak_risk' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 21,
          minute: 30,
        },
      });
    }
  }

  // 4. Milestone alerts
  if (prefs.milestones) {
    for (const track of tracks) {
      for (const kd of track.keyDates) {
        const days = Math.ceil((new Date(kd.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const milestones = [60, 30, 14, 7, 3, 1];
        if (milestones.includes(days)) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${days} day${days !== 1 ? 's' : ''} remaining, ${user.honorific}.`,
              body: `${kd.label} approaches. ${days === 1 ? 'Tomorrow is the day.' : 'Maintain your programme.'}`,
              data: { type: 'milestone', trackId: track.id },
            },
            trigger: null,
          });
        }
      }
    }
  }
}

export async function sendRewardNotification(
  honorific: string,
  rewardType: 'lore_drop' | 'title',
  rewardName: string,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: rewardType === 'lore_drop'
        ? `A sealed entry has been unlocked, ${honorific}.`
        : `New title acquired, ${honorific}: "${rewardName}"`,
      body: rewardType === 'lore_drop'
        ? 'Alfred has revealed another chapter of his story. Visit The Hall of Records.'
        : 'Your character grows in distinction. The Hall of Records awaits.',
      data: { type: 'reward', rewardType, rewardName },
    },
    trigger: null,
  });
}
