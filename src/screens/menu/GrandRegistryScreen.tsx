import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import { useApp } from '../../context/AppContext';
import { getAllTemplates, getTemplate } from '../../engine/templates';
import { colors } from '../../theme/colors';
import type { Track, TrackTemplateType } from '../../types';

export default function GrandRegistryScreen() {
  const { user, tracks, upsertTrack } = useApp();
  const [selected, setSelected] = useState<TrackTemplateType | null>(null);
  const [customName, setCustomName] = useState('');

  const templates = getAllTemplates();
  const activeTypes = tracks.filter(t => t.status === 'active').map(t => t.templateType);

  async function addTrack() {
    if (!selected || !user) return;
    const template = getTemplate(selected);
    const track: Track = {
      id: uuid(),
      userId: user.id,
      templateType: selected,
      name: customName.trim() || template.name,
      currentPhaseIndex: 0,
      keyDates: [],
      status: 'active',
      startDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    await upsertTrack(track);
    setSelected(null);
    setCustomName('');
    Alert.alert('Track Added', `${track.name} has been added to The Battlegrounds, ${user.honorific}.`);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ color: colors.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>The Grand Registry</Text>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Track Templates</Text>

        {/* Popular */}
        <Text style={{ color: colors.gold, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Popular</Text>
        {templates.filter(t => t.popular).map(t => renderTemplate(t))}

        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />

        <Text style={{ color: colors.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>All Templates</Text>
        {templates.filter(t => !t.popular).map(t => renderTemplate(t))}

        {selected && (
          <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gold, padding: 16, marginTop: 8 }}>
            <Text style={{ color: colors.gold, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Add Track</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, color: colors.text, padding: 10, marginBottom: 12, fontSize: 13 }}
              placeholder={getTemplate(selected).name}
              placeholderTextColor={colors.muted}
              value={customName}
              onChangeText={setCustomName}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => setSelected(null)} style={{ flex: 1, borderWidth: 1, borderColor: colors.border, padding: 12, alignItems: 'center' }}>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addTrack} style={{ flex: 1, borderWidth: 1, borderColor: colors.gold, padding: 12, alignItems: 'center' }}>
                <Text style={{ color: colors.gold, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>ADD TRACK</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  function renderTemplate(t: ReturnType<typeof getAllTemplates>[0]) {
    const isActive = activeTypes.includes(t.type);
    const isSelected = selected === t.type;
    return (
      <TouchableOpacity key={t.type} onPress={() => !isActive && setSelected(isSelected ? null : t.type)} activeOpacity={0.7}
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: isSelected ? colors.gold : colors.border, padding: 14, marginBottom: 8, opacity: isActive ? 0.5 : 1 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, marginRight: 12 }}>{t.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14, marginRight: 8 }}>{t.name}</Text>
              {t.popular && <View style={{ backgroundColor: colors.gold, paddingHorizontal: 6, paddingVertical: 2 }}><Text style={{ color: colors.bg, fontSize: 9, fontWeight: 'bold' }}>POPULAR</Text></View>}
              {isActive && <View style={{ backgroundColor: colors.run, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 4 }}><Text style={{ color: colors.bg, fontSize: 9, fontWeight: 'bold' }}>ACTIVE</Text></View>}
            </View>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{t.description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
