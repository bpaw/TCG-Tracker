import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../hooks/useTheme';
import { Title, H2, Body, Caption } from '../components/atoms/Text';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useStorageStore } from '../stores/storageStore';
import { useAuthStore } from '../stores/authStore';

type NavigationProp = NativeStackNavigationProp<any>;

type SubscriptionPlan = 'monthly' | 'annual';

export default function PaywallScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { isPurchasing, purchasePackage } = useSubscriptionStore();
  const { setStorageTypeAsync } = useStorageStore();
  const { user, clearPaywallFlag } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('annual');

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface[100],
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingTop: 60,
      paddingBottom: spacing['2xl'],
    },
    header: {
      marginBottom: spacing.xl,
      alignItems: 'center',
    },
    subtitle: {
      textAlign: 'center',
      marginTop: spacing.sm,
      color: colors.text.secondary,
    },
    plansContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.xs,
    },
    planCardWrapper: {
      flex: 1,
      marginHorizontal: spacing.xs,
    },
    planCard: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing['2xl'],
      paddingBottom: spacing.xl,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: 'transparent',
      backgroundColor: colors.surface[200],
      minHeight: 260,
      justifyContent: 'center',
    },
    planCardSelected: {
      borderColor: colors.brand.emerald,
      backgroundColor: colors.brand.emerald + '10',
    },
    planBadge: {
      position: 'absolute',
      top: spacing.sm,
      left: spacing.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: colors.brand.emerald,
    },
    planContent: {
      alignItems: 'center',
    },
    planBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
    },
    planPrice: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: spacing.xs,
      lineHeight: 38,
    },
    planPeriod: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    planSavings: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.brand.emerald,
      marginTop: spacing.sm,
    },
    featuresSection: {
      marginBottom: spacing.xl,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    featureBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.brand.emerald,
      marginTop: 6,
      marginRight: spacing.sm,
    },
    comparisonSection: {
      marginBottom: spacing.xl,
    },
    comparisonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.surface[300],
    },
    comparisonLabel: {
      flex: 1,
    },
    comparisonValue: {
      width: 80,
      textAlign: 'center',
      fontWeight: '600',
    },
    tierColumn: {
      width: 80,
      alignItems: 'center',
    },
    tierHeader: {
      fontWeight: '700',
      marginBottom: spacing.sm,
    },
    freeText: {
      color: colors.text.secondary,
    },
    premiumText: {
      color: colors.brand.emerald,
    },
    buttonContainer: {
      marginBottom: spacing.md,
    },
    skipButton: {
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    skipText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
  }), [colors, spacing]);

  const handlePurchase = async () => {
    try {
      // TODO: Replace with real package from RevenueCat offerings
      const fakePackage = {
        identifier: selectedPlan === 'monthly' ? 'monthly_4_99' : 'annual_35_99',
        packageType: selectedPlan === 'monthly' ? 'MONTHLY' : 'ANNUAL',
      } as any;

      const success = await purchasePackage(fakePackage);

      if (success) {
        // Switch to cloud storage after successful purchase
        await setStorageTypeAsync('cloud');
        // Clear the paywall flag so user doesn't see it again
        clearPaywallFlag();
        // Navigate to main app
        navigation.navigate('Main' as never);
      }
    } catch (error) {
      console.error('[PaywallScreen] Purchase error:', error);
    }
  };

  const handleSkip = async () => {
    // Continue with free tier - user stays on free subscription
    // Clear the paywall flag
    clearPaywallFlag();

    // If already authenticated (coming from profile), go back
    // If not authenticated (came from sign up), navigate to main app
    if (user) {
      // Check if we can go back (came from profile), otherwise go to main
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Main' as never);
      }
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Title>Unlock Premium</Title>
            <Body style={styles.subtitle}>
              Get unlimited access and cloud sync for all your TCG data
            </Body>
          </View>

          {/* Plan Selection */}
          <View style={styles.plansContainer}>
            <View style={styles.planCardWrapper}>
              <TouchableOpacity
                onPress={() => setSelectedPlan('monthly')}
                disabled={isPurchasing}
                activeOpacity={0.7}
                style={{ overflow: 'visible' }}
              >
                <View style={[
                  styles.planCard,
                  selectedPlan === 'monthly' && styles.planCardSelected
                ]}>
                  <View style={styles.planContent}>
                    <Body style={styles.planPrice}>$4</Body>
                    <Caption style={styles.planPeriod}>per month</Caption>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.planCardWrapper}>
              <TouchableOpacity
                onPress={() => setSelectedPlan('annual')}
                disabled={isPurchasing}
                activeOpacity={0.7}
                style={{ overflow: 'visible' }}
              >
                <View style={[
                  styles.planCard,
                  selectedPlan === 'annual' && styles.planCardSelected
                ]}>
                  <View style={styles.planBadge}>
                    <Body style={styles.planBadgeText}>BEST VALUE</Body>
                  </View>
                  <View style={styles.planContent}>
                    <Body style={styles.planPrice}>$35</Body>
                    <Caption style={styles.planPeriod}>per year</Caption>
                    <Caption style={styles.planSavings}>Save $13/year</Caption>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Premium Features */}
          <View style={styles.featuresSection}>
            <H2 style={{ marginBottom: spacing.md }}>Premium Features</H2>
            <Card>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Body>Unlimited events, decks, and matches</Body>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Body>Automatic cloud backup and sync</Body>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Body>Access your data across all devices</Body>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Body>Never lose your match history</Body>
              </View>
            </Card>
          </View>

          {/* Free vs Premium Comparison */}
          <View style={styles.comparisonSection}>
            <H2 style={{ marginBottom: spacing.md }}>Plan Comparison</H2>
            <Card>
              <View style={styles.comparisonRow}>
                <Body style={styles.comparisonLabel}>Feature</Body>
                <View style={styles.tierColumn}>
                  <Body style={[styles.tierHeader, styles.freeText]}>Free</Body>
                </View>
                <View style={styles.tierColumn}>
                  <Body style={[styles.tierHeader, styles.premiumText]}>Premium</Body>
                </View>
              </View>

              <View style={styles.comparisonRow}>
                <Body style={styles.comparisonLabel}>Events</Body>
                <View style={styles.tierColumn}>
                  <Body style={styles.freeText}>5 max</Body>
                </View>
                <View style={styles.tierColumn}>
                  <Body style={styles.premiumText}>Unlimited</Body>
                </View>
              </View>

              <View style={styles.comparisonRow}>
                <Body style={styles.comparisonLabel}>Decks</Body>
                <View style={styles.tierColumn}>
                  <Body style={styles.freeText}>5 max</Body>
                </View>
                <View style={styles.tierColumn}>
                  <Body style={styles.premiumText}>Unlimited</Body>
                </View>
              </View>

              <View style={styles.comparisonRow}>
                <Body style={styles.comparisonLabel}>Matches</Body>
                <View style={styles.tierColumn}>
                  <Body style={styles.freeText}>15 max</Body>
                </View>
                <View style={styles.tierColumn}>
                  <Body style={styles.premiumText}>Unlimited</Body>
                </View>
              </View>

              <View style={[styles.comparisonRow, { borderBottomWidth: 0 }]}>
                <Body style={styles.comparisonLabel}>Cloud Sync</Body>
                <View style={styles.tierColumn}>
                  <Body style={styles.freeText}>—</Body>
                </View>
                <View style={styles.tierColumn}>
                  <Body style={styles.premiumText}>✓</Body>
                </View>
              </View>
            </Card>
          </View>

          {/* Purchase Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={isPurchasing ? 'Processing...' : `Subscribe ${selectedPlan === 'monthly' ? 'Monthly' : 'Annually'}`}
              onPress={handlePurchase}
              disabled={isPurchasing}
              intent="primary"
            />
            {isPurchasing && (
              <ActivityIndicator
                size="small"
                color={colors.brand.emerald}
                style={{ marginTop: spacing.sm }}
              />
            )}
          </View>

          {/* Skip Button */}
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            disabled={isPurchasing}
          >
            <Caption style={styles.skipText}>
              Continue with Free (5 events, 5 decks, 15 matches)
            </Caption>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
