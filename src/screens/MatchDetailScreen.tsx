import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useDeckStore } from '../stores/deckStore';
import { useMatchStore } from '../stores/matchStore';
import { useUiStore } from '../stores/uiStore';
import { formatDateTime } from '../utils/date';
import { getLeaderImage, getColorBorderColor } from '../domain/gameTitle/onePieceAssets';
import { colors, spacing } from '../design/tokens';
import { Title, H2, Body, Caption } from '../components/atoms/Text';
import { Card } from '../components/atoms/Card';
import { Chip } from '../components/atoms/Chip';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Match Detail'>;
type MatchDetailRouteProp = RouteProp<RootStackParamList, 'Match Detail'>;

export default function MatchDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<MatchDetailRouteProp>();

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
      <View style={styles.container}>
        <Body style={styles.errorText}>Match not found</Body>
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

  const getResultKind = (): 'win' | 'loss' | 'meta' => {
    if (match.result === 'WIN') return 'win';
    if (match.result === 'LOSS') return 'loss';
    return 'meta';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Result Badge */}
        <View style={styles.header}>
          <Chip
            text={match.result}
            kind={getResultKind()}
          />
          {match.score && (
            <Caption style={styles.score}>Score: {match.score}</Caption>
          )}
        </View>

        {/* Details */}
        <Card style={styles.section}>
          <DetailRow label="Date" value={formatDateTime(match.date)} />
          <DetailRow label="Game" value={match.game} />
          <DetailRow
            label="My Deck"
            value={deck?.title || 'Unknown Deck'}
          />
          <DetailRow
            label="Opponent Deck"
            value={match.oppDeckArchetype}
          />
          {match.opponentName && (
            <DetailRow
              label="Opponent Name"
              value={match.opponentName}
            />
          )}
        </Card>

        {/* One Piece Leader Section */}
        {match.game === 'One Piece' && match.onePieceLeader && match.onePieceColor && (
          <Card style={styles.section}>
            <H2 style={styles.sectionTitle}>Opponent Leader</H2>
            <View style={styles.onePieceLeaderSection}>
              <View style={[styles.leaderImageBorder, { borderColor: getColorBorderColor(match.onePieceColor) }]}>
                <Image
                  source={getLeaderImage(match.onePieceLeader)}
                  style={styles.leaderImageLarge}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.leaderInfo}>
                <H2 style={styles.leaderName}>{match.onePieceLeader}</H2>
                <Body>Color: {match.onePieceColor}</Body>
              </View>
            </View>
          </Card>
        )}

        {/* Game Details */}
        {(match.wonDieRoll !== undefined ||
          match.started ||
          match.startTurnNumber) && (
          <Card style={styles.section}>
            <H2 style={styles.sectionTitle}>Game Details</H2>
            {match.wonDieRoll !== undefined && (
              <View style={styles.detailRow}>
                <Body style={styles.detailLabel}>Die Roll</Body>
                <View style={styles.diceContainer}>
                  <MaterialCommunityIcons
                    name="dice-5"
                    size={24}
                    color={match.wonDieRoll ? colors.brand.emerald : colors.brand.coral}
                  />
                  <Body weight="semibold" style={{ marginLeft: spacing.xs, color: match.wonDieRoll ? colors.brand.emerald : colors.brand.coral }}>
                    {match.wonDieRoll ? 'Won' : 'Lost'}
                  </Body>
                </View>
              </View>
            )}
            {match.started && match.started !== 'UNKNOWN' && (
              <DetailRow
                label="Started"
                value={match.started === 'FIRST' ? 'First' : 'Second'}
              />
            )}
            {match.startTurnNumber && (
              <DetailRow
                label="Turn Number"
                value={match.startTurnNumber.toString()}
              />
            )}
          </Card>
        )}

        {/* Notes */}
        {match.notes && (
          <Card style={styles.section}>
            <H2 style={styles.sectionTitle}>Notes</H2>
            <Body style={styles.notes}>{match.notes}</Body>
          </Card>
        )}

        {/* Tags */}
        {match.tags && match.tags.length > 0 && (
          <Card style={styles.section}>
            <H2 style={styles.sectionTitle}>Tags</H2>
            <View style={styles.tags}>
              {match.tags.map((tag, index) => (
                <Chip key={index} text={tag} kind="meta" />
              ))}
            </View>
          </Card>
        )}

        {/* Timestamps */}
        <Card style={styles.section}>
          <DetailRow
            label="Created"
            value={formatDateTime(match.createdAt)}
            small
          />
          <DetailRow
            label="Updated"
            value={formatDateTime(match.updatedAt)}
            small
          />
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.duplicateButton} onPress={handleDuplicate}>
          <Body style={styles.duplicateButtonText}>Duplicate</Body>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Body style={styles.deleteButtonText}>Delete</Body>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  small?: boolean;
}

function DetailRow({ label, value, small = false }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      {small ? (
        <>
          <Caption style={styles.detailLabel}>{label}</Caption>
          <Caption>{value}</Caption>
        </>
      ) : (
        <>
          <Body style={styles.detailLabel}>{label}</Body>
          <Body weight="semibold">{value}</Body>
        </>
      )}
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
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface[400],
  },
  score: {
    marginTop: spacing.md,
  },
  section: {
    margin: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    color: colors.text.secondary,
  },
  diceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notes: {
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  errorText: {
    color: colors.brand.coral,
    textAlign: 'center',
    marginTop: spacing['2xl'],
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface[400],
    backgroundColor: colors.surface[100],
  },
  duplicateButton: {
    flex: 1,
    backgroundColor: colors.brand.violet,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  duplicateButtonText: {
    color: '#FFFFFF',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.brand.coral,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
  onePieceLeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  leaderImageBorder: {
    borderWidth: 4,
    borderRadius: spacing.md,
    padding: spacing.xs,
    overflow: 'hidden',
  },
  leaderImageLarge: {
    width: 120,
    height: 120,
    borderRadius: spacing.md,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    marginBottom: spacing.xs,
  },
});
