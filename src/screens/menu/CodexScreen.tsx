import React from 'react';
import { View, Text } from 'react-native';

export default function CodexScreen() {
  return (
    <View className="flex-1 bg-[#060608] items-center justify-center">
      <Text className="text-[#4a9eff] font-mono text-xs tracking-widest uppercase mb-2">The Codex</Text>
      <Text className="text-[#e8e8f0] text-2xl font-bold">Resource Library</Text>
      <Text className="text-[#4a4a5a] text-sm mt-2">Per-track resources will live here.</Text>
    </View>
  );
}
