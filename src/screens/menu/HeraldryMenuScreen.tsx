import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';

const MENU_ITEMS = [
  { key: 'Codex',    label: 'The Codex',          sub: 'Resource library per track',         color: colors.blue },
  { key: 'Armoury',  label: 'The Armoury',         sub: 'Settings & preferences',             color: colors.gold },
  { key: 'Registry', label: 'The Grand Registry',  sub: 'Browse & add track templates',       color: colors.phase2 },
  { key: 'Ledger',   label: 'The Ledger',          sub: 'Data export & backup',               color: colors.cyan },
  { key: 'Guildhall',label: 'The Guildhall',       sub: 'Help, onboarding & app info',        color: colors.run },
];

export default function HeraldryMenuScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView className="flex-1 bg-[#060608]">
      {/* Header */}
      <View className="px-6 pt-6 pb-8 border-b border-[#1a1a24]">
        <View className="w-12 h-12 rounded-full bg-[#0e0e12] border border-[#c9a84c] items-center justify-center mb-4">
          <Text className="text-[#c9a84c] text-lg font-bold">A</Text>
        </View>
        <Text className="text-[#4a4a5a] font-mono text-xs tracking-widest uppercase mb-1">Alfred OS · Butler System</Text>
        <Text className="text-[#e8e8f0] text-xl font-bold">How may I assist, Sir?</Text>
      </View>

      {/* Menu items */}
      <View className="flex-1 px-6 pt-6">
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            className="flex-row items-center py-4 border-b border-[#1a1a24]"
            onPress={() => navigation.navigate(item.key)}
            activeOpacity={0.7}
          >
            <View className="w-1 h-8 rounded-full mr-4" style={{ backgroundColor: item.color }} />
            <View className="flex-1">
              <Text className="text-[#e8e8f0] text-base font-semibold">{item.label}</Text>
              <Text className="text-[#4a4a5a] text-xs mt-0.5">{item.sub}</Text>
            </View>
            <Text className="text-[#4a4a5a] text-lg">›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Close button */}
      <View className="px-6 pb-8">
        <TouchableOpacity
          className="border border-[#1a1a24] py-3 items-center rounded"
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text className="text-[#4a4a5a] font-mono text-xs tracking-widest uppercase">Dismiss</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
