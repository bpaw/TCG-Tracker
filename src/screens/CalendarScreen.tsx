import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useEventStore } from '../stores/eventStore';
import { useMatchStore } from '../stores/matchStore';
import { getAllCalendarData, getCalendarForDate, rebuildCalendar } from '../data/calendarRepo';
import * as EventRepo from '../data/eventRepo';
import * as MatchRepo from '../data/matchRepo';
import { DateCalendar } from '../domain/types';
import { colors, spacing } from '../design/tokens';
import { Title, H2, Body, Caption } from '../components/atoms/Text';
import { Card } from '../components/atoms/Card';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CalendarScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { events, loadEvents } = useEventStore();
  const { matches, loadMatches } = useMatchStore();
  const [calendarData, setCalendarData] = useState<Record<string, DateCalendar>>({});
  const [selectedDateData, setSelectedDateData] = useState<DateCalendar | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    await loadEvents();
    await loadMatches();

    // Rebuild calendar to ensure it's in sync with current events and matches
    const allEvents = await EventRepo.list();
    const allMatches = await MatchRepo.list();
    await rebuildCalendar(allEvents, allMatches);

    const data = await getAllCalendarData();
    setCalendarData(data);
  };

  // Mark dates with events (orange) and rounds (blue)
  const markedDates: { [date: string]: any } = {};
  Object.entries(calendarData).forEach(([dateKey, data]) => {
    const hasEvents = data.eventIds.length > 0;
    const hasMatches = data.matchIds.length > 0;

    if (hasEvents && hasMatches) {
      // Both events and matches - show multiple dots
      markedDates[dateKey] = {
        dots: [
          { color: colors.brand.amber }, // Amber for events
          { color: colors.brand.violet }, // Violet for matches
        ],
        marked: true,
      };
    } else if (hasEvents) {
      markedDates[dateKey] = {
        dots: [{ color: colors.brand.amber }], // Amber for events
        marked: true,
      };
    } else if (hasMatches) {
      markedDates[dateKey] = {
        dots: [{ color: colors.brand.violet }], // Violet for matches
        marked: true,
      };
    }
  });

  const handleDayPress = async (day: DateData) => {
    const dateData = await getCalendarForDate(day.dateString);
    setSelectedDateData(dateData);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Title>Calendar</Title>
        </View>
        <Calendar
          markedDates={markedDates}
          onDayPress={handleDayPress}
          markingType={'multi-dot'}
          theme={{
            backgroundColor: colors.surface[100],
            calendarBackground: colors.surface[100],
            textSectionTitleColor: colors.text.secondary,
            selectedDayBackgroundColor: colors.brand.violet,
            selectedDayTextColor: colors.text.primary,
            todayTextColor: colors.brand.violet,
            dayTextColor: colors.text.primary,
            textDisabledColor: colors.text.muted,
            dotColor: colors.brand.violet,
            selectedDotColor: colors.text.primary,
            arrowColor: colors.brand.violet,
            monthTextColor: colors.text.primary,
            indicatorColor: colors.brand.violet,
            textDayFontWeight: '400',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 12,
          }}
          style={styles.calendar}
        />

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.brand.amber }]} />
            <Caption>Events</Caption>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.brand.violet }]} />
            <Caption>Rounds</Caption>
          </View>
        </View>

        {/* Selected Date Content */}
        {selectedDateData && (
          <Card style={styles.selectedDateContainer}>
            <H2 style={styles.selectedDateTitle}>
              {selectedDateData.date}
            </H2>

            {/* Events with nested rounds */}
            {selectedDateData.eventIds.length > 0 && (
              <View style={styles.section}>
                <H2 style={styles.sectionTitle}>Events</H2>
                {selectedDateData.eventIds.map((eventId) => {
                  const event = events.find(e => e.id === eventId);
                  if (!event) return null;

                  // Find all rounds for this event on this date
                  const eventRounds = selectedDateData.matchIds
                    .map(matchId => matches.find(m => m.id === matchId))
                    .filter(match => match && match.eventId === eventId);

                  return (
                    <View key={eventId} style={styles.eventGroup}>
                      <TouchableOpacity
                        style={styles.itemCard}
                        onPress={() => navigation.navigate('Event Detail', { eventId })}
                      >
                        <Card elevated style={styles.eventCardContent}>
                          <Body style={styles.itemTitle}>
                            {event.name}
                          </Body>
                          <Caption>{event.game}</Caption>
                        </Card>
                      </TouchableOpacity>

                      {/* Nested rounds */}
                      {eventRounds.length > 0 && (
                        <View style={styles.roundsContainer}>
                          {eventRounds.map((match) => (
                            <TouchableOpacity
                              key={match!.id}
                              style={styles.roundCard}
                              onPress={() => navigation.navigate('Match Detail', { matchId: match!.id })}
                            >
                              <Card style={styles.roundCardBackground}>
                                <View style={styles.roundCardInner}>
                                  <Body style={styles.roundTitle}>
                                    Round {match!.roundNumber}
                                  </Body>
                                  <Body style={[styles.roundResult, {
                                    color: match!.result === 'WIN' ? colors.brand.emerald :
                                           match!.result === 'LOSS' ? colors.brand.coral : colors.brand.amber
                                  }]}>
                                    {match!.result}
                                  </Body>
                                </View>
                              </Card>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Rounds without events */}
            {selectedDateData.matchIds.length > 0 && (() => {
              // Find all rounds that don't have an event or have an event that doesn't exist
              const orphanedRounds = selectedDateData.matchIds
                .map(matchId => matches.find(m => m.id === matchId))
                .filter(match => {
                  if (!match) return false;
                  // No event ID or event doesn't exist
                  if (!match.eventId) return true;
                  const event = events.find(e => e.id === match.eventId);
                  return !event;
                });

              if (orphanedRounds.length === 0) return null;

              return (
                <View style={styles.section}>
                  <H2 style={styles.sectionTitle}>No Events</H2>
                  <View style={styles.orphanedRoundsContainer}>
                    {orphanedRounds.map((match) => (
                      <TouchableOpacity
                        key={match!.id}
                        style={styles.roundCard}
                        onPress={() => navigation.navigate('Match Detail', { matchId: match!.id })}
                      >
                        <Card style={styles.roundCardBackground}>
                          <View style={styles.roundCardInner}>
                            <Body style={styles.roundTitle}>
                              Round {match!.roundNumber}
                            </Body>
                            <Body style={[styles.roundResult, {
                              color: match!.result === 'WIN' ? colors.brand.emerald :
                                     match!.result === 'LOSS' ? colors.brand.coral : colors.brand.amber
                            }]}>
                              {match!.result}
                            </Body>
                          </View>
                        </Card>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })()}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface[100],
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    paddingTop: 60,
  },
  calendar: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  legendContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  selectedDateContainer: {
    margin: spacing.md,
    padding: spacing.md,
  },
  selectedDateTitle: {
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  itemCard: {
    marginBottom: spacing.sm,
  },
  itemTitle: {
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  eventGroup: {
    marginBottom: spacing.lg,
  },
  eventCardContent: {
    backgroundColor: colors.surface[400],
  },
  roundsContainer: {
    marginTop: spacing.md,
    marginLeft: spacing.lg,
    paddingLeft: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand.violet,
  },
  roundCard: {
    marginBottom: spacing.sm,
  },
  roundCardBackground: {
    backgroundColor: colors.surface[200],
  },
  roundCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
  },
  roundTitle: {
    fontWeight: '600',
  },
  roundResult: {
    fontWeight: '700',
  },
  orphanedRoundsContainer: {
    marginLeft: 0,
    paddingLeft: 0,
    borderLeftWidth: 0,
  },
});
