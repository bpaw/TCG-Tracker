import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Match } from '../domain/types';
import { colors, spacing } from '../design/tokens';

interface EventTimelineChartProps {
  matches: Match[];
}

export default function EventTimelineChart({ matches }: EventTimelineChartProps) {
  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No rounds completed yet
        </Text>
      </View>
    );
  }

  // Sort matches by round number
  const sortedMatches = [...matches].sort((a, b) => a.roundNumber - b.roundNumber);

  // Convert results to binary: WIN/TIE = 1, LOSS = 0
  const chartData = {
    labels: sortedMatches.map((m) => `R${m.roundNumber}`),
    datasets: [
      {
        data: sortedMatches.map((m) => (m.result === 'LOSS' ? 0 : 1)),
        color: (opacity = 1) => `rgba(124, 77, 255, ${opacity})`, // Electric violet
        strokeWidth: 3,
      },
    ],
  };

  const screenWidth = Dimensions.get('window').width;

  const wins = sortedMatches.filter((m) => m.result === 'WIN').length;
  const losses = sortedMatches.filter((m) => m.result === 'LOSS').length;
  const ties = sortedMatches.filter((m) => m.result === 'TIE').length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Round-by-Round Performance
      </Text>
      <Text style={styles.subtitle}>
        {wins}W-{losses}L{ties > 0 ? `-${ties}T` : ''} • {sortedMatches.length} round{sortedMatches.length !== 1 ? 's' : ''} played
      </Text>
      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={180}
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
            r: '5',
            strokeWidth: '2',
            stroke: colors.brand.violet,
            fill: colors.brand.violet,
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: colors.surface[400],
            strokeWidth: 1,
          },
        }}
        style={styles.chart}
        yAxisLabel=""
        yAxisSuffix=""
        fromZero
        segments={1}
        withInnerLines={true}
        withOuterLines={true}
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.brand.emerald }]} />
          <Text style={styles.legendText}>
            Win (1)
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.brand.coral }]} />
          <Text style={styles.legendText}>
            Loss (0)
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface[300],
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    backgroundColor: colors.surface[300],
    borderRadius: 12,
    padding: spacing.xl,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.muted,
  },
});
