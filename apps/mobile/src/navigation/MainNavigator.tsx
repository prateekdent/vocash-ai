import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { VoiceScreen } from '../screens/main/VoiceScreen';
import { TransactionsScreen } from '../screens/main/TransactionsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Voice" component={VoiceScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
