import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Circle } from 'react-native-svg';
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

  // Map results to three levels: WIN = 1.0, TIE = 0.5, LOSS = 0
  const chartData = {
    labels: sortedMatches.map((m) => `R${m.roundNumber}`),
    datasets: [
      {
        data: sortedMatches.map((m) => {
          if (m.result === 'WIN') return 1.0;
          if (m.result === 'TIE') return 0.5;
          return 0;
        }),
        color: (opacity = 1) => colors.brand.violet, // Electric violet line
        strokeWidth: 2,
        withDots: true,
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
            r: '0', // Hide default dots, we'll render custom ones
            strokeWidth: '0',
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: colors.surface[400],
            strokeWidth: 1,
          },
        }}
        decorator={(decoratorData) => {
          return decoratorData?.[0]?.data?.map((value: any, index: number) => {
            const match = sortedMatches[index];
            if (!match) return null;

            const dotColor =
              match.result === 'WIN'
                ? colors.brand.emerald
                : match.result === 'TIE'
                ? colors.brand.amber
                : colors.brand.coral;

            return (
              <Circle
                key={`dot-${index}`}
                cx={value.x}
                cy={value.y}
                r="5"
                fill={dotColor}
                stroke={dotColor}
                strokeWidth="2"
              />
            );
          });
        }}
        formatYLabel={(value) => {
          if (value === '1') return 'Win';
          if (value === '0.5') return 'Tie';
          if (value === '0') return 'Loss';
          return '';
        }}
        style={styles.chart}
        yAxisLabel=""
        yAxisSuffix=""
        fromZero
        segments={2}
        withInnerLines={true}
        withOuterLines={true}
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.brand.emerald }]} />
          <Text style={styles.legendText}>
            Win
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.brand.amber }]} />
          <Text style={styles.legendText}>
            Tie
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.brand.coral }]} />
          <Text style={styles.legendText}>
            Loss
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
