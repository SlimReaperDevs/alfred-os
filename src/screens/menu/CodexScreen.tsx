import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import { useApp } from '../../context/AppContext';
import { getTemplate } from '../../engine/templates';
import { colors } from '../../theme/colors';
import type { Resource } from '../../types';
import * as DS from '../../services/DataService';

export default function CodexScreen() {
  const { user, tracks } = useApp();
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [addingForTrack, setAddingForTrack] = useState<string | null>(null);

  React.useEffect(() => {
    DS.getResources().then(setResources);
  }, []);

  async function ensurePreloaded() {
    const existing = await DS.getResources();
    const newResources: Resource[] = [];
    for (const track of tracks) {
      const template = getTemplate(track.templateType);
      for (const r of template.resources) {
        const exists = existing.some(e => e.trackId === track.id && e.title === r.title);
        if (!exists) {
          newResources.push({ ...r, id: uuid(), trackId: track.id, createdAt: new Date().toISOString() });
        }
      }
    }
    if (newResources.length > 0) {
      const all = [...existing, ...newResources];
      await DS.saveResources(all);
      setResources(all);
    }
  }

  React.useEffect(() => { ensurePreloaded(); }, [tracks]);

  async function addResource(trackId: string) {
    if (!newTitle.trim() || !newUrl.trim()) return;
    const resource: Resource = {
      id: uuid(), trackId, title: newTitle.trim(), url: newUrl.trim(),
      notes: newNotes.trim(), source: 'user', createdAt: new Date().toISOString(),
    };
    await DS.upsertResource(resource);
    setResources(prev => [...prev, resource]);
    setNewTitle(''); setNewUrl(''); setNewNotes(''); setAddingForTrack(null);
    Alert.alert('Resource Added', `The Codex has been updated, ${user?.honorific}.`);
  }

  const activeTracks = tracks.filter(t => t.status === 'active');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ color: colors.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>The Codex</Text>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Resource Library</Text>

        {activeTracks.map(track => {
          const trackResources = resources.filter(r => r.trackId === track.id);
          return (
            <View key={track.id} style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 12, padding: 16 }}>
              <Text style={{ color: colors.blue, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{track.templateType}</Text>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>{track.name}</Text>

              {trackResources.map(r => (
                <TouchableOpacity key={r.id} onPress={() => r.url && Linking.openURL(r.url)} activeOpacity={0.7}
                  style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 10 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: r.source === 'preloaded' ? colors.gold : colors.cyan, marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>{r.title}</Text>
                      {r.notes ? <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{r.notes}</Text> : null}
                    </View>
                    {r.url ? <Text style={{ color: colors.muted, fontSize: 16 }}>→</Text> : null}
                  </View>
                </TouchableOpacity>
              ))}

              {addingForTrack === track.id ? (
                <View style={{ marginTop: 12 }}>
                  {[
                    { label: 'Title', value: newTitle, set: setNewTitle, placeholder: 'Resource title...' },
                    { label: 'URL', value: newUrl, set: setNewUrl, placeholder: 'https://...' },
                    { label: 'Notes (optional)', value: newNotes, set: setNewNotes, placeholder: 'Brief description...' },
                  ].map(f => (
                    <TextInput key={f.label} style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, color: colors.text, padding: 10, marginBottom: 8, fontSize: 12 }}
                      placeholder={f.placeholder} placeholderTextColor={colors.muted} value={f.value} onChangeText={f.set}
                    />
                  ))}
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => setAddingForTrack(null)} style={{ flex: 1, borderWidth: 1, borderColor: colors.border, padding: 10, alignItems: 'center' }}>
                      <Text style={{ color: colors.muted, fontSize: 11 }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => addResource(track.id)} style={{ flex: 1, borderWidth: 1, borderColor: colors.cyan, padding: 10, alignItems: 'center' }}>
                      <Text style={{ color: colors.cyan, fontFamily: 'monospace', fontSize: 11, letterSpacing: 1 }}>ADD RESOURCE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setAddingForTrack(track.id)} style={{ marginTop: 10, borderWidth: 1, borderColor: colors.border, padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: colors.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>+ ADD RESOURCE</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
