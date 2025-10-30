/**
 * Sign Up Screen
 * Allows users to create an account with email/password or OAuth providers
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../hooks/useTheme';
import { Title, Body, Caption } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';

type NavigationProp = NativeStackNavigationProp<any>;

export default function SignUpScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { signUpWithEmail, signInWithGoogle, signInWithApple, loading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface[100],
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing['2xl'],
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing['2xl'],
    },
    subtitle: {
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    form: {
      marginBottom: spacing.lg,
    },
    inputLabel: {
      marginBottom: spacing.sm,
      fontWeight: '600',
    },
    input: {
      backgroundColor: colors.surface[300],
      borderRadius: 12,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      color: colors.text.primary,
      fontSize: 16,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.surface[400],
    },
    button: {
      marginTop: spacing.sm,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.surface[400],
    },
    dividerText: {
      marginHorizontal: spacing.md,
    },
    oauthButtons: {
      gap: spacing.md,
    },
    footerLinks: {
      marginTop: spacing.lg,
      alignItems: 'center',
    },
    linkButton: {
      paddingVertical: spacing.sm,
    },
  }), [colors, spacing]);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const { error } = await signUpWithEmail(email, password);

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    }
    // Paywall will be shown automatically by AppNavigator
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();

    if (error) {
      Alert.alert('Google Sign In Failed', error.message);
    }
    // Paywall will be shown automatically by AppNavigator
  };

  const handleAppleSignIn = async () => {
    const { error} = await signInWithApple();

    if (error) {
      Alert.alert('Apple Sign In Failed', error.message);
    }
    // Paywall will be shown automatically by AppNavigator
  };

  const handleSignIn = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Title>Create Account</Title>
          <Caption style={styles.subtitle}>
            Sign up to start tracking your TCG matches
          </Caption>
        </View>

        {/* Email/Password Form */}
        <Card style={styles.form}>
          <Body style={styles.inputLabel}>Email</Body>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={colors.text.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <Body style={styles.inputLabel}>Password</Body>
          <TextInput
            style={styles.input}
            placeholder="Create a password (min 6 characters)"
            placeholderTextColor={colors.text.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <Body style={styles.inputLabel}>Confirm Password</Body>
          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            placeholderTextColor={colors.text.muted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading}
          />

          <Button
            title={loading ? "Creating account..." : "Create Account"}
            intent="primary"
            onPress={handleSignUp}
            disabled={loading}
            style={styles.button}
          />
        </Card>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Caption style={styles.dividerText}>OR</Caption>
          <View style={styles.dividerLine} />
        </View>

        {/* OAuth Buttons */}
        <View style={styles.oauthButtons}>
          <Button
            title="Continue with Google"
            intent="neutral"
            onPress={handleGoogleSignIn}
            disabled={loading}
          />

          <Button
            title="Continue with Apple"
            intent="neutral"
            onPress={handleAppleSignIn}
            disabled={loading}
          />
        </View>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <Caption>Already have an account?</Caption>
          <Button
            title="Sign In"
            intent="neutral"
            onPress={handleSignIn}
            disabled={loading}
            style={styles.linkButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
