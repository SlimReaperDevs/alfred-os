import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { colors } from '../theme/colors';
import { resetSectionTips } from './SectionTip';

const BEATS = [
  { icon: '⚡', title: 'Earn as you act', body: 'Every session, run, or chapter you log earns XP and levels up your character. Your progress is real, and so is your growth.' },
  { icon: '⚔', title: 'Quests keep you honest', body: 'Compulsory quests come from your tracks — miss them and there is a penalty. Side quests and weekly bounties earn bonus XP.' },
  { icon: '🏆', title: 'Titles & sealed lore', body: 'Hit milestones to unlock rare titles, and complete bounties to reveal sealed chapters of my story, one by one.' },
];

/** Guildhall "Replay onboarding" — re-shows the explainer beats and re-arms the
 *  contextual tooltips. Never touches user data. */
export default function ReplayTeaching() {
  const [open, setOpen] = useState(false);
  const [beat, setBeat] = useState(0);

  async function start() {
    await resetSectionTips();
    setBeat(0);
    setOpen(true);
  }

  return (
    <>
      <TouchableOpacity onPress={start} style={{ borderWidth: 1, borderColor: colors.blue, padding: 14, alignItems: 'center' }}>
        <Text style={{ color: colors.blue, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>REPLAY ONBOARDING</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 28, width: '100%', maxWidth: 420, alignItems: 'center' }}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>{BEATS[beat].icon}</Text>
            <Text style={{ color: colors.gold, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{beat + 1} of {BEATS.length}</Text>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>{BEATS[beat].title}</Text>
            <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: 20 }}>{BEATS[beat].body}</Text>
            <TouchableOpacity
              onPress={() => (beat < BEATS.length - 1 ? setBeat(beat + 1) : setOpen(false))}
              style={{ borderWidth: 1, borderColor: colors.gold, paddingHorizontal: 40, paddingVertical: 12 }}
            >
              <Text style={{ color: colors.gold, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>{beat < BEATS.length - 1 ? 'NEXT →' : 'DONE'}</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 14, textAlign: 'center' }}>Section tips re-armed — you&apos;ll see them again as you explore.</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}
