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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useDeckStore } from '../stores/deckStore';
import { useMatchStore } from '../stores/matchStore';
import { useUiStore } from '../stores/uiStore';
import { Deck, GameTitle } from '../domain/types';
import { getWinRate } from '../utils/stats';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DecksScreen() {
  const navigation = useNavigation<NavigationProp>();
  const isDark = false; // Force light mode

  const { decks, loadDecks, archiveDeck } = useDeckStore();
  const { matches, loadMatches } = useMatchStore();
  const { showToast } = useUiStore();

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

  const handleLogMatch = (deckId: string) => {
    // Note: With event-first structure, users should create events first
    // then add rounds from the event detail page
    showToast('Create an event first, then add rounds', 'info');
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
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            Decks
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddDeck}>
            <Text style={styles.addButtonText}>+ Add Deck</Text>
          </TouchableOpacity>
        </View>

        {/* Decks by Game */}
        {games.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              No decks yet. Add your first deck to get started!
            </Text>
          </View>
        ) : (
          games.map((game) => (
            <View key={game} style={styles.gameSection}>
              <Text style={[styles.gameTitle, isDark && styles.gameTitleDark]}>
                {game}
              </Text>
              {decksByGame[game].map((deck) => {
                const deckMatches = matches.filter((m) => m.myDeckId === deck.id);
                const winRate = getWinRate(deckMatches);

                return (
                  <View
                    key={deck.id}
                    style={[
                      styles.deckCard,
                      isDark && styles.deckCardDark,
                      deck.archived && styles.deckCardArchived,
                    ]}
                  >
                    <View style={styles.deckHeader}>
                      <View style={styles.deckInfo}>
                        <Text
                          style={[
                            styles.deckTitle,
                            isDark && styles.deckTitleDark,
                            deck.archived && styles.deckTitleArchived,
                          ]}
                        >
                          {deck.title}
                          {deck.archived && ' (Archived)'}
                        </Text>
                        {deckMatches.length > 0 && (
                          <Text
                            style={[styles.deckStats, isDark && styles.deckStatsDark]}
                          >
                            {winRate.wins}W-{winRate.total - winRate.wins}L •{' '}
                            {winRate.percentage.toFixed(0)}% WR
                          </Text>
                        )}
                      </View>
                    </View>

                    {deck.notes && (
                      <Text
                        style={[styles.deckNotes, isDark && styles.deckNotesDark]}
                        numberOfLines={2}
                      >
                        {deck.notes}
                      </Text>
                    )}

                    <View style={styles.deckActions}>
                      {!deck.archived && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleLogMatch(deck.id)}
                        >
                          <Text style={styles.actionButtonText}>Log Match</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditDeck(deck.id)}
                      >
                        <Text style={styles.actionButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleArchiveDeck(deck)}
                      >
                        <Text style={styles.actionButtonText}>
                          {deck.archived ? 'Unarchive' : 'Archive'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  emptyTextDark: {
    color: '#98989F',
  },
  gameSection: {
    marginBottom: 24,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  gameTitleDark: {
    color: '#fff',
  },
  deckCard: {
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  deckCardDark: {
    backgroundColor: '#1C1C1E',
  },
  deckCardArchived: {
    opacity: 0.6,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  deckInfo: {
    flex: 1,
  },
  deckTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  deckTitleDark: {
    color: '#fff',
  },
  deckTitleArchived: {
    fontStyle: 'italic',
  },
  deckStats: {
    fontSize: 14,
    color: '#8E8E93',
  },
  deckStatsDark: {
    color: '#98989F',
  },
  deckNotes: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  deckNotesDark: {
    color: '#98989F',
  },
  deckActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
