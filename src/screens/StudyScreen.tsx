import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import { useApp } from '../context/AppContext';
import { query } from '../engine/AlfredEngine';
import { colors } from '../theme/colors';
import type { ChatMessage } from '../types';

const QUICK_ACTIONS = [
  '📊 How am I doing?',
  '⚔ What should I train today?',
  '⚡ Motivate me',
  '📚 Give me a PMP tip',
  '🏁 Race prep status',
  '⬡ Quest status',
];

export default function StudyScreen() {
  const { user, tracks, activity, quests, characterState, chatHistory, appendChat } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  async function sendMessage(text: string) {
    if (!text.trim() || !user) return;
    const userMsg: ChatMessage = { id: uuid(), role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    await appendChat(userMsg);
    setInput('');
    setIsTyping(true);

    // Simulate Alfred thinking
    setTimeout(async () => {
      const ctx = {
        honorific: user.honorific,
        displayName: user.displayName,
        tracks, activity,
        activeQuests: quests.filter(q => q.status === 'active'),
        totalXp: characterState?.totalXp ?? 0,
        overallLevel: characterState?.overallLevel ?? 1,
      };
      const { text: responseText } = query(text.trim(), ctx);
      const alfredMsg: ChatMessage = { id: uuid(), role: 'alfred', content: responseText, timestamp: new Date().toISOString() };
      await appendChat(alfredMsg);
      setIsTyping(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }, 800 + Math.random() * 600);
  }

  function renderMessage({ item }: { item: ChatMessage }) {
    const isAlfred = item.role === 'alfred';
    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, justifyContent: isAlfred ? 'flex-start' : 'flex-end' }}>
        {isAlfred && (
          <View style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 2 }}>
            <Text style={{ color: colors.gold, fontSize: 12, fontWeight: 'bold' }}>A</Text>
          </View>
        )}
        <View style={{
          maxWidth: '78%',
          backgroundColor: isAlfred ? colors.surface : '#1a1a3e',
          borderWidth: 1,
          borderColor: isAlfred ? colors.border : '#2a2a5e',
          padding: 12,
          borderRadius: 2,
        }}>
          <Text style={{ color: colors.text, fontSize: 13, lineHeight: 20 }}>{item.content}</Text>
          <Text style={{ color: colors.muted, fontSize: 10, marginTop: 4 }}>{item.timestamp.slice(11, 16)}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Text style={{ color: colors.gold, fontWeight: 'bold' }}>A</Text>
          </View>
          <View>
            <Text style={{ color: colors.text, fontWeight: 'bold' }}>Alfred — <Text style={{ color: colors.muted, fontWeight: 'normal' }}>Personal System Butler</Text></Text>
            <Text style={{ color: colors.run, fontSize: 11 }}>● Active · Monitoring System</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          {QUICK_ACTIONS.map(qa => (
            <TouchableOpacity key={qa} onPress={() => sendMessage(qa.replace(/^[^\s]+ /, ''))} activeOpacity={0.7}
              style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 2 }}
            >
              <Text style={{ color: colors.muted, fontSize: 11 }}>{qa}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={chatHistory}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ color: colors.gold, fontSize: 13, textAlign: 'center' }}>
                The Study awaits, {user?.honorific ?? 'Sir'}.{'\n'}Ask Alfred anything.
              </Text>
            </View>
          }
        />

        {/* Typing indicator */}
        {isTyping && (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Text style={{ color: colors.gold, fontSize: 12, fontWeight: 'bold' }}>A</Text>
            </View>
            <ActivityIndicator size="small" color={colors.gold} />
            <Text style={{ color: colors.muted, fontSize: 10, marginLeft: 6, fontFamily: 'monospace' }}>Alfred is composing...</Text>
          </View>
        )}

        {/* Input */}
        <View style={{ flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, padding: 12, gap: 8 }}>
          <TextInput
            style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13 }}
            placeholder={`Ask Alfred anything, ${user?.honorific ?? 'Sir'}...`}
            placeholderTextColor={colors.muted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={() => sendMessage(input)} activeOpacity={0.7}
            style={{ backgroundColor: colors.gold, paddingHorizontal: 16, paddingVertical: 12 }}
          >
            <Text style={{ color: colors.bg, fontWeight: 'bold', fontSize: 12 }}>SEND</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
