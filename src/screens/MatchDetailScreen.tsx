import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useDeckStore } from '../stores/deckStore';
import { useMatchStore } from '../stores/matchStore';
import { useUiStore } from '../stores/uiStore';
import { formatDateTime } from '../utils/date';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Match Detail'>;
type MatchDetailRouteProp = RouteProp<RootStackParamList, 'Match Detail'>;

export default function MatchDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<MatchDetailRouteProp>();
  const isDark = false; // Force light mode

  const { matchId } = route.params;
  const { decks, loadDecks } = useDeckStore();
  const { getMatch, deleteMatch } = useMatchStore();
  const { showToast } = useUiStore();

  const match = getMatch(matchId);
  const deck = match ? decks.find((d) => d.id === match.myDeckId) : null;

  useEffect(() => {
    loadDecks();
  }, []);

  if (!match) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
          Match not found
        </Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Match',
      'Are you sure you want to delete this match? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMatch(matchId);
              showToast('Match deleted', 'success');
              navigation.goBack();
            } catch (error) {
              showToast('Failed to delete match', 'error');
            }
          },
        },
      ]
    );
  };

  const handleDuplicate = () => {
    // Duplicate functionality removed in event-first architecture
    // Users should add a new round from the event detail page
    showToast('Add a new round from the event page', 'info');
  };

  const resultColor =
    match.result === 'WIN'
      ? '#34C759'
      : match.result === 'LOSS'
      ? '#FF3B30'
      : '#FF9500';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView style={styles.scrollView}>
        {/* Result Badge */}
        <View style={styles.header}>
          <View style={[styles.resultBadge, { backgroundColor: resultColor }]}>
            <Text style={styles.resultText}>{match.result}</Text>
          </View>
          {match.score && (
            <Text style={[styles.score, isDark && styles.scoreDark]}>
              Score: {match.score}
            </Text>
          )}
        </View>

        {/* Details */}
        <View style={styles.section}>
          <DetailRow label="Date" value={formatDateTime(match.date)} isDark={isDark} />
          <DetailRow label="Game" value={match.game} isDark={isDark} />
          <DetailRow
            label="My Deck"
            value={deck?.title || 'Unknown Deck'}
            isDark={isDark}
          />
          <DetailRow
            label="Opponent Deck"
            value={match.oppDeckArchetype}
            isDark={isDark}
          />
          {match.opponentName && (
            <DetailRow
              label="Opponent Name"
              value={match.opponentName}
              isDark={isDark}
            />
          )}
        </View>

        {/* Game Details */}
        {(match.wonDieRoll !== undefined ||
          match.started ||
          match.startTurnNumber) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Game Details
            </Text>
            {match.wonDieRoll !== undefined && (
              <DetailRow
                label="Die Roll"
                value={match.wonDieRoll ? 'Won' : 'Lost'}
                isDark={isDark}
              />
            )}
            {match.started && match.started !== 'UNKNOWN' && (
              <DetailRow
                label="Started"
                value={match.started === 'FIRST' ? 'First' : 'Second'}
                isDark={isDark}
              />
            )}
            {match.startTurnNumber && (
              <DetailRow
                label="Turn Number"
                value={match.startTurnNumber.toString()}
                isDark={isDark}
              />
            )}
          </View>
        )}

        {/* Notes */}
        {match.notes && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Notes
            </Text>
            <Text style={[styles.notes, isDark && styles.notesDark]}>
              {match.notes}
            </Text>
          </View>
        )}

        {/* Tags */}
        {match.tags && match.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Tags
            </Text>
            <View style={styles.tags}>
              {match.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Timestamps */}
        <View style={styles.section}>
          <DetailRow
            label="Created"
            value={formatDateTime(match.createdAt)}
            isDark={isDark}
            small
          />
          <DetailRow
            label="Updated"
            value={formatDateTime(match.updatedAt)}
            isDark={isDark}
            small
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, isDark && styles.footerDark]}>
        <TouchableOpacity style={styles.duplicateButton} onPress={handleDuplicate}>
          <Text style={styles.duplicateButtonText}>Duplicate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  isDark: boolean;
  small?: boolean;
}

function DetailRow({ label, value, isDark, small = false }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text
        style={[
          small ? styles.detailLabelSmall : styles.detailLabel,
          isDark && styles.detailLabelDark,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          small ? styles.detailValueSmall : styles.detailValue,
          isDark && styles.detailValueDark,
        ]}
      >
        {value}
      </Text>
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
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  resultBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  resultText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  score: {
    fontSize: 16,
    color: '#8E8E93',
  },
  scoreDark: {
    color: '#98989F',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#fff',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  detailLabelDark: {
    color: '#98989F',
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
  },
  detailValueDark: {
    color: '#fff',
  },
  detailLabelSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  detailValueSmall: {
    fontSize: 12,
    color: '#8E8E93',
  },
  notes: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
  notesDark: {
    color: '#fff',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 32,
  },
  errorTextDark: {
    color: '#FF453A',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  footerDark: {
    borderTopColor: '#38383A',
    backgroundColor: '#000',
  },
  duplicateButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  duplicateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
