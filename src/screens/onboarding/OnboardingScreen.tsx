import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import { useApp } from '../../context/AppContext';
import { getAllTemplates, getTemplate } from '../../engine/templates';
import type { User, Honorific, Track, TrackTemplateType } from '../../types';
import { colors } from '../../theme/colors';

type Step = 'honorific' | 'name' | 'character' | 'track' | 'dates' | 'complete';

const HONORIFICS: Honorific[] = ['Sir', "Ma'am", 'Mx', 'Commander'];

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const { setUser, upsertTrack } = useApp();
  const [step, setStep] = useState<Step>('honorific');
  const [honorific, setHonorific] = useState<Honorific>('Sir');
  const [customHonorific, setCustomHonorific] = useState('');
  const [name, setName] = useState('');
  const [career, setCareer] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [backstory, setBackstory] = useState('');
  const [charisma, setCharisma] = useState(10);
  const [selectedTemplate, setSelectedTemplate] = useState<TrackTemplateType>('hyrox');
  const [trackName, setTrackName] = useState('');
  const [keyDate, setKeyDate] = useState('');

  const finalHonorific: Honorific = customHonorific.trim() || honorific;
  const templates = getAllTemplates();

  async function handleComplete() {
    const userId = uuid();
    const template = getTemplate(selectedTemplate);

    const user: User = {
      id: userId,
      email: '',
      honorific: finalHonorific,
      displayName: name.trim() || finalHonorific,
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
      characterData: {
        name: name.trim(),
        career: career.trim(),
        age: age ? parseInt(age) : null,
        height: height ? parseInt(height) : null,
        weight: weight ? parseInt(weight) : null,
        hobbies: hobbies.trim(),
        backstory: backstory.trim(),
        charisma,
      },
    };

    const track: Track = {
      id: uuid(),
      userId,
      templateType: selectedTemplate,
      name: trackName.trim() || template.name,
      currentPhaseIndex: 0,
      keyDates: keyDate ? [{ label: selectedTemplate === 'pmp' ? 'Exam Date' : 'Race Date', date: keyDate }] : [],
      status: 'active',
      startDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await setUser(user);
    await upsertTrack(track);
    onComplete();
  }

  function alfredMessage(text: string) {
    return (
      <View className="flex-row items-start mb-6">
        <View className="w-8 h-8 rounded-full bg-[#0e0e12] border border-[#c9a84c] items-center justify-center mr-3 mt-1">
          <Text className="text-[#c9a84c] text-sm font-bold">A</Text>
        </View>
        <View className="flex-1 bg-[#0e0e12] border border-[#1a1a24] p-4 rounded">
          <Text className="text-[#e8e8f0] text-sm leading-6">{text}</Text>
        </View>
      </View>
    );
  }

  function nextButton(label: string, onPress: () => void, disabled = false) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        className={`border py-4 items-center mt-4 ${disabled ? 'border-[#1a1a24]' : 'border-[#c9a84c]'}`}
      >
        <Text className={`font-mono text-xs tracking-widest uppercase ${disabled ? 'text-[#4a4a5a]' : 'text-[#c9a84c]'}`}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#060608]">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>

          {step === 'honorific' && (
            <View>
              {alfredMessage(`Welcome. Before we begin, how shall I address you?`)}
              <View className="flex-row flex-wrap gap-3 mb-4">
                {HONORIFICS.map(h => (
                  <TouchableOpacity key={h} onPress={() => setHonorific(h)} activeOpacity={0.7}
                    className={`px-5 py-3 border ${honorific === h ? 'border-[#c9a84c]' : 'border-[#1a1a24]'}`}
                  >
                    <Text className={honorific === h ? 'text-[#c9a84c] font-semibold' : 'text-[#4a4a5a]'}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                className="border border-[#1a1a24] bg-[#0e0e12] text-[#e8e8f0] px-4 py-3 mb-2"
                placeholder="Or enter a custom title..."
                placeholderTextColor={colors.muted}
                value={customHonorific}
                onChangeText={setCustomHonorific}
              />
              {nextButton('Confirm →', () => setStep('name'))}
            </View>
          )}

          {step === 'name' && (
            <View>
              {alfredMessage(`And your name, ${finalHonorific}? How shall The System know you?`)}
              <TextInput
                className="border border-[#1a1a24] bg-[#0e0e12] text-[#e8e8f0] px-4 py-3 mb-2"
                placeholder="Your name..."
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={setName}
              />
              {nextButton('Continue →', () => setStep('character'), !name.trim())}
            </View>
          )}

          {step === 'character' && (
            <View>
              {alfredMessage(`Excellent, ${name}. Now — a few details to build your character profile. These shape your D&D ability scores.`)}
              {[
                { label: 'Career / Profession', value: career, set: setCareer, placeholder: 'e.g. Product Manager' },
                { label: 'Age', value: age, set: setAge, placeholder: 'e.g. 30', keyboardType: 'numeric' as const },
                { label: 'Height (cm)', value: height, set: setHeight, placeholder: 'e.g. 180', keyboardType: 'numeric' as const },
                { label: 'Weight (kg)', value: weight, set: setWeight, placeholder: 'e.g. 80', keyboardType: 'numeric' as const },
                { label: 'Hobbies & Interests', value: hobbies, set: setHobbies, placeholder: 'e.g. Running, Reading, Gaming' },
              ].map(field => (
                <View key={field.label} className="mb-3">
                  <Text className="text-[#4a4a5a] font-mono text-xs tracking-widest uppercase mb-1">{field.label}</Text>
                  <TextInput
                    className="border border-[#1a1a24] bg-[#0e0e12] text-[#e8e8f0] px-4 py-3"
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.muted}
                    value={field.value}
                    onChangeText={field.set}
                    keyboardType={field.keyboardType}
                  />
                </View>
              ))}
              <View className="mb-3">
                <Text className="text-[#4a4a5a] font-mono text-xs tracking-widest uppercase mb-1">Backstory (optional)</Text>
                <TextInput
                  className="border border-[#1a1a24] bg-[#0e0e12] text-[#e8e8f0] px-4 py-3"
                  placeholder="A brief description of your journey..."
                  placeholderTextColor={colors.muted}
                  value={backstory}
                  onChangeText={setBackstory}
                  multiline
                  numberOfLines={3}
                />
              </View>
              <View className="mb-3">
                <Text className="text-[#4a4a5a] font-mono text-xs tracking-widest uppercase mb-2">Charisma Score: {charisma} ({charisma >= 10 ? '+' : ''}{Math.floor((charisma - 10) / 2)})</Text>
                <View className="flex-row justify-between">
                  {[8,10,12,14,16,18].map(v => (
                    <TouchableOpacity key={v} onPress={() => setCharisma(v)} activeOpacity={0.7}
                      className={`w-10 h-10 border items-center justify-center ${charisma === v ? 'border-[#c9a84c]' : 'border-[#1a1a24]'}`}
                    >
                      <Text className={charisma === v ? 'text-[#c9a84c] font-bold' : 'text-[#4a4a5a]'}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {nextButton('Forge Character →', () => setStep('track'))}
            </View>
          )}

          {step === 'track' && (
            <View>
              {alfredMessage(`Now, ${finalHonorific} — select your first active track. The System will structure your quests and progress accordingly.`)}
              {templates.map(t => (
                <TouchableOpacity key={t.type} onPress={() => setSelectedTemplate(t.type)} activeOpacity={0.7}
                  className={`flex-row items-center p-4 border mb-2 ${selectedTemplate === t.type ? 'border-[#c9a84c]' : 'border-[#1a1a24]'}`}
                >
                  <Text className="text-2xl mr-3">{t.emoji}</Text>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className={`font-semibold mr-2 ${selectedTemplate === t.type ? 'text-[#e8e8f0]' : 'text-[#4a4a5a]'}`}>{t.name}</Text>
                      {t.popular && <View className="bg-[#c9a84c] px-2 py-0.5 rounded"><Text className="text-[#060608] text-xs font-bold">POPULAR</Text></View>}
                    </View>
                    <Text className="text-[#4a4a5a] text-xs mt-1">{t.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <View className="mt-2 mb-3">
                <Text className="text-[#4a4a5a] font-mono text-xs tracking-widest uppercase mb-1">Custom Name (optional)</Text>
                <TextInput
                  className="border border-[#1a1a24] bg-[#0e0e12] text-[#e8e8f0] px-4 py-3"
                  placeholder={getTemplate(selectedTemplate).name}
                  placeholderTextColor={colors.muted}
                  value={trackName}
                  onChangeText={setTrackName}
                />
              </View>
              {nextButton('Set Track →', () => setStep('dates'))}
            </View>
          )}

          {step === 'dates' && (
            <View>
              {alfredMessage(`One final matter, ${finalHonorific}. When is your target date? I shall begin the countdown immediately.`)}
              <Text className="text-[#4a4a5a] font-mono text-xs tracking-widest uppercase mb-1">
                {selectedTemplate === 'pmp' ? 'Exam Date' : 'Target / Race Date'} (YYYY-MM-DD)
              </Text>
              <TextInput
                className="border border-[#1a1a24] bg-[#0e0e12] text-[#e8e8f0] px-4 py-3 mb-4"
                placeholder="e.g. 2026-11-15"
                placeholderTextColor={colors.muted}
                value={keyDate}
                onChangeText={setKeyDate}
              />
              {nextButton('Continue →', () => setStep('complete'))}
            </View>
          )}

          {step === 'complete' && (
            <View className="items-center">
              <View className="w-20 h-20 rounded-full border-2 border-[#c9a84c] items-center justify-center mb-6">
                <Text className="text-[#c9a84c] text-4xl font-bold">A</Text>
              </View>
              {alfredMessage(`Splendid. The Manor is ready, ${finalHonorific}. Welcome home.`)}
              {nextButton('Enter The Manor →', handleComplete)}
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
