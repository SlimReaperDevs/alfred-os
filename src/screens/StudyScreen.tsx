import React from 'react';
import { View, Text } from 'react-native';

export default function StudyScreen() {
  return (
    <View className="flex-1 bg-[#060608] items-center justify-center">
      <Text className="text-[#00d4ff] font-mono text-xs tracking-widest uppercase mb-2">The Study</Text>
      <Text className="text-[#e8e8f0] text-2xl font-bold">Alfred</Text>
      <Text className="text-[#4a4a5a] text-sm mt-2">Your butler awaits your questions here.</Text>
    </View>
  );
}
