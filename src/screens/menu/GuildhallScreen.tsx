import React from 'react';
import { View, Text } from 'react-native';

export default function GuildhallScreen() {
  return (
    <View className="flex-1 bg-[#060608] items-center justify-center">
      <Text className="text-[#22c55e] font-mono text-xs tracking-widest uppercase mb-2">The Guildhall</Text>
      <Text className="text-[#e8e8f0] text-2xl font-bold">Help & Info</Text>
      <Text className="text-[#4a4a5a] text-sm mt-2">Onboarding replay, help and app info live here.</Text>
    </View>
  );
}
