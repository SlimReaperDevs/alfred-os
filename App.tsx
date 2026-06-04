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

const ONBOARDING_KEY = 'alfred:onboarding_complete';
const INTRO_KEY = 'alfred:intro_seen';

function AppGate() {
  const { user, tracks, activity, quests, settings, reload } = useApp();
  const [introSeen, setIntroSeen] = useState<boolean | null>(null);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const intro = await AsyncStorage.getItem(INTRO_KEY);
      const onboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
      setIntroSeen(intro === 'true');
      setOnboardingDone(onboarding === 'true');
    })();
  }, []);

  useEffect(() => {
    if (isExpoGo || !user || !tracks.length || !settings) return;
    requestPermissions().then(granted => {
      if (granted) scheduleAllNotifications(user, tracks, activity, quests, settings as Settings);
    });
  }, [user, tracks.length]);

  if (introSeen === null || onboardingDone === null) return null;

  if (!introSeen) {
    return (
      <CinematicIntroScreen onCommence={async () => {
        await AsyncStorage.setItem(INTRO_KEY, 'true');
        setIntroSeen(true);
      }} />
    );
  }

  if (!onboardingDone || !user) {
    return (
      <OnboardingScreen onComplete={async () => {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        await reload();
        setOnboardingDone(true);
      }} />
    );
  }

  return <RootNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#060608" />
      <AppProvider>
        <AppGate />
      </AppProvider>
    </SafeAreaProvider>
  );
}
