import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Match } from '../domain/types';
import { formatMatchDate } from '../utils/date';
import { colors, spacing } from '../design/tokens';
import { Body, Caption } from './atoms/Text';
import { Card } from './atoms/Card';

interface MatchRowProps {
  match: Match;
  deckTitle?: string;
  onPress?: () => void;
}

export default function MatchRow({ match, deckTitle, onPress }: MatchRowProps) {
  const resultColor =
    match.result === 'WIN'
      ? colors.brand.emerald
      : match.result === 'LOSS'
      ? colors.brand.coral
      : colors.brand.amber;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={styles.touchable}
    >
      <Card style={styles.container}>
        <View style={styles.leftSection}>
          <View style={[styles.resultBadge, { backgroundColor: resultColor }]}>
            <Caption style={styles.resultText}>{match.result}</Caption>
          </View>

          <View style={styles.info}>
            <Caption style={styles.date}>
              {formatMatchDate(match.date)}
            </Caption>
            <Body style={styles.matchup}>
              {deckTitle || 'Unknown Deck'} vs {match.oppDeckArchetype}
            </Body>
            {match.score && (
              <Caption style={styles.score}>
                Score: {match.score}
              </Caption>
            )}
          </View>
        </View>

        <View style={styles.rightSection}>
          {match.started && match.started !== 'UNKNOWN' && (
            <View style={styles.badge}>
              <Caption style={styles.badgeText}>
                {match.started === 'FIRST' ? '1st' : '2nd'}
              </Caption>
            </View>
          )}
          {match.wonDieRoll !== undefined && (
            <Caption style={styles.dieRoll}>
              {match.wonDieRoll ? '🎲 Won' : '🎲 Lost'}
            </Caption>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    marginRight: spacing.sm,
    minWidth: 50,
    alignItems: 'center',
  },
  resultText: {
    color: colors.surface[100],
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  date: {
    color: colors.text.muted,
    marginBottom: 2,
  },
  matchup: {
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  score: {
    color: colors.text.muted,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  badge: {
    backgroundColor: colors.brand.violet,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  badgeText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  dieRoll: {
    color: colors.text.muted,
  },
});
