import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View, useColorScheme, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { useUiStore } from './src/stores/uiStore';
import { useThemeStore } from './src/stores/themeStore';
import { useAuthStore } from './src/stores/authStore';
import { useStorageStore } from './src/stores/storageStore';
import { useSubscriptionStore } from './src/stores/subscriptionStore';
import { initializeConfig } from './src/data/repository/config';

export default function App() {
  const { isDark, loadTheme } = useThemeStore();
  const { initialized, initialize, toast, hideToast } = useUiStore();
  const { initialize: initializeAuth } = useAuthStore();
  const { loadStorageType } = useStorageStore();
  const { initialize: initializeSubscription } = useSubscriptionStore();

  useEffect(() => {
    const initializeApp = async () => {
      loadTheme();
      initialize();
      initializeAuth();
      await initializeConfig(); // Load storage preference from AsyncStorage
      loadStorageType(); // Sync store with loaded config
      await initializeSubscription(); // Initialize RevenueCat and load subscription status
    };

    initializeApp();
  }, []);

  if (!initialized) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#000' : '#fff'}
      />
      <RootNavigator />

      {/* Toast Notification */}
      {toast?.visible && (
        <View style={[
          styles.toast,
          toast.type === 'success' && styles.toastSuccess,
          toast.type === 'error' && styles.toastError,
          toast.type === 'info' && styles.toastInfo,
        ]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingContainerDark: {
    backgroundColor: '#000',
  },
  loadingText: {
    fontSize: 16,
    color: '#000',
  },
  loadingTextDark: {
    color: '#fff',
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toastSuccess: {
    backgroundColor: '#34C759',
  },
  toastError: {
    backgroundColor: '#FF3B30',
  },
  toastInfo: {
    backgroundColor: '#007AFF',
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
