import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Match } from '../domain/types';
import { formatMatchDate } from '../utils/date';

interface MatchRowProps {
  match: Match;
  deckTitle?: string;
  onPress?: () => void;
}

export default function MatchRow({ match, deckTitle, onPress }: MatchRowProps) {
  const isDark = false; // Force light mode

  const resultColor =
    match.result === 'WIN'
      ? '#34C759'
      : match.result === 'LOSS'
      ? '#FF3B30'
      : '#FF9500';

  return (
    <TouchableOpacity
      style={[styles.container, isDark && styles.containerDark]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.leftSection}>
        <View style={[styles.resultBadge, { backgroundColor: resultColor }]}>
          <Text style={styles.resultText}>{match.result}</Text>
        </View>

        <View style={styles.info}>
          <Text style={[styles.date, isDark && styles.dateDark]}>
            {formatMatchDate(match.date)}
          </Text>
          <Text style={[styles.matchup, isDark && styles.matchupDark]}>
            {deckTitle || 'Unknown Deck'} vs {match.oppDeckArchetype}
          </Text>
          {match.score && (
            <Text style={[styles.score, isDark && styles.scoreDark]}>
              Score: {match.score}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {match.started && match.started !== 'UNKNOWN' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {match.started === 'FIRST' ? '1st' : '2nd'}
            </Text>
          </View>
        )}
        {match.wonDieRoll !== undefined && (
          <Text style={styles.dieRoll}>
            {match.wonDieRoll ? '🎲 Won' : '🎲 Lost'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
    borderBottomColor: '#38383A',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  resultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  dateDark: {
    color: '#98989F',
  },
  matchup: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  matchupDark: {
    color: '#fff',
  },
  score: {
    fontSize: 12,
    color: '#8E8E93',
  },
  scoreDark: {
    color: '#98989F',
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  dieRoll: {
    fontSize: 10,
    color: '#8E8E93',
  },
});
