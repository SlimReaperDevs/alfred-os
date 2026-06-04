import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HeraldricCrestButton() {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('HeraldryMenu')}
      activeOpacity={0.7}
      className="mr-4"
    >
      <View className="w-8 h-8 rounded-full bg-[#0e0e12] border border-[#c9a84c] items-center justify-center">
        <Text className="text-[#c9a84c] text-sm font-bold">A</Text>
      </View>
    </TouchableOpacity>
  );
}
