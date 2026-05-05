import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainNavigator } from './MainNavigator';
import { BudgetScreen } from '../screens/main/BudgetScreen';
import { VoiceScreen } from '../screens/main/VoiceScreen';
import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

const SHARED_HEADER_OPTIONS = {
  headerBackTitle: 'Back',
  headerTintColor: '#6C63FF',
  headerStyle: { backgroundColor: '#F7F8FC' },
  headerShadowVisible: false,
} as const;

export function MainStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tabs"
        component={MainNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ title: 'Budget', ...SHARED_HEADER_OPTIONS }}
      />
      <Stack.Screen
        name="Voice"
        component={VoiceScreen}
        options={{ title: 'Add by Voice', ...SHARED_HEADER_OPTIONS }}
      />
    </Stack.Navigator>
  );
}
