import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { useStorageStore } from '../stores/storageStore';
import { Title, H2, Body, Caption } from '../components/atoms/Text';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { useTheme } from '../hooks/useTheme';
import { StorageType } from '../data/repository/interfaces';
import { cloudSyncService } from '../data/repository/cloud/cloudSyncService';
import { checkSupabaseSetup, getSetupInstructions } from '../data/repository/cloud/supabaseSetup';

export default function ProfileScreen() {
  const { colors, spacing } = useTheme();
  const { isDark, toggleTheme } = useThemeStore();
  const { user, signOut } = useAuthStore();
  const { storageType, isChangingStorage, setStorageTypeAsync } = useStorageStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ completed: 0, total: 0 });
  const [queueStatus, setQueueStatus] = useState({ pending: 0, processing: false, online: true });
  const [isCheckingSetup, setIsCheckingSetup] = useState(false);

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
    storageOption: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 8,
      marginBottom: spacing.xs,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    storageOptionActive: {
      backgroundColor: colors.brand.emerald + '20',
      borderColor: colors.brand.emerald,
    },
    storageOptionText: {
      fontWeight: '600',
    },
    storageOptionTextActive: {
      color: colors.brand.emerald,
    },
  }), [colors, spacing]);

  // Update queue status periodically
  useEffect(() => {
    const updateQueueStatus = () => {
      const status = cloudSyncService.getSyncStatus();
      setQueueStatus(status);
    };

    updateQueueStatus();
    const interval = setInterval(updateQueueStatus, 2000); // Update every 2s

    return () => clearInterval(interval);
  }, []);

  const handleDarkModeToggle = async () => {
    await toggleTheme();
  };

  const handleCheckSetup = async () => {
    setIsCheckingSetup(true);

    const setup = await checkSupabaseSetup();

    setIsCheckingSetup(false);

    if (setup.isSetup) {
      Alert.alert(
        'Setup Complete ✓',
        'All required tables exist in Supabase. Cloud sync is ready to use!'
      );
    } else {
      Alert.alert(
        'Setup Required',
        `Missing tables: ${setup.missingTables.join(', ')}\n\n${getSetupInstructions()}`,
        [
          { text: 'OK' }
        ]
      );
    }
  };

  const handleClearQueue = () => {
    const status = cloudSyncService.getSyncStatus();

    if (status.pending === 0) {
      Alert.alert('Queue Empty', 'There are no pending sync operations.');
      return;
    }

    Alert.alert(
      'Clear Sync Queue',
      `This will remove ${status.pending} pending operations from the sync queue. You can re-sync data afterward.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Queue',
          style: 'destructive',
          onPress: async () => {
            await cloudSyncService.clearQueue();
            Alert.alert('Success', 'Sync queue has been cleared.');
          },
        },
      ]
    );
  };

  const handleSyncAllData = async () => {
    if (isSyncing) return;

    // Check setup first
    const setup = await checkSupabaseSetup();
    if (!setup.isSetup) {
      Alert.alert(
        'Setup Required',
        `Please set up Supabase tables first.\n\nMissing: ${setup.missingTables.join(', ')}\n\n${getSetupInstructions()}`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Sync All Data to Cloud',
      'This will upload all your local events, matches, and decks to Supabase. This may take a few moments.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sync Now',
          onPress: async () => {
            setIsSyncing(true);
            setSyncProgress({ completed: 0, total: 0 });

            const result = await cloudSyncService.syncAllDataToCloud((progress) => {
              setSyncProgress(progress);
            });

            setIsSyncing(false);

            if (result.success) {
              Alert.alert('Success', 'All data has been synced to the cloud!');
            } else {
              Alert.alert('Error', result.error || 'Failed to sync data');
            }
          },
        },
      ]
    );
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

  const handleStorageTypeChange = async (type: StorageType) => {
    if (isChangingStorage) return;

    Alert.alert(
      'Change Storage Mode',
      `Switch to ${type.toUpperCase()} storage? ${type === 'cloud' ? 'This will enable cloud sync with Supabase.' : 'This will use local storage only.'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: async () => {
            try {
              await setStorageTypeAsync(type);
              Alert.alert('Success', `Storage mode changed to ${type}. Your existing data remains available.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to change storage mode');
            }
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

        {/* Storage Section */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Storage</H2>
          <Card>
            <View style={styles.settingInfo}>
              <Body style={styles.settingLabel}>Storage Mode</Body>
              <Caption style={{ marginBottom: spacing.md }}>
                Choose where your data is stored
              </Caption>
            </View>

            {/* Sync Queue Status */}
            {storageType === 'cloud' && (
              <View style={{ marginBottom: spacing.md, padding: spacing.sm, backgroundColor: colors.surface[200], borderRadius: 8 }}>
                <Caption>
                  Sync Queue: {queueStatus.pending} pending • {queueStatus.online ? 'Online' : 'Offline'}
                  {queueStatus.processing && ' • Syncing...'}
                </Caption>
              </View>
            )}

            {isChangingStorage && (
              <ActivityIndicator
                size="small"
                color={colors.brand.emerald}
                style={{ marginVertical: spacing.sm }}
              />
            )}

            <TouchableOpacity
              onPress={() => handleStorageTypeChange('sqlite')}
              disabled={isChangingStorage}
            >
              <View style={[
                styles.storageOption,
                storageType === 'sqlite' && styles.storageOptionActive
              ]}>
                <Body style={[
                  styles.storageOptionText,
                  storageType === 'sqlite' && styles.storageOptionTextActive
                ]}>
                  SQLite (Default)
                </Body>
                <Caption>Fast local database with indexed queries</Caption>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStorageTypeChange('asyncstorage')}
              disabled={isChangingStorage}
            >
              <View style={[
                styles.storageOption,
                storageType === 'asyncstorage' && styles.storageOptionActive
              ]}>
                <Body style={[
                  styles.storageOptionText,
                  storageType === 'asyncstorage' && styles.storageOptionTextActive
                ]}>
                  AsyncStorage
                </Body>
                <Caption>Simple key-value storage</Caption>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStorageTypeChange('cloud')}
              disabled={isChangingStorage}
            >
              <View style={[
                styles.storageOption,
                storageType === 'cloud' && styles.storageOptionActive
              ]}>
                <Body style={[
                  styles.storageOptionText,
                  storageType === 'cloud' && styles.storageOptionTextActive
                ]}>
                  Cloud Sync
                </Body>
                <Caption>Local storage with automatic cloud backup</Caption>
              </View>
            </TouchableOpacity>

            {/* Sync Controls - only show for cloud storage */}
            {storageType === 'cloud' && (
              <>
                <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
                  {/* Check Setup Button */}
                  <Button
                    title={isCheckingSetup ? "Checking..." : "Check Supabase Setup"}
                    onPress={handleCheckSetup}
                    disabled={isCheckingSetup}
                    intent="secondary"
                  />

                  {/* Sync Progress */}
                  {isSyncing && (
                    <View style={{ marginTop: spacing.sm }}>
                      <Caption>
                        Syncing: {syncProgress.completed} / {syncProgress.total}
                      </Caption>
                      <View style={{
                        height: 4,
                        backgroundColor: colors.surface[200],
                        borderRadius: 2,
                        marginTop: spacing.xs,
                        overflow: 'hidden'
                      }}>
                        <View style={{
                          height: '100%',
                          width: `${syncProgress.total > 0 ? (syncProgress.completed / syncProgress.total) * 100 : 0}%`,
                          backgroundColor: colors.brand.emerald
                        }} />
                      </View>
                    </View>
                  )}

                  {/* Sync All Data Button */}
                  <Button
                    title={isSyncing ? "Syncing..." : "Sync All Data to Cloud"}
                    onPress={handleSyncAllData}
                    disabled={isSyncing}
                    intent="primary"
                  />
                  <Caption style={{ textAlign: 'center' }}>
                    Upload all local data to Supabase
                  </Caption>

                  {/* Clear Queue Button - show only if queue has items */}
                  {queueStatus.pending > 0 && (
                    <>
                      <View style={{ height: spacing.sm }} />
                      <Button
                        title="Clear Sync Queue"
                        onPress={handleClearQueue}
                        intent="danger"
                      />
                      <Caption style={{ textAlign: 'center', color: colors.brand.coral }}>
                        Remove {queueStatus.pending} failed operation{queueStatus.pending !== 1 ? 's' : ''}
                      </Caption>
                    </>
                  )}
                </View>
              </>
            )}
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
