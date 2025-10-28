import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import AddEventScreen from '../screens/AddEventScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import AddRoundScreen from '../screens/AddRoundScreen';
import MatchHistoryScreen from '../screens/MatchHistoryScreen';
import MatchDetailScreen from '../screens/MatchDetailScreen';
import DecksScreen from '../screens/DecksScreen';
import EditDeckScreen from '../screens/EditDeckScreen';

// Type definitions for navigation
export type RootTabParamList = {
  Dashboard: undefined;
  'Match History': undefined;
  Decks: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  'Add Event': undefined;
  'Event Detail': { eventId: string };
  'Add Round': { eventId: string; roundNumber: number };
  'Match Detail': { matchId: string };
  'Edit Deck': { deckId?: string };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Match History"
        component={MatchHistoryScreen}
        options={{
          tabBarLabel: 'History',
        }}
      />
      <Tab.Screen
        name="Decks"
        component={DecksScreen}
        options={{
          tabBarLabel: 'Decks',
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const isDark = false; // Force light mode

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerTintColor: isDark ? '#fff' : '#000',
          headerStyle: {
            backgroundColor: isDark ? '#000' : '#fff',
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Add Event"
          component={AddEventScreen}
          options={{
            presentation: 'modal',
            title: 'New Event',
          }}
        />
        <Stack.Screen
          name="Event Detail"
          component={EventDetailScreen}
          options={{
            title: 'Event Details',
          }}
        />
        <Stack.Screen
          name="Add Round"
          component={AddRoundScreen}
          options={{
            presentation: 'modal',
            title: 'Add Round',
          }}
        />
        <Stack.Screen
          name="Match Detail"
          component={MatchDetailScreen}
          options={{
            title: 'Match Details',
          }}
        />
        <Stack.Screen
          name="Edit Deck"
          component={EditDeckScreen}
          options={({ route }) => ({
            presentation: 'modal',
            title: route.params?.deckId ? 'Edit Deck' : 'New Deck',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
