import 'react-native-get-random-values';
import './src/global.css';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { AppProvider, useApp } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';
import CinematicIntroScreen from './src/screens/onboarding/CinematicIntroScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import { requestPermissions, scheduleAllNotifications } from './src/services/NotificationService';
import type { Settings } from './src/types';

// Notifications don't work in Expo Go from SDK 53 — skip in that context
const isExpoGo = Constants.appOwnership === 'expo';

// The cinematic intro is a per-device flourish; whether the account has
// onboarded is the cloud-backed `onboardingComplete` flag on the user record.
const INTRO_KEY = 'alfred:intro_seen';

function AppGate() {
  const { user, tracks, activity, quests, settings, isLoading, reload } = useApp();
  const [introSeen, setIntroSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(INTRO_KEY).then(v => setIntroSeen(v === 'true'));
  }, []);

  useEffect(() => {
    if (isExpoGo || !user || !tracks.length || !settings) return;
    requestPermissions().then(granted => {
      if (granted) scheduleAllNotifications(user, tracks, activity, quests, settings as Settings);
    });
  }, [user, tracks.length]);

  if (introSeen === null || isLoading) return null;

  if (!introSeen) {
    return (
      <CinematicIntroScreen onCommence={async () => {
        await AsyncStorage.setItem(INTRO_KEY, 'true');
        setIntroSeen(true);
      }} />
    );
  }

  // Gate on the account's onboarding state, not a per-device flag.
  if (!user || !user.onboardingComplete) {
    return <OnboardingScreen onComplete={() => reload()} />;
  }

  return <RootNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppProvider>
        <AppGate />
      </AppProvider>
    </SafeAreaProvider>
  );
}
