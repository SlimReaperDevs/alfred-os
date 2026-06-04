import React from 'react';
import { View, Text } from 'react-native';

export default function ArmouryScreen() {
  return (
    <View className="flex-1 bg-[#060608] items-center justify-center">
      <Text className="text-[#c9a84c] font-mono text-xs tracking-widest uppercase mb-2">The Armoury</Text>
      <Text className="text-[#e8e8f0] text-2xl font-bold">Settings</Text>
      <Text className="text-[#4a4a5a] text-sm mt-2">All preferences and configuration live here.</Text>
    </View>
  );
}
