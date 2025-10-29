/**
 * Forgot Password Screen
 * Allows users to request a password reset email
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

export default function ForgotPasswordScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { resetPassword } = useAuthStore();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

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
    footerLinks: {
      marginTop: spacing.lg,
      alignItems: 'center',
    },
    linkButton: {
      paddingVertical: spacing.sm,
    },
  }), [colors, spacing]);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert(
        'Success',
        'Password reset instructions have been sent to your email.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const handleBackToSignIn = () => {
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
          <Title>Reset Password</Title>
          <Caption style={styles.subtitle}>
            Enter your email and we'll send you instructions to reset your password
          </Caption>
        </View>

        {/* Email Form */}
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

          <Button
            title={loading ? "Sending..." : "Send Reset Instructions"}
            intent="primary"
            onPress={handleResetPassword}
            disabled={loading}
            style={styles.button}
          />
        </Card>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <Caption>Remember your password?</Caption>
          <Button
            title="Back to Sign In"
            intent="neutral"
            onPress={handleBackToSignIn}
            disabled={loading}
            style={styles.linkButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
