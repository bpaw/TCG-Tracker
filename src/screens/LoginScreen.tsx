/**
 * Login Screen
 * Allows users to sign in with email/password or OAuth providers (Google, Apple)
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

export default function LoginScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { signInWithEmail, signInWithGoogle, signInWithApple, loading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    const { error } = await signInWithEmail(email, password);

    if (error) {
      Alert.alert('Sign In Failed', error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();

    if (error) {
      Alert.alert('Google Sign In Failed', error.message);
    }
  };

  const handleAppleSignIn = async () => {
    const { error } = await signInWithApple();

    if (error) {
      Alert.alert('Apple Sign In Failed', error.message);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('Forgot Password' as never);
  };

  const handleSignUp = () => {
    navigation.navigate('Sign Up' as never);
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
          <Title>Welcome Back</Title>
          <Caption style={styles.subtitle}>
            Sign in to continue tracking your TCG matches
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
            placeholder="Enter your password"
            placeholderTextColor={colors.text.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <Button
            title={loading ? "Signing in..." : "Sign In"}
            intent="primary"
            onPress={handleSignIn}
            disabled={loading}
            style={styles.button}
          />

          <Button
            title="Forgot Password?"
            intent="neutral"
            onPress={handleForgotPassword}
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
          <Caption>Don't have an account?</Caption>
          <Button
            title="Create Account"
            intent="neutral"
            onPress={handleSignUp}
            disabled={loading}
            style={styles.linkButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
