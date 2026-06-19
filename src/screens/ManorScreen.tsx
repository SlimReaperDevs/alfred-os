import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import SectionTip from '../components/SectionTip';
import type { Quest } from '../types';
import { xpToLevel, levelProgress, xpForNextLevel, computeStreak } from '../engine/XpEngine';
import { colors } from '../theme/colors';

function SysPanel({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <View style={[{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 12, padding: 16 }, style]}>
      {children}
    </View>
  );
}

function Tag({ label, color }: { label: string; color?: string }) {
  return <Text style={{ color: color ?? colors.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{label}</Text>;
}

export default function ManorScreen() {
  const { user, tracks, activity, quests, characterState, dailyBriefing, isLoading, completeQuest } = useApp();

  async function onCompleteQuest(q: Quest) {
    const speech = await completeQuest(q);
    if (speech) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Quest Complete', speech);
    }
  }

  if (isLoading || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.gold, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>INITIALISING SYSTEM...</Text>
      </View>
    );
  }

  const totalXp = characterState?.totalXp ?? 0;
  const overallLevel = characterState?.overallLevel ?? 1;
  const streak = computeStreak(activity);
  const activeQuests = quests.filter(q => q.status === 'active');

  const raceTracks = tracks.filter(t => t.status === 'active' && t.keyDates.some(d => d.label.toLowerCase().includes('race')));
  const examTracks = tracks.filter(t => t.status === 'active' && t.keyDates.some(d => d.label.toLowerCase().includes('exam') || d.label.toLowerCase().includes('pmp')));

  function daysUntil(iso: string) {
    return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>

        <SectionTip id="manor" text="This is The Manor — your home. My daily briefing sits at the top and updates from your live progress. Tap a side quest or bounty below to complete it." />

        {/* LOCKED: Alfred Daily Briefing */}
        <SysPanel>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Text style={{ color: colors.gold, fontWeight: 'bold', fontSize: 16 }}>A</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Tag label="Alfred · Daily Briefing" color={colors.gold} />
              <Text style={{ color: colors.text, fontSize: 13, lineHeight: 20 }}>{dailyBriefing}</Text>
            </View>
          </View>
        </SysPanel>

        {/* XP Bar */}
        <SysPanel>
          <Tag label="Character Progression" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: colors.text, fontWeight: 'bold' }}>Level {overallLevel}</Text>
            <Text style={{ color: colors.muted, fontSize: 11 }}>{totalXp} XP · {xpForNextLevel(totalXp)} to next</Text>
          </View>
          <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2 }}>
            <View style={{ height: 4, backgroundColor: colors.gold, borderRadius: 2, width: `${levelProgress(totalXp)}%` }} />
          </View>
        </SysPanel>

        {/* Countdowns */}
        {(raceTracks.length > 0 || examTracks.length > 0) && (
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {raceTracks.map(t => {
              const kd = t.keyDates.find(d => d.label.toLowerCase().includes('race'))!;
              const days = daysUntil(kd.date);
              return (
                <SysPanel key={t.id} style={{ flex: 1, marginBottom: 0, alignItems: 'center' }}>
                  <Tag label="Race Day" color={colors.blue} />
                  <Text style={{ color: colors.blue, fontSize: 36, fontWeight: 'bold' }}>{days}</Text>
                  <Text style={{ color: colors.muted, fontSize: 10 }}>days remaining</Text>
                </SysPanel>
              );
            })}
            {examTracks.map(t => {
              const kd = t.keyDates.find(d => d.label.toLowerCase().includes('exam') || d.label.toLowerCase().includes('pmp'))!;
              const days = daysUntil(kd.date);
              return (
                <SysPanel key={t.id} style={{ flex: 1, marginBottom: 0, alignItems: 'center' }}>
                  <Tag label="Exam Day" color={colors.gold} />
                  <Text style={{ color: colors.gold, fontSize: 36, fontWeight: 'bold' }}>{days}</Text>
                  <Text style={{ color: colors.muted, fontSize: 10 }}>days remaining</Text>
                </SysPanel>
              );
            })}
          </View>
        )}

        {/* Stat Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Training Level', value: `LV ${characterState?.trainingLevel ?? 1}`, color: colors.phase1 },
            { label: 'Knowledge Level', value: `LV ${characterState?.knowledgeLevel ?? 1}`, color: colors.gold },
            { label: 'Study Streak', value: `${streak}d`, color: colors.cyan },
            { label: 'Overall Level', value: `LV ${overallLevel}`, color: colors.phase2 },
          ].map(stat => (
            <View key={stat.label} style={{ flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 12 }}>
              <Tag label={stat.label} color={stat.color} />
              <Text style={{ color: stat.color, fontSize: 24, fontWeight: 'bold' }}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Active Quests */}
        <SysPanel>
          <Tag label="Daily Quest Board" />
          <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 8 }}>Today's Missions</Text>
          {activeQuests.length === 0 ? (
            <Text style={{ color: colors.muted, fontSize: 12 }}>All quests complete, {user.honorific}. Admirable work.</Text>
          ) : (
            activeQuests.slice(0, 6).map(q => {
              const tappable = q.type !== 'compulsory';
              const dot = q.type === 'compulsory' ? colors.strength : q.type === 'bounty' ? colors.gold : colors.cyan;
              return (
                <TouchableOpacity
                  key={q.id}
                  activeOpacity={tappable ? 0.6 : 1}
                  disabled={!tappable}
                  onPress={() => tappable && onCompleteQuest(q)}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}
                >
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dot, marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontSize: 13 }}>{q.title}</Text>
                    <Text style={{ color: colors.muted, fontSize: 11 }}>{q.type} · {q.xpReward} XP{q.type === 'compulsory' ? ' · log the session' : ' · tap to complete'}</Text>
                  </View>
                  {tappable && <Text style={{ color: dot, fontSize: 16 }}>○</Text>}
                </TouchableOpacity>
              );
            })
          )}
        </SysPanel>

        {/* Mission Arc */}
        <SysPanel>
          <Tag label="Mission Arc" />
          <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 8 }}>Active Tracks</Text>
          {tracks.filter(t => t.status === 'active').map(t => (
            <View key={t.id} style={{ marginBottom: 8 }}>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>{t.name}</Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>Phase {t.currentPhaseIndex + 1} · Active</Text>
            </View>
          ))}
          {tracks.filter(t => t.status === 'active').length === 0 && (
            <Text style={{ color: colors.muted, fontSize: 12 }}>No active tracks. Visit The Battlegrounds to begin.</Text>
          )}
        </SysPanel>

      </ScrollView>
    </SafeAreaView>
  );
}
