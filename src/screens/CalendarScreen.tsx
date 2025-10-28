import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useEventStore } from '../stores/eventStore';
import { useThemeStore } from '../stores/themeStore';
import { format } from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CalendarScreen() {
  const { isDark } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();
  const { events, loadEvents } = useEventStore();

  useEffect(() => {
    loadEvents();
  }, []);

  // Mark dates that have events
  const markedDates: { [date: string]: any } = {};
  events.forEach((event) => {
    const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
    markedDates[dateKey] = {
      marked: true,
      dotColor: '#007AFF',
      selectedColor: '#007AFF',
    };
  });

  const handleDayPress = (day: DateData) => {
    const eventsOnDay = events.filter((event) => {
      const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
      return eventDate === day.dateString;
    });

    if (eventsOnDay.length > 0) {
      // Navigate to the first event on that day
      navigation.navigate('Event Detail', { eventId: eventsOnDay[0].id });
    }
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
            <View style={styles.legendDot} />
            <Text style={[styles.legendText, isDark && styles.legendTextDark]}>
              Events scheduled
            </Text>
          </View>
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
    padding: 16,
    marginTop: 8,
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
    backgroundColor: '#007AFF',
  },
  legendText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  legendTextDark: {
    color: '#98989F',
  },
});
