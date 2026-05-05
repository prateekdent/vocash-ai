import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { TransactionsScreen } from '../screens/main/TransactionsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { DashboardIcon, TransactionsIcon, ProfileIcon } from './TabBarIcons';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ACCENT = '#6C63FF';
const INACTIVE = '#B0B0BE';

export function MainNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: { borderTopColor: '#EFEFEF' },
      }}>
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TransactionsIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <DashboardIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <ProfileIcon color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
