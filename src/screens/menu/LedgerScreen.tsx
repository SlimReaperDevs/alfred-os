import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Share, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { exportAllData, flushPendingSync } from '../../services/DataService';
import { colors } from '../../theme/colors';

export default function LedgerScreen() {
  const { user } = useApp();
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  async function handleExport() {
    const json = await exportAllData();
    await Share.share({ message: json, title: 'Alfred OS Data Export' });
  }

  async function handleSync() {
    setIsSyncing(true);
    await flushPendingSync();
    const now = new Date();
    setLastSync(`${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} at ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`);
    setIsSyncing(false);
    Alert.alert('Sync Complete', `All records have been committed to the vault, ${user?.honorific ?? 'Sir'}.`);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ color: colors.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>The Ledger</Text>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>Data & Backup</Text>

        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 }}>
          <Text style={{ color: colors.cyan, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Export</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 16, lineHeight: 18 }}>Export all your data as a JSON file. Share it via your device's native share sheet — save to Files, email, or any other destination.</Text>
          <TouchableOpacity onPress={handleExport} style={{ borderWidth: 1, borderColor: colors.cyan, padding: 14, alignItems: 'center' }}>
            <Text style={{ color: colors.cyan, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>EXPORT ALL DATA</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 }}>
          <Text style={{ color: colors.gold, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Cloud Backup</Text>
          {lastSync && <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 12 }}>Last backed up: {lastSync}, {user?.honorific ?? 'Sir'}.</Text>}
          <TouchableOpacity onPress={handleSync} disabled={isSyncing} style={{ borderWidth: 1, borderColor: colors.gold, padding: 14, alignItems: 'center', opacity: isSyncing ? 0.5 : 1 }}>
            <Text style={{ color: colors.gold, fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>{isSyncing ? 'SYNCING...' : 'SYNC TO VAULT NOW'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
          <Text style={{ color: colors.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Account</Text>
          <Text style={{ color: colors.text, fontSize: 13, marginBottom: 4 }}>{user?.email || 'No account linked'}</Text>
          <Text style={{ color: colors.muted, fontSize: 11 }}>Data stored locally. Supabase sync available when credentials are configured.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
