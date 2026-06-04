import React from 'react';
import { View, Text } from 'react-native';

export default function GrandRegistryScreen() {
  return (
    <View className="flex-1 bg-[#060608] items-center justify-center">
      <Text className="text-[#a855f7] font-mono text-xs tracking-widest uppercase mb-2">The Grand Registry</Text>
      <Text className="text-[#e8e8f0] text-2xl font-bold">Track Templates</Text>
      <Text className="text-[#4a4a5a] text-sm mt-2">Browse and add new track templates here.</Text>
    </View>
  );
}
