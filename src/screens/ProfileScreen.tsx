import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStore } from '../stores/themeStore';

export default function ProfileScreen() {
  const { isDark, toggleTheme } = useThemeStore();

  const handleDarkModeToggle = async () => {
    await toggleTheme();
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
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            Settings
          </Text>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Appearance
          </Text>
          <View style={[styles.settingRow, isDark && styles.settingRowDark]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
                Dark Mode
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.settingDescriptionDark]}>
                Enable dark theme
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Data
          </Text>
          <TouchableOpacity
            style={[styles.settingRow, isDark && styles.settingRowDark]}
            onPress={handleClearData}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, styles.dangerText]}>
                Clear All Data
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.settingDescriptionDark]}>
                Delete all events, matches, and decks
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            About
          </Text>
          <View style={[styles.settingRow, isDark && styles.settingRowDark]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
                Version
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.settingDescriptionDark]}>
                1.0.0
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  headerTitleDark: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingRowDark: {
    backgroundColor: '#1C1C1E',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  settingLabelDark: {
    color: '#fff',
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  settingDescriptionDark: {
    color: '#98989F',
  },
  dangerText: {
    color: '#FF3B30',
  },
});
