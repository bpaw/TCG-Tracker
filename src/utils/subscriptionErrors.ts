import { Keyboard, Alert } from 'react-native';

/**
 * Handle errors that may be related to subscription limits.
 * Dismisses keyboard and shows upgrade alert for limit errors,
 * or shows a generic error toast for other errors.
 */
export function handleSubscriptionError(
  error: unknown,
  navigation: { navigate: (screen: string) => void },
  showToast: (message: string, type: 'success' | 'error') => void,
  fallbackMessage: string
): void {
  // Dismiss keyboard
  Keyboard.dismiss();

  // Check if it's a limit error
  const errorMessage = error instanceof Error ? error.message : String(error);
  if (errorMessage.includes('limit reached')) {
    // This is expected behavior, not an error - just show upgrade prompt
    Alert.alert(
      'Upgrade to Premium',
      'You\'ve reached the free tier limit. Upgrade to Premium for unlimited access.',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'View Plans',
          onPress: () => navigation.navigate('Paywall'),
        },
      ]
    );
  } else {
    // This is an actual error - log it and show toast
    console.error('Error:', error);
    showToast(fallbackMessage, 'error');
  }
}
