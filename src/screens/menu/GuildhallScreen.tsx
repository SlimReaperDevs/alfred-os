import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';

export default function GuildhallScreen() {
  const { user } = useApp();

  const sections = [
    {
      title: 'About Alfred OS',
      color: colors.run,
      items: [
        { label: 'Version', value: '2.0.0' },
        { label: 'Build', value: 'Personal OS · British Butler + DnD Edition' },
        { label: 'Character', value: user?.characterData.name || 'Not set' },
      ],
    },
    {
      title: 'How Alfred Works',
      color: colors.blue,
      items: [
        { label: 'Daily Briefing', value: 'Generated fresh each morning from your live data.' },
        { label: 'XP System', value: 'Earn XP for every logged activity. Level up your character.' },
        { label: 'Quest Engine', value: 'Compulsory quests are penalised if missed. Side quests reward bonus XP.' },
        { label: 'Lore Drops', value: 'Complete weekly bounties to unlock Alfred\'s sealed backstory.' },
      ],
    },
    {
      title: 'Getting Started',
      color: colors.gold,
      items: [
        { label: 'Step 1', value: 'Visit The Battlegrounds to see today\'s session.' },
        { label: 'Step 2', value: 'Log your first session to earn XP and start your streak.' },
        { label: 'Step 3', value: 'Check The Study to speak with Alfred.' },
        { label: 'Step 4', value: 'Add Supabase credentials in .env to enable cloud sync.' },
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ color: colors.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>The Guildhall</Text>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>Help & Info</Text>

        {sections.map(section => (
          <View key={section.title} style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 }}>
            <Text style={{ color: section.color, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>{section.title}</Text>
            {section.items.map(item => (
              <View key={item.label} style={{ marginBottom: 10 }}>
                <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 2 }}>{item.label}</Text>
                <Text style={{ color: colors.text, fontSize: 13, lineHeight: 18 }}>{item.value}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
          <Text style={{ color: colors.phase2, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Alfred's Parting Words</Text>
          <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20, fontStyle: 'italic' }}>
            "The Manor is not merely an application, {user?.honorific ?? 'Sir'}. It is a record of who you chose to become. Every session logged, every quest completed, every bounty conquered — it is all here, in these halls. I shall continue to serve, as long as you continue to endeavour."
          </Text>
          <Text style={{ color: colors.gold, fontSize: 11, marginTop: 8 }}>— Alfred, House Butler & System Overseer</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
