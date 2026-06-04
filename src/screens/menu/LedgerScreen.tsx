import React from 'react';
import { View, Text } from 'react-native';

export default function LedgerScreen() {
  return (
    <View className="flex-1 bg-[#060608] items-center justify-center">
      <Text className="text-[#00d4ff] font-mono text-xs tracking-widest uppercase mb-2">The Ledger</Text>
      <Text className="text-[#e8e8f0] text-2xl font-bold">Data & Backup</Text>
      <Text className="text-[#4a4a5a] text-sm mt-2">Export and backup your data here.</Text>
    </View>
  );
}
