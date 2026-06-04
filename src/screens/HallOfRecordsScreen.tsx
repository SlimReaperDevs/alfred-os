import React from 'react';
import { View, Text } from 'react-native';

export default function HallOfRecordsScreen() {
  return (
    <View className="flex-1 bg-[#060608] items-center justify-center">
      <Text className="text-[#a855f7] font-mono text-xs tracking-widest uppercase mb-2">The Hall of Records</Text>
      <Text className="text-[#e8e8f0] text-2xl font-bold">Character Sheet</Text>
      <Text className="text-[#4a4a5a] text-sm mt-2">Your D&D character and XP progression live here.</Text>
    </View>
  );
}
