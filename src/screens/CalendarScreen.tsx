import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useEventStore } from '../stores/eventStore';
import { useMatchStore } from '../stores/matchStore';
import { useThemeStore } from '../stores/themeStore';
import { getAllCalendarData, getCalendarForDate, rebuildCalendar } from '../data/calendarRepo';
import * as EventRepo from '../data/eventRepo';
import * as MatchRepo from '../data/matchRepo';
import { DateCalendar } from '../domain/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CalendarScreen() {
  const { isDark } = useThemeStore();
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
          { color: '#FF9500' }, // Orange for events
          { color: '#007AFF' }, // Blue for matches
        ],
        marked: true,
      };
    } else if (hasEvents) {
      markedDates[dateKey] = {
        dots: [{ color: '#FF9500' }], // Orange for events
        marked: true,
      };
    } else if (hasMatches) {
      markedDates[dateKey] = {
        dots: [{ color: '#007AFF' }], // Blue for matches
        marked: true,
      };
    }
  });

  const handleDayPress = async (day: DateData) => {
    const dateData = await getCalendarForDate(day.dateString);
    setSelectedDateData(dateData);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            Calendar
          </Text>
        </View>
        <Calendar
          markedDates={markedDates}
          onDayPress={handleDayPress}
          markingType={'multi-dot'}
          theme={{
            backgroundColor: isDark ? '#000' : '#fff',
            calendarBackground: isDark ? '#000' : '#fff',
            textSectionTitleColor: isDark ? '#98989F' : '#8E8E93',
            selectedDayBackgroundColor: '#007AFF',
            selectedDayTextColor: '#fff',
            todayTextColor: '#007AFF',
            dayTextColor: isDark ? '#fff' : '#000',
            textDisabledColor: isDark ? '#38383A' : '#D1D1D6',
            dotColor: '#007AFF',
            selectedDotColor: '#fff',
            arrowColor: '#007AFF',
            monthTextColor: isDark ? '#fff' : '#000',
            indicatorColor: '#007AFF',
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
            <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
            <Text style={[styles.legendText, isDark && styles.legendTextDark]}>
              Events
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
            <Text style={[styles.legendText, isDark && styles.legendTextDark]}>
              Rounds
            </Text>
          </View>
        </View>

        {/* Selected Date Content */}
        {selectedDateData && (
          <View style={[styles.selectedDateContainer, isDark && styles.selectedDateContainerDark]}>
            <Text style={[styles.selectedDateTitle, isDark && styles.selectedDateTitleDark]}>
              {selectedDateData.date}
            </Text>

            {/* Events with nested rounds */}
            {selectedDateData.eventIds.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                  Events
                </Text>
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
                        style={[styles.itemCard, isDark && styles.itemCardDark]}
                        onPress={() => navigation.navigate('Event Detail', { eventId })}
                      >
                        <Text style={[styles.itemTitle, isDark && styles.itemTitleDark]}>
                          {event.name}
                        </Text>
                        <Text style={[styles.itemMeta, isDark && styles.itemMetaDark]}>
                          {event.game}
                        </Text>
                      </TouchableOpacity>

                      {/* Nested rounds */}
                      {eventRounds.length > 0 && (
                        <View style={styles.roundsContainer}>
                          {eventRounds.map((match) => (
                            <TouchableOpacity
                              key={match!.id}
                              style={[styles.roundCard, isDark && styles.roundCardDark]}
                              onPress={() => navigation.navigate('Match Detail', { matchId: match!.id })}
                            >
                              <Text style={[styles.roundTitle, isDark && styles.roundTitleDark]}>
                                Round {match!.roundNumber}
                              </Text>
                              <Text style={[styles.roundResult, {
                                color: match!.result === 'WIN' ? '#34C759' :
                                       match!.result === 'LOSS' ? '#FF3B30' : '#FF9500'
                              }]}>
                                {match!.result}
                              </Text>
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
                  <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                    No Events
                  </Text>
                  <View style={styles.roundsContainer}>
                    {orphanedRounds.map((match) => (
                      <TouchableOpacity
                        key={match!.id}
                        style={[styles.roundCard, isDark && styles.roundCardDark]}
                        onPress={() => navigation.navigate('Match Detail', { matchId: match!.id })}
                      >
                        <Text style={[styles.roundTitle, isDark && styles.roundTitleDark]}>
                          Round {match!.roundNumber}
                        </Text>
                        <Text style={[styles.roundResult, {
                          color: match!.result === 'WIN' ? '#34C759' :
                                 match!.result === 'LOSS' ? '#FF3B30' : '#FF9500'
                        }]}>
                          {match!.result}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })()}
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
  scrollView: {
    flex: 1,
  },
  header: {
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
  calendar: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  legendContainer: {
    flexDirection: 'row',
    padding: 16,
    marginTop: 8,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  legendTextDark: {
    color: '#98989F',
  },
  selectedDateContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  selectedDateContainerDark: {
    backgroundColor: '#1C1C1E',
  },
  selectedDateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  selectedDateTitleDark: {
    color: '#fff',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  sectionTitleDark: {
    color: '#fff',
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemCardDark: {
    backgroundColor: '#2C2C2E',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  itemTitleDark: {
    color: '#fff',
  },
  itemMeta: {
    fontSize: 12,
    color: '#8E8E93',
  },
  itemMetaDark: {
    color: '#98989F',
  },
  eventGroup: {
    marginBottom: 16,
  },
  roundsContainer: {
    marginTop: 8,
    marginLeft: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#D1D1D6',
  },
  roundCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundCardDark: {
    backgroundColor: '#2C2C2E',
  },
  roundTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  roundTitleDark: {
    color: '#fff',
  },
  roundResult: {
    fontSize: 13,
    fontWeight: '700',
  },
});
