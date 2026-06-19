import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

const PREFIX = 'alfred:tip:';

/**
 * One-time, per-device contextual tooltip shown on first visit to a section.
 * Seen-state lives in AsyncStorage (lightweight nudge, not synced per-account).
 * Onboarding replay clears these keys via resetSectionTips().
 */
export default function SectionTip({ id, text }: { id: string; text: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PREFIX + id).then((v) => { if (!v) setShow(true); });
  }, [id]);

  if (!show) return null;

  async function dismiss() {
    await AsyncStorage.setItem(PREFIX + id, '1');
    setShow(false);
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: 'rgba(201,168,76,0.4)', backgroundColor: 'rgba(201,168,76,0.06)', padding: 12, marginBottom: 12 }}>
      <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.gold, fontSize: 12, fontWeight: 'bold' }}>A</Text>
      </View>
      <Text style={{ flex: 1, color: colors.text, fontSize: 12, lineHeight: 18 }}>{text}</Text>
      <TouchableOpacity onPress={dismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={{ color: colors.muted, fontSize: 14 }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

/** Clears all tooltip seen-state so they show again (used by onboarding replay). */
export async function resetSectionTips(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const tipKeys = keys.filter((k) => k.startsWith(PREFIX));
  if (tipKeys.length) await AsyncStorage.multiRemove(tipKeys);
}
