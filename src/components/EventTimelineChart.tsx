import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Match } from '../domain/types';

interface EventTimelineChartProps {
  matches: Match[];
}

export default function EventTimelineChart({ matches }: EventTimelineChartProps) {
  const isDark = false; // Force light mode

  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
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
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
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
      <Text style={[styles.title, isDark && styles.titleDark]}>
        Round-by-Round Performance
      </Text>
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
        {wins}W-{losses}L{ties > 0 ? `-${ties}T` : ''} • {sortedMatches.length} round{sortedMatches.length !== 1 ? 's' : ''} played
      </Text>
      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={180}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(142, 142, 147, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#007AFF',
            fill: '#007AFF',
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: '#E5E5EA',
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
          <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
          <Text style={[styles.legendText, isDark && styles.legendTextDark]}>
            Win (1)
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
          <Text style={[styles.legendText, isDark && styles.legendTextDark]}>
            Loss (0)
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  emptyContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  titleDark: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 12,
  },
  subtitleDark: {
    color: '#98989F',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  legendTextDark: {
    color: '#98989F',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyTextDark: {
    color: '#98989F',
  },
});
