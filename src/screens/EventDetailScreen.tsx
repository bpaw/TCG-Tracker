import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useEventStore } from '../stores/eventStore';
import { useMatchStore } from '../stores/matchStore';
import { useDeckStore } from '../stores/deckStore';
import { formatMatchDate } from '../utils/date';
import EventTimelineChart from '../components/EventTimelineChart';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Event Detail'>;
type EventDetailRouteProp = RouteProp<RootStackParamList, 'Event Detail'>;

export default function EventDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EventDetailRouteProp>();
  const isDark = false; // Force light mode

  const { eventId } = route.params;
  const { getEvent, loadEvents } = useEventStore();
  const { matches, loadMatches } = useMatchStore();
  const { decks, loadDecks } = useDeckStore();

  useFocusEffect(
    React.useCallback(() => {
      loadEvents();
      loadMatches();
      loadDecks();
    }, [])
  );

  const event = getEvent(eventId);
  const eventMatches = matches
    .filter((m) => m.eventId === eventId)
    .sort((a, b) => a.roundNumber - b.roundNumber);

  const completedRounds = new Set(eventMatches.map((m) => m.roundNumber));
  const nextRound = (() => {
    for (let i = 1; i <= (event?.totalRounds || 0); i++) {
      if (!completedRounds.has(i)) {
        return i;
      }
    }
    return (event?.totalRounds || 0) + 1;
  })();

  const handleAddRound = () => {
    if (!event) return;
    if (nextRound > event.totalRounds) {
      // All rounds completed
      return;
    }
    navigation.navigate('Add Round', { eventId, roundNumber: nextRound });
  };

  const handleMatchPress = (matchId: string) => {
    navigation.navigate('Match Detail', { matchId });
  };

  if (!event) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const wins = eventMatches.filter((m) => m.result === 'WIN').length;
  const losses = eventMatches.filter((m) => m.result === 'LOSS').length;
  const ties = eventMatches.filter((m) => m.result === 'TIE').length;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView style={styles.scrollView}>
        {/* Event Header */}
        <View style={styles.header}>
          <Text style={[styles.eventName, isDark && styles.eventNameDark]}>
            {event.name}
          </Text>
          <Text style={[styles.eventMeta, isDark && styles.eventMetaDark]}>
            {event.game} • {formatMatchDate(event.date)}
          </Text>
          {event.notes && (
            <Text style={[styles.eventNotes, isDark && styles.eventNotesDark]}>
              {event.notes}
            </Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
              Rounds
            </Text>
            <Text style={[styles.statValue, isDark && styles.statValueDark]}>
              {completedRounds.size}/{event.totalRounds}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
              Record
            </Text>
            <Text style={[styles.statValue, isDark && styles.statValueDark]}>
              {wins}-{losses}{ties > 0 ? `-${ties}` : ''}
            </Text>
          </View>
        </View>

        {/* Timeline Chart */}
        {eventMatches.length > 0 && (
          <EventTimelineChart matches={eventMatches} />
        )}

        {/* Rounds List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Rounds
            </Text>
            {nextRound <= event.totalRounds && (
              <TouchableOpacity style={styles.addButton} onPress={handleAddRound}>
                <Text style={styles.addButtonText}>+ Add Round {nextRound}</Text>
              </TouchableOpacity>
            )}
          </View>

          {eventMatches.length > 0 ? (
            eventMatches.map((match) => {
              const deck = decks.find((d) => d.id === match.myDeckId);
              const resultColor =
                match.result === 'WIN'
                  ? '#34C759'
                  : match.result === 'LOSS'
                  ? '#FF3B30'
                  : '#FF9500';

              return (
                <TouchableOpacity
                  key={match.id}
                  style={[styles.roundCard, isDark && styles.roundCardDark]}
                  onPress={() => handleMatchPress(match.id)}
                >
                  <View style={styles.roundHeader}>
                    <Text style={[styles.roundNumber, isDark && styles.roundNumberDark]}>
                      Round {match.roundNumber}
                    </Text>
                    <View style={[styles.resultBadge, { backgroundColor: resultColor }]}>
                      <Text style={styles.resultText}>{match.result}</Text>
                    </View>
                  </View>

                  <Text style={[styles.matchup, isDark && styles.matchupDark]}>
                    {deck?.title || 'Unknown Deck'} vs {match.oppDeckArchetype}
                  </Text>

                  {match.opponentName && (
                    <Text style={[styles.opponent, isDark && styles.opponentDark]}>
                      vs {match.opponentName}
                    </Text>
                  )}

                  <View style={styles.matchDetails}>
                    {match.score && (
                      <Text style={[styles.detailText, isDark && styles.detailTextDark]}>
                        Score: {match.score}
                      </Text>
                    )}
                    {match.wonDieRoll !== undefined && (
                      <Text style={[styles.detailText, isDark && styles.detailTextDark]}>
                        Die Roll: {match.wonDieRoll ? 'Won' : 'Lost'}
                      </Text>
                    )}
                    {match.started && match.started !== 'UNKNOWN' && (
                      <Text style={[styles.detailText, isDark && styles.detailTextDark]}>
                        Started: {match.started}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                No rounds yet. Add your first round to get started!
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleAddRound}>
                <Text style={styles.emptyButtonText}>Add Round 1</Text>
              </TouchableOpacity>
            </View>
          )}

          {nextRound > event.totalRounds && eventMatches.length > 0 && (
            <View style={styles.completedBanner}>
              <Text style={styles.completedText}>
                ✓ All rounds completed!
              </Text>
            </View>
          )}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  eventName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  eventNameDark: {
    color: '#fff',
  },
  eventMeta: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  eventMetaDark: {
    color: '#98989F',
  },
  eventNotes: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  eventNotesDark: {
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statLabelDark: {
    color: '#98989F',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  statValueDark: {
    color: '#fff',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  sectionTitleDark: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  roundCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  roundCardDark: {
    backgroundColor: '#1C1C1E',
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roundNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  roundNumberDark: {
    color: '#fff',
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  matchup: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  matchupDark: {
    color: '#fff',
  },
  opponent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  opponentDark: {
    color: '#999',
  },
  matchDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  detailTextDark: {
    color: '#98989F',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
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
  completedBanner: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  completedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
