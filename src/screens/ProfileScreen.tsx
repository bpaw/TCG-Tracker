import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { Title, H2, Body, Caption } from '../components/atoms/Text';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { useTheme } from '../hooks/useTheme';

export default function ProfileScreen() {
  const { colors, spacing } = useTheme();
  const { isDark, toggleTheme } = useThemeStore();
  const { user, signOut } = useAuthStore();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface[100],
    },
    scrollView: {
      flex: 1,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingTop: 60,
      paddingBottom: spacing.md,
    },
    section: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing['2xl'],
    },
    sectionTitle: {
      marginBottom: spacing.sm,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    settingInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    settingLabel: {
      fontWeight: '600',
      marginBottom: 4,
    },
    dangerText: {
      color: colors.brand.coral,
      fontWeight: '600',
      marginBottom: 4,
    },
  }), [colors, spacing]);

  const handleDarkModeToggle = async () => {
    await toggleTheme();
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all events, matches, and decks. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been cleared. Please restart the app.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Title>Settings</Title>
        </View>

        {/* Account Section */}
        {user && (
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>Account</H2>
            <Card>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Body style={styles.settingLabel}>Email</Body>
                  <Caption>{user.email}</Caption>
                </View>
              </View>
            </Card>
            <Button
              title="Sign Out"
              intent="danger"
              onPress={handleSignOut}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}

        {/* Appearance Section */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Appearance</H2>
          <Card>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Body style={styles.settingLabel}>Dark Mode</Body>
                <Caption>Enable dark theme</Caption>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: colors.brand.coral, true: colors.brand.emerald }}
                ios_backgroundColor={colors.brand.coral}
                thumbColor="#fff"
              />
            </View>
          </Card>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Data</H2>
          <TouchableOpacity onPress={handleClearData}>
            <Card>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Body style={styles.dangerText}>Clear All Data</Body>
                  <Caption>Delete all events, matches, and decks</Caption>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>About</H2>
          <Card>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Body style={styles.settingLabel}>Version</Body>
                <Caption>1.0.0</Caption>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
