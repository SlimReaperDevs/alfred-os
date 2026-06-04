import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import ManorScreen from '../screens/ManorScreen';
import BattlegroundsScreen from '../screens/BattlegroundsScreen';
import StudyScreen from '../screens/StudyScreen';
import HallOfRecordsScreen from '../screens/HallOfRecordsScreen';

import HeraldryMenuScreen from '../screens/menu/HeraldryMenuScreen';
import CodexScreen from '../screens/menu/CodexScreen';
import ArmouryScreen from '../screens/menu/ArmouryScreen';
import GrandRegistryScreen from '../screens/menu/GrandRegistryScreen';
import LedgerScreen from '../screens/menu/LedgerScreen';
import GuildhallScreen from '../screens/menu/GuildhallScreen';

import HeraldricCrestButton from './HeraldricCrestButton';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TAB_ICONS: Record<string, string> = {
  Manor: '⬡',
  Battlegrounds: '⚔',
  Study: '✦',
  HallOfRecords: '⚡',
};

const TAB_LABELS: Record<string, string> = {
  Manor: 'The Manor',
  Battlegrounds: 'Battlegrounds',
  Study: 'The Study',
  HallOfRecords: 'Hall of Records',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' },
        headerRight: () => <HeraldricCrestButton />,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1, height: 64, paddingBottom: 8 },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontFamily: 'SpaceMono', letterSpacing: 0.5 },
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 16, color }}>{TAB_ICONS[route.name] ?? '·'}</Text>
        ),
        title: TAB_LABELS[route.name] ?? route.name,
      })}
    >
      <Tab.Screen name="Manor" component={ManorScreen} />
      <Tab.Screen name="Battlegrounds" component={BattlegroundsScreen} />
      <Tab.Screen name="Study" component={StudyScreen} />
      <Tab.Screen name="HallOfRecords" component={HallOfRecordsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' },
          cardStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="HeraldryMenu" component={HeraldryMenuScreen} options={{ title: 'Alfred OS', presentation: 'modal' }} />
        <Stack.Screen name="Codex" component={CodexScreen} options={{ title: 'The Codex' }} />
        <Stack.Screen name="Armoury" component={ArmouryScreen} options={{ title: 'The Armoury' }} />
        <Stack.Screen name="Registry" component={GrandRegistryScreen} options={{ title: 'The Grand Registry' }} />
        <Stack.Screen name="Ledger" component={LedgerScreen} options={{ title: 'The Ledger' }} />
        <Stack.Screen name="Guildhall" component={GuildhallScreen} options={{ title: 'The Guildhall' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
