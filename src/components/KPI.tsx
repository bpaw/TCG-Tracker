import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useThemeStore } from '../stores/themeStore';

interface KPIProps {
  label: string;
  value: string | number;
  subtitle?: string;
}

export default function KPI({ label, value, subtitle }: KPIProps) {
  const { isDark } = useThemeStore();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
      <Text style={[styles.value, isDark && styles.valueDark]}>{value}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minWidth: 100,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  labelDark: {
    color: '#98989F',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  valueDark: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 11,
    color: '#8E8E93',
  },
  subtitleDark: {
    color: '#98989F',
  },
});
