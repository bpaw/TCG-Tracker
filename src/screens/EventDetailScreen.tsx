import React, { useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useEventStore } from '../stores/eventStore';
import { useMatchStore } from '../stores/matchStore';
import { useDeckStore } from '../stores/deckStore';
import { formatMatchDate } from '../utils/date';
import { getLeaderImage, getColorBorderColor } from '../domain/gameTitle/onePieceAssets';
import { useTheme } from '../hooks/useTheme';
import { Title, H2, Body, Caption } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Event Detail'>;
type EventDetailRouteProp = RouteProp<RootStackParamList, 'Event Detail'>;

export default function EventDetailScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EventDetailRouteProp>();

  const { eventId } = route.params;
  const { getEvent, loadEvents } = useEventStore();
  const { matches, loadMatches } = useMatchStore();
  const { decks, loadDecks } = useDeckStore();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface[100],
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
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.surface[200],
    },
    eventMeta: {
      marginBottom: spacing.sm,
      marginTop: spacing.sm,
    },
    eventNotes: {
      lineHeight: 20,
    },
    statsContainer: {
      flexDirection: 'row',
      padding: spacing.lg,
      gap: spacing.md,
    },
    statCard: {
      flex: 1,
      alignItems: 'center',
    },
    statLabel: {
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
    },
    section: {
      padding: spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    dateSubheader: {
      textTransform: 'uppercase',
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      letterSpacing: 0.5,
    },
    dateSubheaderFirst: {
      marginTop: 0,
    },
    roundCard: {
      marginBottom: spacing.md,
    },
    onePieceCardLayout: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    leaderImageContainer: {
      width: '30%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    leaderImageBorder: {
      borderWidth: 3,
      borderRadius: 12,
      padding: 4,
      overflow: 'hidden',
    },
    leaderImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
    },
    matchInfoContainer: {
      flex: 1,
    },
    roundHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    resultBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 12,
    },
    resultText: {
      color: '#fff',
      fontWeight: '700',
    },
    matchup: {
      marginBottom: spacing.xs,
    },
    opponent: {
      marginBottom: spacing.sm,
    },
    matchDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    emptyState: {
      alignItems: 'center',
      padding: spacing.xl * 2,
    },
    emptyText: {
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    completedBanner: {
      backgroundColor: '#34C759',
      padding: spacing.lg,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    completedText: {
      color: '#fff',
      fontWeight: '600',
    },
    diceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    diceText: {
      marginLeft: 4,
    },
  }), [colors, spacing]);

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

  // Group matches by date
  const matchesByDate = eventMatches.reduce((acc, match) => {
    const dateKey = match.date.split('T')[0]; // Get just the date part
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(match);
    return acc;
  }, {} as Record<string, typeof eventMatches>);

  // Sort dates
  const sortedDates = Object.keys(matchesByDate).sort();

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.violet} />
      </View>
    );
  }

  const wins = eventMatches.filter((m) => m.result === 'WIN').length;
  const losses = eventMatches.filter((m) => m.result === 'LOSS').length;
  const ties = eventMatches.filter((m) => m.result === 'TIE').length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Event Header */}
        <View style={styles.header}>
          <Title>
            {event.name}
          </Title>
          <Body style={styles.eventMeta}>
            {event.game} • {formatMatchDate(event.startDate)}
            {event.startDate.split('T')[0] !== event.endDate.split('T')[0] && ` - ${formatMatchDate(event.endDate)}`}
          </Body>
          {event.notes && (
            <Caption style={styles.eventNotes}>
              {event.notes}
            </Caption>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Caption style={styles.statLabel}>
              Rounds
            </Caption>
            <Title>
              {completedRounds.size}/{event.totalRounds}
            </Title>
          </Card>
          <Card style={styles.statCard}>
            <Caption style={styles.statLabel}>
              Record
            </Caption>
            <Title>
              {wins}-{losses}{ties > 0 ? `-${ties}` : ''}
            </Title>
          </Card>
        </View>


        {/* Rounds List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <H2>
              Rounds
            </H2>
            {nextRound <= event.totalRounds && (
              <Button
                title={`+ Add Round ${nextRound}`}
                onPress={handleAddRound}
                intent="primary"
              />
            )}
          </View>

          {eventMatches.length > 0 ? (
            sortedDates.map((dateKey, index) => {
              const dateMatches = matchesByDate[dateKey];
              return (
                <View key={dateKey}>
                  {/* Date Subheader */}
                  <Caption style={[
                    styles.dateSubheader,
                    index === 0 && styles.dateSubheaderFirst
                  ]}>
                    {formatMatchDate(dateKey)}
                  </Caption>

                  {/* Rounds for this date */}
                  {dateMatches.map((match) => {
                    const deck = decks.find((d) => d.id === match.myDeckId);
                    const resultColor =
                      match.result === 'WIN'
                        ? '#34C759'
                        : match.result === 'LOSS'
                        ? '#FF3B30'
                        : '#FF9500';

                    const isOnePiece = event?.game === 'One Piece';

                    // For One Piece, render special card with leader image
                    if (isOnePiece && match.onePieceLeader && match.onePieceColor) {
                      const leaderImage = getLeaderImage(match.onePieceLeader);
                      const borderColor = getColorBorderColor(match.onePieceColor);

                      return (
                        <TouchableOpacity
                          key={match.id}
                          onPress={() => handleMatchPress(match.id)}
                        >
                          <Card style={styles.roundCard}>
                            <View style={styles.onePieceCardLayout}>
                              {/* Left: Leader Image */}
                              <View style={styles.leaderImageContainer}>
                                <View style={[styles.leaderImageBorder, { borderColor }]}>
                                  <Image
                                    source={leaderImage}
                                    style={styles.leaderImage}
                                    resizeMode="cover"
                                  />
                                </View>
                              </View>

                              {/* Right: Match Info */}
                              <View style={styles.matchInfoContainer}>
                                <View style={styles.roundHeader}>
                                  <Body weight="bold">
                                    Round {match.roundNumber}
                                  </Body>
                                  <View style={[styles.resultBadge, { backgroundColor: resultColor }]}>
                                    <Caption style={styles.resultText}>{match.result}</Caption>
                                  </View>
                                </View>

                                <Body style={styles.matchup}>
                                  {deck?.title || 'Unknown Deck'} vs {match.oppDeckArchetype}
                                </Body>

                                {match.opponentName && (
                                  <Caption style={styles.opponent}>
                                    vs {match.opponentName}
                                  </Caption>
                                )}

                                <View style={styles.matchDetails}>
                                  {match.score && (
                                    <Caption>
                                      Score: {match.score}
                                    </Caption>
                                  )}
                                  {match.wonDieRoll !== undefined && (
                                    <View style={styles.diceRow}>
                                      <MaterialCommunityIcons
                                        name="dice-5"
                                        size={16}
                                        color={match.wonDieRoll ? colors.brand.emerald : colors.brand.coral}
                                      />
                                      <Caption style={[styles.diceText, { color: match.wonDieRoll ? colors.brand.emerald : colors.brand.coral }]}>
                                        {match.wonDieRoll ? 'Won' : 'Lost'}
                                      </Caption>
                                    </View>
                                  )}
                                  {match.started && match.started !== 'UNKNOWN' && (
                                    <Caption>
                                      Started: {match.started}
                                    </Caption>
                                  )}
                                </View>
                              </View>
                            </View>
                          </Card>
                        </TouchableOpacity>
                      );
                    }

                    // Default card layout for other games
                    return (
                      <TouchableOpacity
                        key={match.id}
                        onPress={() => handleMatchPress(match.id)}
                      >
                        <Card style={styles.roundCard}>
                          <View style={styles.roundHeader}>
                            <Body weight="bold">
                              Round {match.roundNumber}
                            </Body>
                            <View style={[styles.resultBadge, { backgroundColor: resultColor }]}>
                              <Caption style={styles.resultText}>{match.result}</Caption>
                            </View>
                          </View>

                          <Body style={styles.matchup}>
                            {deck?.title || 'Unknown Deck'} vs {match.oppDeckArchetype}
                          </Body>

                          {match.opponentName && (
                            <Caption style={styles.opponent}>
                              vs {match.opponentName}
                            </Caption>
                          )}

                          <View style={styles.matchDetails}>
                            {match.score && (
                              <Caption>
                                Score: {match.score}
                              </Caption>
                            )}
                            {match.wonDieRoll !== undefined && (
                              <View style={styles.diceRow}>
                                <MaterialCommunityIcons
                                  name="dice-5"
                                  size={16}
                                  color={match.wonDieRoll ? colors.brand.emerald : colors.brand.coral}
                                />
                                <Caption style={[styles.diceText, { color: match.wonDieRoll ? colors.brand.emerald : colors.brand.coral }]}>
                                  {match.wonDieRoll ? 'Won' : 'Lost'}
                                </Caption>
                              </View>
                            )}
                            {match.started && match.started !== 'UNKNOWN' && (
                              <Caption>
                                Started: {match.started}
                              </Caption>
                            )}
                          </View>
                        </Card>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Body style={styles.emptyText}>
                No rounds yet. Add your first round to get started!
              </Body>
              <Button
                title="Add Round 1"
                onPress={handleAddRound}
                intent="primary"
              />
            </View>
          )}

          {nextRound > event.totalRounds && eventMatches.length > 0 && (
            <View style={styles.completedBanner}>
              <Body style={styles.completedText}>
                ✓ All rounds completed!
              </Body>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
