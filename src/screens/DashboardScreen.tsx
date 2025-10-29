import React, { useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useEventStore } from '../stores/eventStore';
import { useMatchStore } from '../stores/matchStore';
import { useThemeStore } from '../stores/themeStore';
import { formatMatchDate } from '../utils/date';
import { KPI } from '../components/molecules/KPI';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Title, H2, Body, Caption } from '../components/atoms/Text';
import WinRateChart from '../components/WinRateChart';
import { getOverallRecord, getWinRate, getFirstVsSecondSplit, getDailyWinRates } from '../utils/stats';
import { useTheme } from '../hooks/useTheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useThemeStore();

  const { events, loadEvents, loading } = useEventStore();
  const { matches, loadMatches } = useMatchStore();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface[100], // Charcoal background
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface[100],
    },
    scrollView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingTop: 60,
      paddingBottom: spacing.md,
    },
    headerButton: {
      paddingHorizontal: spacing.sm,
    },
    kpiContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    sectionHeader: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      paddingTop: spacing.xs,
    },
    section: {
      paddingHorizontal: spacing.md,
    },
    eventCard: {
      marginBottom: spacing.sm,
    },
    eventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
    },
    eventName: {
      flex: 1,
      marginRight: spacing.sm,
      fontWeight: '600',
    },
    eventGame: {
      color: colors.brand.violet, // Electric violet for game name
      marginBottom: spacing.xs,
    },
    eventStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    eventRecord: {
      fontWeight: '600',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing['2xl'],
      marginTop: 60,
    },
    emptyTitle: {
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    emptyText: {
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    emptyButton: {
      paddingHorizontal: spacing.xl,
    },
  }), [colors, spacing]);

  // Reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadEvents();
      loadMatches();
    }, [])
  );

  const handleEventPress = (eventId: string) => {
    navigation.navigate('Event Detail', { eventId });
  };

  const handleAddEvent = () => {
    navigation.navigate('Add Event');
  };

  if (loading && events.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.violet} />
      </View>
    );
  }

  const hasData = events.length > 0;

  // Calculate overall stats
  const record = getOverallRecord(matches);
  const winRate = getWinRate(matches);
  const firstVsSecond = getFirstVsSecondSplit(matches);
  const dailyWinRates = getDailyWinRates(matches, 30);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Title>Dashboard</Title>
          <Button
            title="+ New Event"
            intent="primary"
            onPress={handleAddEvent}
            style={styles.headerButton}
          />
        </View>

        {/* Stats KPIs */}
        {hasData && matches.length > 0 ? (
          <>
            <View style={styles.kpiContainer}>
              <KPI label="Overall Record" value={record.formatted} subtitle={`${record.total} matches`} />
              <KPI label="Win Rate" value={`${winRate.percentage.toFixed(0)}%`} subtitle={`${winRate.wins}/${winRate.total} wins`} />
            </View>
            {firstVsSecond.first.total > 0 && firstVsSecond.second.total > 0 && (
              <View style={styles.kpiContainer}>
                <KPI label="First" value={`${firstVsSecond.first.percentage.toFixed(0)}%`} subtitle={`${firstVsSecond.first.wins}/${firstVsSecond.first.total} wins`} />
                <KPI label="Second" value={`${firstVsSecond.second.percentage.toFixed(0)}%`} subtitle={`${firstVsSecond.second.wins}/${firstVsSecond.second.total} wins`} />
              </View>
            )}
          </>
        ) : null}

        {/* Win Rate Chart */}
        {hasData && matches.length > 0 && (
          <WinRateChart data={dailyWinRates} />
        )}

        {/* Events Section */}
        {hasData && (
          <View style={styles.sectionHeader}>
            <H2>Events</H2>
          </View>
        )}

        {/* Events List */}
        {hasData ? (
          <View style={styles.section}>
            {events.map((event) => {
              const eventMatches = matches.filter((m) => m.eventId === event.id);
              const completedRounds = new Set(eventMatches.map(m => m.roundNumber)).size;
              const wins = eventMatches.filter((m) => m.result === 'WIN').length;
              const losses = eventMatches.filter((m) => m.result === 'LOSS').length;
              const ties = eventMatches.filter((m) => m.result === 'TIE').length;

              return (
                <TouchableOpacity
                  key={event.id}
                  onPress={() => handleEventPress(event.id)}
                >
                  <Card style={styles.eventCard}>
                    <View style={styles.eventHeader}>
                      <Body style={styles.eventName}>{event.name}</Body>
                      <Caption>{formatMatchDate(event.startDate)}</Caption>
                    </View>

                    <Caption style={styles.eventGame}>{event.game}</Caption>

                    <View style={styles.eventStats}>
                      <Caption>Rounds: {completedRounds}/{event.totalRounds}</Caption>
                      {eventMatches.length > 0 && (
                        <Body style={styles.eventRecord}>
                          {wins}-{losses}{ties > 0 ? `-${ties}` : ''}
                        </Body>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Title style={styles.emptyTitle}>Welcome to TCG Tracker</Title>
            <Body style={styles.emptyText}>
              Start by creating an event to track your tournament rounds.
            </Body>
            <Button
              title="Create Your First Event"
              intent="primary"
              onPress={handleAddEvent}
              style={styles.emptyButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
