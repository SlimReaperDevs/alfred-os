import React from 'react';
import { View, Text } from 'react-native';

export default function ManorScreen() {
  return (
    <View className="flex-1 bg-[#060608] items-center justify-center">
      <Text className="text-[#c9a84c] font-mono text-xs tracking-widest uppercase mb-2">The Manor</Text>
      <Text className="text-[#e8e8f0] text-2xl font-bold">Dashboard</Text>
      <Text className="text-[#4a4a5a] text-sm mt-2">Alfred's daily briefing will live here.</Text>
    </View>
  );
}
