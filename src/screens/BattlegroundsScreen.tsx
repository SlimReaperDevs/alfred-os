import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import { useApp } from '../context/AppContext';
import { getPhasesForTemplate } from '../engine/templates';
import { applyStreakMultiplier } from '../engine/QuestEngine';
import SectionTip from '../components/SectionTip';
import { colors } from '../theme/colors';
import type { Track, ActivityEntry } from '../types';

function SysPanel({ children }: { children: React.ReactNode }) {
  return <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 12, padding: 16 }}>{children}</View>;
}

function Tag({ label, color }: { label: string; color?: string }) {
  return <Text style={{ color: color ?? colors.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{label}</Text>;
}

function TrackCard({ track, onOpen }: { track: Track; onOpen: () => void }) {
  const phases = getPhasesForTemplate(track.templateType);
  const phase = phases[track.currentPhaseIndex];

  return (
    <TouchableOpacity onPress={onOpen} activeOpacity={0.8}>
      <SysPanel>
        <Tag label={track.templateType.toUpperCase()} color={colors.blue} />
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{track.name}</Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 12 }}>{phase?.name ?? 'Phase complete'}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.blue, fontSize: 11 }}>Phase {track.currentPhaseIndex + 1} / {phases.length}</Text>
          <Text style={{ color: colors.gold, fontSize: 11 }}>Active →</Text>
        </View>
      </SysPanel>
    </TouchableOpacity>
  );
}

function TrackDetail({ track, onBack }: { track: Track; onBack: () => void }) {
  const { user, activity, logActivity, upsertTrack } = useApp();
  const phases = getPhasesForTemplate(track.templateType);
  const phase = phases[track.currentPhaseIndex];
  const today = new Date().getDay();
  const todaySessions = phase?.sessions.filter(s => s.dayOfWeek === today) ?? [];

  const [runKm, setRunKm] = useState('');
  const [runMin, setRunMin] = useState('');
  const [stationName, setStationName] = useState('');
  const [stationTime, setStationTime] = useState('');
  const [mockScore, setMockScore] = useState('');
  const [mockTotal, setMockTotal] = useState('180');
  const [buildProject, setBuildProject] = useState('');
  const [buildDesc, setBuildDesc] = useState('');

  async function logSession(sessionId: string, title: string, baseXp: number) {
    if (!user) return;
    const xp = applyStreakMultiplier(baseXp, activity);
    const entry: ActivityEntry = {
      id: uuid(), userId: user.id, trackId: track.id,
      actionType: 'session_complete',
      metadata: { sessionId, title },
      xpAwarded: xp, loggedAt: new Date().toISOString(),
    };
    await logActivity(entry);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Session Logged', `+${xp} XP earned, ${user.honorific}.`);
  }

  async function logRun() {
    if (!user || !runKm) return;
    const entry: ActivityEntry = {
      id: uuid(), userId: user.id, trackId: track.id,
      actionType: 'run_log',
      metadata: { km: parseFloat(runKm), minutes: parseFloat(runMin) },
      xpAwarded: applyStreakMultiplier(Math.round(parseFloat(runKm) * 12), activity),
      loggedAt: new Date().toISOString(),
    };
    await logActivity(entry);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRunKm(''); setRunMin('');
    Alert.alert('Run Logged', `+${entry.xpAwarded} XP, ${user.honorific}.`);
  }

  async function logStationPB() {
    if (!user || !stationName || !stationTime) return;
    const entry: ActivityEntry = {
      id: uuid(), userId: user.id, trackId: track.id,
      actionType: 'station_pb',
      metadata: { station: stationName, time: stationTime },
      xpAwarded: applyStreakMultiplier(80, activity), loggedAt: new Date().toISOString(),
    };
    await logActivity(entry);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStationName(''); setStationTime('');
    Alert.alert('PB Logged', `New personal best recorded, ${user.honorific}.`);
  }

  async function logMockScore() {
    if (!user || !mockScore) return;
    const score = parseInt(mockScore);
    const total = parseInt(mockTotal) || 180;
    const pct = Math.round((score / total) * 100);
    const entry: ActivityEntry = {
      id: uuid(), userId: user.id, trackId: track.id,
      actionType: 'mock_score',
      metadata: { score, total, percentage: pct },
      xpAwarded: applyStreakMultiplier(pct >= 75 ? 200 : pct >= 60 ? 120 : 80, activity),
      loggedAt: new Date().toISOString(),
    };
    await logActivity(entry);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setMockScore('');
    Alert.alert('Score Logged', `${score}/${total} (${pct}%) — ${pct >= 75 ? 'Outstanding, ' : pct >= 60 ? 'Good work, ' : 'Keep studying, '}${user.honorific}.`);
  }

  async function logBuild() {
    if (!user || !buildProject) return;
    const entry: ActivityEntry = {
      id: uuid(), userId: user.id, trackId: track.id,
      actionType: 'build_log',
      metadata: { project: buildProject, description: buildDesc },
      xpAwarded: applyStreakMultiplier(120, activity), loggedAt: new Date().toISOString(),
    };
    await logActivity(entry);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setBuildProject(''); setBuildDesc('');
    Alert.alert('Build Logged', `+${entry.xpAwarded} XP, ${user.honorific}. The Vibe Coding log has been updated.`);
  }

  const recentActivity = activity
    .filter(a => a.trackId === track.id)
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
    .slice(0, 10);

  const inputStyle = { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8, fontSize: 13 };
  const btnStyle = { borderWidth: 1, borderColor: colors.gold, padding: 12, alignItems: 'center' as const, marginTop: 4 };

  const STATIONS = ['SkiErg', 'Sled Push', 'Sled Pull', 'Burpee Broad Jumps', 'Rowing', 'Farmer\'s Carry', 'Sandbag Lunges', 'Wall Balls'];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <TouchableOpacity onPress={onBack} style={{ marginBottom: 16 }}>
        <Text style={{ color: colors.gold, fontSize: 13 }}>← Back to Tracks</Text>
      </TouchableOpacity>

      {/* Today's session */}
      <SysPanel>
        <Tag label="Today's Session" color={colors.blue} />
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>{phase?.name ?? 'All phases complete'}</Text>
        {todaySessions.length === 0 ? (
          <Text style={{ color: colors.muted, fontSize: 13 }}>Rest day. Recovery is part of the programme.</Text>
        ) : todaySessions.map(s => (
          <View key={s.id} style={{ marginBottom: 12 }}>
            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 4 }}>{s.title}</Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>{s.description}</Text>
            <TouchableOpacity onPress={() => logSession(s.id, s.title, s.xpReward)} style={{ borderWidth: 1, borderColor: colors.blue, padding: 12, alignItems: 'center' }}>
              <Text style={{ color: colors.blue, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>[ LOG SESSION AS COMPLETE ]</Text>
            </TouchableOpacity>
          </View>
        ))}
      </SysPanel>

      {/* Track-specific logging */}
      {(track.templateType === 'hyrox' || track.templateType === 'marathon' || track.templateType === 'cycling') && (
        <>
          <SysPanel>
            <Tag label="Run Tracker" color={colors.run} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput style={{ ...inputStyle, flex: 1 }} placeholder="km" placeholderTextColor={colors.muted} value={runKm} onChangeText={setRunKm} keyboardType="numeric" />
              <TextInput style={{ ...inputStyle, flex: 1 }} placeholder="min" placeholderTextColor={colors.muted} value={runMin} onChangeText={setRunMin} keyboardType="numeric" />
            </View>
            <TouchableOpacity onPress={logRun} style={btnStyle}>
              <Text style={{ color: colors.gold, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>+ LOG RUN</Text>
            </TouchableOpacity>
          </SysPanel>

          <SysPanel>
            <Tag label="Station Personal Bests" color={colors.strength} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {STATIONS.map(s => (
                <TouchableOpacity key={s} onPress={() => setStationName(s)} activeOpacity={0.7}
                  style={{ borderWidth: 1, borderColor: stationName === s ? colors.strength : colors.border, paddingHorizontal: 10, paddingVertical: 6 }}
                >
                  <Text style={{ color: stationName === s ? colors.strength : colors.muted, fontSize: 11 }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={inputStyle} placeholder="Time e.g. 4:20" placeholderTextColor={colors.muted} value={stationTime} onChangeText={setStationTime} />
            <TouchableOpacity onPress={logStationPB} style={{ ...btnStyle, borderColor: colors.strength }}>
              <Text style={{ color: colors.strength, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>+ LOG STATION PB</Text>
            </TouchableOpacity>
          </SysPanel>
        </>
      )}

      {track.templateType === 'pmp' && (
        <SysPanel>
          <Tag label="Mock Exam Tracker" color={colors.gold} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput style={{ ...inputStyle, flex: 2 }} placeholder="Score e.g. 126" placeholderTextColor={colors.muted} value={mockScore} onChangeText={setMockScore} keyboardType="numeric" />
            <TextInput style={{ ...inputStyle, flex: 1 }} placeholder="Total" placeholderTextColor={colors.muted} value={mockTotal} onChangeText={setMockTotal} keyboardType="numeric" />
          </View>
          <TouchableOpacity onPress={logMockScore} style={btnStyle}>
            <Text style={{ color: colors.gold, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>+ LOG SCORE</Text>
          </TouchableOpacity>
          <View style={{ marginTop: 12 }}>
            {activity.filter(a => a.trackId === track.id && a.actionType === 'mock_score').map(a => {
              const m = a.metadata as { score: number; total: number; percentage: number };
              return (
                <View key={a.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ color: colors.text, fontSize: 13 }}>{m.score}/{m.total}</Text>
                  <Text style={{ color: m.percentage >= 75 ? colors.run : colors.muted, fontSize: 13 }}>{m.percentage}%</Text>
                  <Text style={{ color: colors.muted, fontSize: 11 }}>{a.loggedAt.slice(0, 10)}</Text>
                </View>
              );
            })}
          </View>
        </SysPanel>
      )}

      {track.templateType === 'product_owner' && (
        <SysPanel>
          <Tag label="Vibe Coding Log" color={colors.cyan} />
          <TextInput style={inputStyle} placeholder="Project name..." placeholderTextColor={colors.muted} value={buildProject} onChangeText={setBuildProject} />
          <TextInput style={{ ...inputStyle, height: 80 }} placeholder="What did you build, learn, or ship?" placeholderTextColor={colors.muted} value={buildDesc} onChangeText={setBuildDesc} multiline />
          <TouchableOpacity onPress={logBuild} style={{ ...btnStyle, borderColor: colors.cyan }}>
            <Text style={{ color: colors.cyan, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>+ LOG BUILD</Text>
          </TouchableOpacity>
        </SysPanel>
      )}

      {/* Activity log */}
      <SysPanel>
        <Tag label="Recent Activity" />
        {recentActivity.length === 0 ? (
          <Text style={{ color: colors.muted, fontSize: 12 }}>No activity logged yet.</Text>
        ) : recentActivity.map(a => (
          <View key={a.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ color: colors.text, fontSize: 12, flex: 1 }}>{a.actionType.replace(/_/g, ' ')}</Text>
            <Text style={{ color: colors.gold, fontSize: 12 }}>+{a.xpAwarded} XP</Text>
          </View>
        ))}
      </SysPanel>
    </ScrollView>
  );
}

export default function BattlegroundsScreen() {
  const { tracks, user } = useApp();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  if (selectedTrack) return <TrackDetail track={selectedTrack} onBack={() => setSelectedTrack(null)} />;

  const activeTracks = tracks.filter(t => t.status === 'active');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <SectionTip id="battlegrounds" text="The Battlegrounds hold your tracks. Open one to log today's session, runs, PBs or scores — each entry earns XP." />
        <Text style={{ color: colors.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>The Battlegrounds</Text>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Active Tracks</Text>

        {activeTracks.length === 0 ? (
          <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 24, alignItems: 'center' }}>
            <Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center' }}>No active tracks, {user?.honorific ?? 'Sir'}. Visit The Grand Registry to begin a new mission.</Text>
          </View>
        ) : (
          activeTracks.map(t => <TrackCard key={t.id} track={t} onOpen={() => setSelectedTrack(t)} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
