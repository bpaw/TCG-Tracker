import React, { useMemo, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';

// App Screens
import DashboardScreen from '../screens/DashboardScreen';
import AddEventScreen from '../screens/AddEventScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import AddRoundScreen from '../screens/AddRoundScreen';
import MatchHistoryScreen from '../screens/MatchHistoryScreen';
import MatchDetailScreen from '../screens/MatchDetailScreen';
import DecksScreen from '../screens/DecksScreen';
import EditDeckScreen from '../screens/EditDeckScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import PaywallScreen from '../screens/PaywallScreen';

// Type definitions for navigation
export type RootTabParamList = {
  Dashboard: undefined;
  'Match History': undefined;
  Decks: undefined;
  Calendar: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  'Sign Up': undefined;
  'Forgot Password': undefined;
  Paywall: undefined;
};

export type AppStackParamList = {
  Main: undefined;
  'Add Event': undefined;
  'Event Detail': { eventId: string };
  'Add Round': { eventId: string; roundNumber: number };
  'Match Detail': { matchId: string };
  'Edit Deck': { deckId?: string };
  Paywall: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function MainTabs() {
  const { colors } = useTheme();

  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarActiveTintColor: colors.brand.violet, // Electric violet
    tabBarInactiveTintColor: colors.text.muted,
    tabBarStyle: {
      backgroundColor: colors.surface[300],
      borderTopColor: colors.surface[400],
    },
  }), [colors]);

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Match History"
        component={MatchHistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Decks"
        component={DecksScreen}
        options={{
          tabBarLabel: 'Decks',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cards" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Auth Navigator - for unauthenticated users
function AuthNavigator() {
  const { colors } = useTheme();

  const screenOptions = useMemo(() => ({
    headerShown: false,
    headerTintColor: colors.text.primary,
    headerStyle: {
      backgroundColor: colors.surface[100],
    },
    headerTitleStyle: {
      color: colors.text.primary,
    },
  }), [colors]);

  return (
    <AuthStack.Navigator screenOptions={screenOptions}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen
        name="Sign Up"
        component={SignUpScreen}
        options={{ headerShown: true, title: 'Create Account' }}
      />
      <AuthStack.Screen
        name="Forgot Password"
        component={ForgotPasswordScreen}
        options={{ headerShown: true, title: 'Reset Password' }}
      />
      <AuthStack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ headerShown: false }}
      />
    </AuthStack.Navigator>
  );
}

// Wrapper component that checks for paywall flag and redirects
function MainTabsWrapper() {
  const navigation = useNavigation<any>();
  const { shouldShowPaywall } = useAuthStore();

  useEffect(() => {
    if (shouldShowPaywall) {
      // Navigate to paywall immediately when this screen mounts
      navigation.navigate('Paywall');
    }
  }, [shouldShowPaywall, navigation]);

  return <MainTabs />;
}

// App Navigator - for authenticated users
function AppNavigator() {
  const { colors } = useTheme();
  const { clearPaywallFlag } = useAuthStore();

  const screenOptions = useMemo(() => ({
    headerShown: true,
    headerTintColor: colors.text.primary,
    headerStyle: {
      backgroundColor: colors.surface[100],
    },
    headerTitleStyle: {
      color: colors.text.primary,
    },
  }), [colors]);

  return (
    <AppStack.Navigator screenOptions={screenOptions}>
      <AppStack.Screen
        name="Main"
        component={MainTabsWrapper}
        options={{ headerShown: false }}
      />
      <AppStack.Screen
        name="Add Event"
        component={AddEventScreen}
        options={{
          presentation: 'modal',
          title: 'New Event',
        }}
      />
      <AppStack.Screen
        name="Event Detail"
        component={EventDetailScreen}
        options={{
          title: 'Event Details',
        }}
      />
      <AppStack.Screen
        name="Add Round"
        component={AddRoundScreen}
        options={{
          presentation: 'modal',
          title: 'Add Round',
        }}
      />
      <AppStack.Screen
        name="Match Detail"
        component={MatchDetailScreen}
        options={{
          title: 'Match Details',
        }}
      />
      <AppStack.Screen
        name="Edit Deck"
        component={EditDeckScreen}
        options={({ route }) => ({
          presentation: 'modal',
          title: route.params?.deckId ? 'Edit Deck' : 'New Deck',
        })}
      />
      <AppStack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
        listeners={{
          blur: () => {
            // Clear the paywall flag when navigating away from paywall
            clearPaywallFlag();
          },
        }}
      />
    </AppStack.Navigator>
  );
}

// Root Navigator - handles auth state
export default function RootNavigator() {
  const { colors } = useTheme();
  const { user, loading, initialized } = useAuthStore();

  // Show loading screen while checking auth state
  if (loading || !initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface[100] }}>
        <ActivityIndicator size="large" color={colors.brand.violet} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
