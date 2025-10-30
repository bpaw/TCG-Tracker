import React, { useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useDeckStore } from '../stores/deckStore';
import { useMatchStore } from '../stores/matchStore';
import { useUiStore } from '../stores/uiStore';
import { Deck, GameTitle } from '../domain/types';
import { getWinRate } from '../utils/stats';
import { useTheme } from '../hooks/useTheme';
import { Title, H2, Body, Caption } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DecksScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { decks, loadDecks, archiveDeck } = useDeckStore();
  const { matches, loadMatches } = useMatchStore();
  const { showToast } = useUiStore();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface[100],
    },
    scrollView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.md,
      paddingTop: 60,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      marginTop: 60,
    },
    emptyText: {
      textAlign: 'center',
    },
    gameSection: {
      marginBottom: spacing.lg,
    },
    gameTitle: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    deckCard: {
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      padding: spacing.md,
    },
    deckCardArchived: {
      opacity: 0.6,
    },
    deckHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
    },
    deckInfo: {
      flex: 1,
    },
    deckTitle: {
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    deckTitleArchived: {
      fontStyle: 'italic',
    },
    deckStats: {
      marginTop: spacing.xs,
    },
    deckNotes: {
      marginBottom: spacing.sm,
    },
    deckActions: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
  }), [colors, spacing]);

  // Reload decks when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadDecks();
      loadMatches();
    }, [])
  );

  const handleAddDeck = () => {
    navigation.navigate('Edit Deck', {});
  };

  const handleEditDeck = (deckId: string) => {
    navigation.navigate('Edit Deck', { deckId });
  };

  const handleArchiveDeck = (deck: Deck) => {
    const action = deck.archived ? 'Unarchive' : 'Archive';
    Alert.alert(
      `${action} Deck`,
      `Are you sure you want to ${action.toLowerCase()} "${deck.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          onPress: async () => {
            try {
              await archiveDeck(deck.id, !deck.archived);
              showToast(
                `Deck ${deck.archived ? 'unarchived' : 'archived'}`,
                'success'
              );
            } catch (error) {
              showToast('Failed to update deck', 'error');
            }
          },
        },
      ]
    );
  };

  // Group decks by game
  const decksByGame = decks.reduce((acc, deck) => {
    if (!acc[deck.game]) {
      acc[deck.game] = [];
    }
    acc[deck.game].push(deck);
    return acc;
  }, {} as Record<GameTitle, Deck[]>);

  const games = Object.keys(decksByGame) as GameTitle[];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Title>Decks</Title>
          <Button
            title="+ Add Deck"
            onPress={handleAddDeck}
            intent="primary"
          />
        </View>

        {/* Decks by Game */}
        {games.length === 0 ? (
          <View style={styles.emptyState}>
            <Body style={styles.emptyText}>
              No decks yet. Add your first deck to get started!
            </Body>
          </View>
        ) : (
          games.map((game) => (
            <View key={game} style={styles.gameSection}>
              <H2 style={styles.gameTitle}>
                {game}
              </H2>
              {decksByGame[game].map((deck) => {
                const deckMatches = matches.filter((m) => m.myDeckId === deck.id);
                const winRate = getWinRate(deckMatches);

                return (
                  <Card
                    key={deck.id}
                    style={[
                      styles.deckCard,
                      deck.archived && styles.deckCardArchived,
                    ]}
                  >
                    <View style={styles.deckHeader}>
                      <View style={styles.deckInfo}>
                        <Body
                          style={[
                            styles.deckTitle,
                            deck.archived && styles.deckTitleArchived,
                          ]}
                        >
                          {deck.title}
                          {deck.archived && ' (Archived)'}
                        </Body>
                        {deckMatches.length > 0 && (
                          <Caption style={styles.deckStats}>
                            <Caption style={{ color: colors.brand.emerald }}>
                              {winRate.wins}W
                            </Caption>
                            -
                            <Caption style={{ color: colors.brand.coral }}>
                              {winRate.total - winRate.wins}L
                            </Caption>
                            {' '}• {winRate.percentage.toFixed(0)}% WR
                          </Caption>
                        )}
                      </View>
                    </View>

                    {deck.notes && (
                      <Caption
                        style={styles.deckNotes}
                        numberOfLines={2}
                      >
                        {deck.notes}
                      </Caption>
                    )}

                    <View style={styles.deckActions}>
                      <Button
                        title="Edit"
                        onPress={() => handleEditDeck(deck.id)}
                        intent="neutral"
                      />
                      <Button
                        title={deck.archived ? 'Unarchive' : 'Archive'}
                        onPress={() => handleArchiveDeck(deck)}
                        intent="neutral"
                      />
                    </View>
                  </Card>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
