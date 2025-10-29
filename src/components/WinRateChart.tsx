import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { format, parseISO } from 'date-fns';
import { DailyWinRate } from '../utils/stats';
import { colors } from '../design/tokens';

interface WinRateChartProps {
  data: DailyWinRate[];
}

export default function WinRateChart({ data }: WinRateChartProps) {
  // Filter to only include days with matches for cleaner visualization
  const daysWithMatches = data.filter((d) => d.total > 0);

  if (data.length === 0 || daysWithMatches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No matches in the last 30 days
        </Text>
      </View>
    );
  }

  // If we have too many days, sample them
  const shouldSample = daysWithMatches.length > 10;
  const sampledData = shouldSample
    ? daysWithMatches.filter((_, index) => index % Math.ceil(daysWithMatches.length / 10) === 0)
    : daysWithMatches;

  // Add the most recent day with matches if not already included
  if (shouldSample && daysWithMatches.length > 0) {
    const lastDay = daysWithMatches[daysWithMatches.length - 1];
    if (!sampledData.includes(lastDay)) {
      sampledData.push(lastDay);
    }
  }

  const chartData = {
    labels: sampledData.map((d) => format(parseISO(d.date), 'MM/dd')),
    datasets: [
      {
        data: sampledData.map((d) => d.winRate),
        color: (opacity = 1) => `rgba(124, 77, 255, ${opacity})`, // Electric violet
        strokeWidth: 2,
      },
    ],
  };

  const screenWidth = Dimensions.get('window').width;

  const totalMatches = data.reduce((sum, d) => sum + d.total, 0);
  const totalWins = data.reduce((sum, d) => sum + d.wins, 0);
  const overallWinRate = totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(0) : '0';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Win Rate Trend - Last 30 Days
      </Text>
      <Text style={styles.subtitle}>
        {totalMatches} matches • {overallWinRate}% win rate
      </Text>
      <LineChart
        data={chartData}
        width={screenWidth - 32} // padding
        height={200}
        chartConfig={{
          backgroundColor: colors.surface[300],
          backgroundGradientFrom: colors.surface[300],
          backgroundGradientTo: colors.surface[200],
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(124, 77, 255, ${opacity})`, // Electric violet
          labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`, // grayd-400
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '3',
            strokeWidth: '2',
            stroke: colors.brand.violet,
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: colors.surface[400],
            strokeWidth: 1,
          },
        }}
        bezier
        style={styles.chart}
        yAxisSuffix="%"
        yAxisInterval={1}
        fromZero
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface[300],
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  emptyContainer: {
    backgroundColor: colors.surface[300],
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  titleDark: {
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  subtitleDark: {
    color: colors.text.secondary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.muted,
  },
  emptyTextDark: {
    color: colors.text.muted,
  },
});
