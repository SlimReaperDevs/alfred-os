import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { startAnew, signOut } from '../../services/DataService';
import { colors } from '../../theme/colors';
import type { Settings } from '../../types';

export default function ArmouryScreen() {
  const { user, settings, saveSettings, setUser, reload } = useApp();
  const [prefs, setPrefs] = useState(settings?.notificationPrefs ?? {
    morningBriefing: true, eveningWarning: true, streakAtRisk: true,
    milestones: true, rewardAlerts: true, morningHour: 7, eveningHour: 20,
  });
  const [newHonorific, setNewHonorific] = useState(user?.honorific ?? 'Sir');

  useEffect(() => {
    if (settings) setPrefs(settings.notificationPrefs);
    if (user) setNewHonorific(user.honorific);
  }, [settings, user]);

  async function savePref(key: string, value: boolean) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    if (settings) {
      await saveSettings({ ...settings, notificationPrefs: updated, updatedAt: new Date().toISOString() });
    }
  }

  async function saveHonorific() {
    if (!user || !newHonorific.trim()) return;
    await setUser({ ...user, honorific: newHonorific.trim() });
    Alert.alert('Updated', `Alfred will now address you as "${newHonorific}", ${newHonorific}.`);
  }

  function startAnewFlow() {
    Alert.alert(
      'Start Anew?',
      `Are you certain, ${user?.honorific ?? 'Sir'}? Every record — tracks, XP, quests, history — will be expunged. Your login is kept, but this cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Expunge Everything', style: 'destructive', onPress: async () => {
          await startAnew();
          await reload(); // user record cleared -> app routes back into onboarding
        }},
      ]
    );
  }

  function signOutFlow() {
    Alert.alert('Sign Out?', 'Your data is kept and will return when you sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); await reload(); } },
    ]);
  }

  const notifToggles = [
    { key: 'morningBriefing', label: 'Morning Briefing', sub: 'Daily intel from Alfred each morning' },
    { key: 'eveningWarning', label: 'Evening Warning', sub: 'Alert when compulsory quests are incomplete' },
    { key: 'streakAtRisk', label: 'Streak at Risk', sub: 'Alert when your streak is about to break' },
    { key: 'milestones', label: 'Milestone Alerts', sub: '60, 30, 14, 7 days to key dates' },
    { key: 'rewardAlerts', label: 'Reward Alerts', sub: 'Lore drops and title unlocks' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ color: colors.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>The Armoury</Text>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>Settings</Text>

        {/* Identity */}
        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 }}>
          <Text style={{ color: colors.gold, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Identity</Text>
          <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 4 }}>HONORIFIC</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput style={{ flex: 1, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, color: colors.text, padding: 10, fontSize: 13 }}
              value={newHonorific} onChangeText={setNewHonorific} placeholderTextColor={colors.muted}
            />
            <TouchableOpacity onPress={saveHonorific} style={{ borderWidth: 1, borderColor: colors.gold, padding: 10, justifyContent: 'center' }}>
              <Text style={{ color: colors.gold, fontSize: 11 }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 }}>
          <Text style={{ color: colors.gold, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Notifications</Text>
          {notifToggles.map(t => (
            <View key={t.key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ color: colors.text, fontSize: 13 }}>{t.label}</Text>
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 1 }}>{t.sub}</Text>
              </View>
              <Switch
                value={(prefs as unknown as Record<string, boolean>)[t.key] ?? true}
                onValueChange={v => savePref(t.key, v)}
                trackColor={{ false: colors.border, true: colors.gold }}
                thumbColor={colors.text}
              />
            </View>
          ))}
        </View>

        {/* Danger Zone */}
        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: '#3a0000', padding: 16 }}>
          <Text style={{ color: colors.strength, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Danger Zone</Text>
          <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 12 }}>Sign Out keeps your data. Start Anew erases everything and restarts onboarding — your login stays the same.</Text>
          <TouchableOpacity onPress={signOutFlow} style={{ borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ color: colors.muted, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>SIGN OUT</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={startAnewFlow} style={{ borderWidth: 1, borderColor: colors.strength, padding: 14, alignItems: 'center' }}>
            <Text style={{ color: colors.strength, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>⚠ START ANEW</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
