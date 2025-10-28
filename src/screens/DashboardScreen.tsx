import React, { useEffect } from 'react';
import {
  View,
  Text,
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
import KPI from '../components/KPI';
import WinRateChart from '../components/WinRateChart';
import { getOverallRecord, getWinRate, getFirstVsSecondSplit, getDailyWinRates } from '../utils/stats';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useThemeStore();

  const { events, loadEvents, loading } = useEventStore();
  const { matches, loadMatches } = useMatchStore();

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
      <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
        <ActivityIndicator size="large" color="#007AFF" />
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
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            Dashboard
          </Text>
          <TouchableOpacity style={styles.newButton} onPress={handleAddEvent}>
            <Text style={styles.newButtonText}>+ New Event</Text>
          </TouchableOpacity>
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
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Events</Text>
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
                  style={[styles.eventCard, isDark && styles.eventCardDark]}
                  onPress={() => handleEventPress(event.id)}
                >
                  <View style={styles.eventHeader}>
                    <Text style={[styles.eventName, isDark && styles.eventNameDark]}>
                      {event.name}
                    </Text>
                    <Text style={[styles.eventDate, isDark && styles.eventDateDark]}>
                      {formatMatchDate(event.date)}
                    </Text>
                  </View>

                  <Text style={[styles.eventGame, isDark && styles.eventGameDark]}>
                    {event.game}
                  </Text>

                  <View style={styles.eventStats}>
                    <Text style={[styles.eventStatsText, isDark && styles.eventStatsTextDark]}>
                      Rounds: {completedRounds}/{event.totalRounds}
                    </Text>
                    {eventMatches.length > 0 && (
                      <Text style={[styles.eventRecord, isDark && styles.eventRecordDark]}>
                        {wins}-{losses}{ties > 0 ? `-${ties}` : ''}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
              Welcome to TCG Tracker
            </Text>
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              Start by creating an event to track your tournament rounds.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddEvent}>
              <Text style={styles.emptyButtonText}>Create Your First Event</Text>
            </TouchableOpacity>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingContainerDark: {
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  newButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  kpiContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  sectionTitleDark: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 16,
  },
  eventCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  eventCardDark: {
    backgroundColor: '#1C1C1E',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    marginRight: 12,
  },
  eventNameDark: {
    color: '#fff',
  },
  eventDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  eventDateDark: {
    color: '#98989F',
  },
  eventGame: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },
  eventGameDark: {
    color: '#0A84FF',
  },
  eventStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventStatsText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  eventStatsTextDark: {
    color: '#98989F',
  },
  eventRecord: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  eventRecordDark: {
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyTitleDark: {
    color: '#fff',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyTextDark: {
    color: '#98989F',
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
