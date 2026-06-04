import React from 'react';
import { View, Text } from 'react-native';

export default function BattlegroundsScreen() {
  return (
    <View className="flex-1 bg-[#060608] items-center justify-center">
      <Text className="text-[#4a9eff] font-mono text-xs tracking-widest uppercase mb-2">The Battlegrounds</Text>
      <Text className="text-[#e8e8f0] text-2xl font-bold">Active Tracks</Text>
      <Text className="text-[#4a4a5a] text-sm mt-2">Your goals and training logs will live here.</Text>
    </View>
  );
}
