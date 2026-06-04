import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp } from '../context/AppContext';
import { abilityModifier, levelProgress, xpForNextLevel } from '../engine/XpEngine';
import { colors } from '../theme/colors';

function SysPanel({ children }: { children: React.ReactNode }) {
  return <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 12, padding: 16 }}>{children}</View>;
}

function Tag({ label, color }: { label: string; color?: string }) {
  return <Text style={{ color: color ?? colors.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{label}</Text>;
}

const ABILITY_COLORS: Record<string, string> = {
  strength: colors.strength,
  dexterity: colors.run,
  constitution: colors.blue,
  intelligence: colors.gold,
  wisdom: colors.phase2,
  charisma: colors.cyan,
};

export default function HallOfRecordsScreen() {
  const { user, characterState, setUser } = useApp();
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCareer, setEditCareer] = useState('');
  const [editBackstory, setEditBackstory] = useState('');

  if (!user || !characterState) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>Loading character...</Text>
      </View>
    );
  }

  const { totalXp, overallLevel, trainingLevel, knowledgeLevel, abilityScores, unlockedProficiencies, unlockedTitles, unlockedLoreDrops } = characterState;

  async function saveCharacter() {
    if (!user) return;
    const updated = {
      ...user,
      displayName: editName.trim() || user.displayName,
      characterData: {
        ...user.characterData,
        name: editName.trim() || user.characterData.name,
        career: editCareer.trim() || user.characterData.career,
        backstory: editBackstory.trim() || user.characterData.backstory,
      },
    };
    await setUser(updated);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditModal(false);
    Alert.alert('Character Updated', `The records have been amended, ${user.honorific}.`);
  }

  function openEdit() {
    setEditName(user.characterData.name);
    setEditCareer(user.characterData.career);
    setEditBackstory(user.characterData.backstory);
    setEditModal(true);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Character Header */}
        <SysPanel>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Text style={{ color: colors.gold, fontSize: 22, fontWeight: 'bold' }}>{(user.characterData.name || user.honorific).charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Tag label="Character Sheet" color={colors.phase2} />
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>{user.characterData.name || user.honorific}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{user.characterData.career || 'Adventurer'} · Level {overallLevel}</Text>
            </View>
            <TouchableOpacity onPress={openEdit} style={{ borderWidth: 1, borderColor: colors.border, padding: 8 }}>
              <Text style={{ color: colors.muted, fontSize: 11 }}>✎ Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>Level {overallLevel}</Text>
              <Text style={{ color: colors.muted, fontSize: 11 }}>{totalXp} XP · {xpForNextLevel(totalXp)} to next</Text>
            </View>
            <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2 }}>
              <View style={{ height: 4, backgroundColor: colors.phase2, borderRadius: 2, width: `${levelProgress(totalXp)}%` }} />
            </View>
          </View>
        </SysPanel>

        {/* D&D Ability Scores */}
        <SysPanel>
          <Tag label="Ability Scores" color={colors.gold} />
          <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 12 }}>Derived from real progress</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(abilityScores).map(([ability, score]) => {
              const mod = abilityModifier(score);
              return (
                <View key={ability} style={{ width: '30%', backgroundColor: colors.bg, borderWidth: 1, borderColor: ABILITY_COLORS[ability] ?? colors.border, padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: ABILITY_COLORS[ability] ?? colors.text, fontFamily: 'monospace', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{ability.slice(0, 3).toUpperCase()}</Text>
                  <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>{score}</Text>
                  <Text style={{ color: ABILITY_COLORS[ability] ?? colors.muted, fontSize: 12 }}>{mod >= 0 ? `+${mod}` : mod}</Text>
                </View>
              );
            })}
          </View>
        </SysPanel>

        {/* Level Breakdown */}
        <SysPanel>
          <Tag label="Progression" />
          <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 12 }}>Level Breakdown</Text>
          {[
            { label: 'Training Level', value: trainingLevel, color: colors.phase1 },
            { label: 'Knowledge Level', value: knowledgeLevel, color: colors.gold },
            { label: 'Overall Level', value: overallLevel, color: colors.phase2 },
          ].map(item => (
            <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.text, fontSize: 13 }}>{item.label}</Text>
              <Text style={{ color: item.color, fontSize: 16, fontWeight: 'bold' }}>LV {item.value}</Text>
            </View>
          ))}
        </SysPanel>

        {/* Proficiencies */}
        <SysPanel>
          <Tag label="Proficiencies & Feats" />
          {unlockedProficiencies.length === 0 ? (
            <Text style={{ color: colors.muted, fontSize: 12 }}>Complete sessions to unlock proficiencies.</Text>
          ) : unlockedProficiencies.map(p => (
            <View key={p} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
              <Text style={{ color: colors.run, fontSize: 12, marginRight: 8 }}>✓</Text>
              <Text style={{ color: colors.text, fontSize: 13 }}>{p}</Text>
            </View>
          ))}
        </SysPanel>

        {/* Titles & Badges */}
        <SysPanel>
          <Tag label="Titles & Badges" color={colors.gold} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {unlockedTitles.map(t => (
              <View key={t.id} style={{ borderWidth: 1, borderColor: t.unlocked ? colors.gold : colors.border, paddingHorizontal: 10, paddingVertical: 8, opacity: t.unlocked ? 1 : 0.3 }}>
                <Text style={{ color: t.unlocked ? colors.gold : colors.muted, fontSize: 12, fontWeight: t.unlocked ? 'bold' : 'normal' }}>{t.unlocked ? t.name : '???'}</Text>
                <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>{t.unlockCondition}</Text>
              </View>
            ))}
          </View>
        </SysPanel>

        {/* Lore Drops */}
        <SysPanel>
          <Tag label="Alfred's Codex — Sealed Lore" color={colors.cyan} />
          <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 12 }}>Complete weekly bounties to unlock entries.</Text>
          {unlockedLoreDrops.map((lore, idx) => (
            <View key={lore.id} style={{ borderWidth: 1, borderColor: lore.unlocked ? colors.border : colors.border, padding: 12, marginBottom: 8, opacity: lore.unlocked ? 1 : 0.4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ color: colors.cyan, fontSize: 11, marginRight: 8 }}>{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</Text>
                <Text style={{ color: lore.unlocked ? colors.text : colors.muted, fontWeight: 'bold', fontSize: 13 }}>{lore.unlocked ? lore.title : 'Sealed Entry'}</Text>
              </View>
              {lore.unlocked && <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>{lore.content}</Text>}
              {!lore.unlocked && <Text style={{ color: colors.muted, fontSize: 11 }}>Complete another weekly bounty to unlock.</Text>}
            </View>
          ))}
        </SysPanel>

        {/* Background */}
        {user.characterData.backstory ? (
          <SysPanel>
            <Tag label="Character Background" />
            <Text style={{ color: colors.text, fontSize: 13, lineHeight: 20 }}>{user.characterData.backstory}</Text>
            {user.characterData.age && <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>Age: {user.characterData.age} · Height: {user.characterData.height}cm · Weight: {user.characterData.weight}kg</Text>}
          </SysPanel>
        ) : null}

      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModal} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: colors.bg, padding: 24 }}>
          <Tag label="Edit Character" color={colors.phase2} />
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Forge Your Identity</Text>
          {[
            { label: 'Name / Callsign', value: editName, set: setEditName },
            { label: 'Career / Profession', value: editCareer, set: setEditCareer },
          ].map(f => (
            <View key={f.label} style={{ marginBottom: 12 }}>
              <Text style={{ color: colors.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</Text>
              <TextInput style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, padding: 12 }} value={f.value} onChangeText={f.set} placeholderTextColor={colors.muted} />
            </View>
          ))}
          <Text style={{ color: colors.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Backstory</Text>
          <TextInput style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, padding: 12, height: 100, marginBottom: 20 }} value={editBackstory} onChangeText={setEditBackstory} multiline placeholderTextColor={colors.muted} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => setEditModal(false)} style={{ flex: 1, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: 'center' }}>
              <Text style={{ color: colors.muted }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveCharacter} style={{ flex: 1, borderWidth: 1, borderColor: colors.gold, padding: 14, alignItems: 'center' }}>
              <Text style={{ color: colors.gold, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>SAVE CHARACTER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
