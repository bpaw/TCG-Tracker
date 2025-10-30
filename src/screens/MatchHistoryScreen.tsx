import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useDeckStore } from '../stores/deckStore';
import { useMatchStore } from '../stores/matchStore';
import { useThemeStore } from '../stores/themeStore';
import { useUiStore } from '../stores/uiStore';
import { Title, Body } from '../components/atoms/Text';
import { SwipeableDelete } from '../components/molecules/SwipeableDelete';
import MatchRow from '../components/MatchRow';
import DropdownButton from '../components/DropdownButton';
import { GameTitle, MatchResult } from '../domain/types';
import { useTheme } from '../hooks/useTheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MatchHistoryScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useThemeStore();

  const { decks, loadDecks } = useDeckStore();
  const { matches, loadMatches, deleteMatch, loading } = useMatchStore();
  const { showToast } = useUiStore();

  const [filterGame, setFilterGame] = useState<GameTitle | 'all'>('all');
  const [filterDeck, setFilterDeck] = useState<string>('all');
  const [filterResult, setFilterResult] = useState<MatchResult | 'all'>('all');

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface[100],
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingTop: 60,
      paddingBottom: spacing.md,
    },
    filterContainer: {
      paddingHorizontal: spacing.md,
      paddingTop: 0,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    filterItem: {
      flex: 1,
    },
    filterItemLarge: {
      flex: 2,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing['2xl'],
    },
    emptyText: {
      color: colors.text.muted,
    },
    listContent: {
      paddingBottom: spacing.md,
    },
  }), [colors, spacing]);

  useEffect(() => {
    loadDecks();
    loadMatches();
  }, []);

  useEffect(() => {
    // Apply filters
    const filters: any = {};
    if (filterGame !== 'all') filters.game = filterGame;
    if (filterDeck !== 'all') filters.deckId = filterDeck;
    if (filterResult !== 'all') filters.result = filterResult;

    loadMatches(Object.keys(filters).length > 0 ? filters : undefined);
  }, [filterGame, filterDeck, filterResult]);

  const handleMatchPress = (matchId: string) => {
    navigation.navigate('Match Detail', { matchId });
  };

  const handleDeleteMatch = (matchId: string, deckTitle?: string, close: () => void) => {
    const matchName = deckTitle ? `match with ${deckTitle}` : 'match';
    Alert.alert(
      'Delete Match',
      `Are you sure you want to delete this ${matchName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: close,
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMatch(matchId);
              showToast('Match deleted', 'success');
            } catch (error) {
              showToast('Failed to delete match', 'error');
            }
          },
        },
      ]
    );
  };

  const availableDecks = decks.filter((d) => !d.archived);

  // Dropdown options
  const gameOptions = [
    { label: 'All Games', value: 'all' },
    { label: 'Magic: The Gathering', value: 'Magic: The Gathering' },
    { label: 'Pokémon', value: 'Pokémon' },
    { label: 'Yu-Gi-Oh!', value: 'Yu-Gi-Oh!' },
    { label: 'Flesh and Blood', value: 'Flesh and Blood' },
    { label: 'Lorcana', value: 'Lorcana' },
    { label: 'One Piece', value: 'One Piece' },
    { label: 'Other', value: 'Other' },
  ];

  const resultOptions = [
    { label: 'All', value: 'all' },
    { label: 'Win', value: 'WIN' },
    { label: 'Loss', value: 'LOSS' },
    { label: 'Tie', value: 'TIE' },
  ];

  const deckOptions = [
    { label: 'All Decks', value: 'all' },
    ...availableDecks.map((deck) => ({ label: deck.title, value: deck.id })),
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title>Match History</Title>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <View style={[styles.filterItem, styles.filterItemLarge]}>
            <DropdownButton
              label="Game"
              value={filterGame}
              options={gameOptions}
              onChange={(value) => setFilterGame(value as GameTitle | 'all')}
            />
          </View>

          <View style={styles.filterItem}>
            <DropdownButton
              label="Result"
              value={filterResult}
              options={resultOptions}
              onChange={(value) => setFilterResult(value as MatchResult | 'all')}
            />
          </View>
        </View>

        <View style={styles.filterRow}>
          <View style={[styles.filterItem, { flex: 1 }]}>
            <DropdownButton
              label="Deck"
              value={filterDeck}
              options={deckOptions}
              onChange={(value) => setFilterDeck(value)}
            />
          </View>
        </View>
      </View>

      {/* Match List */}
      {loading && matches.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.violet} />
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Body style={styles.emptyText}>No matches found</Body>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const deck = decks.find((d) => d.id === item.myDeckId);
            return (
              <SwipeableDelete
                onDelete={(close) => handleDeleteMatch(item.id, deck?.title, close)}
              >
                <MatchRow
                  match={item}
                  deckTitle={deck?.title}
                  onPress={() => handleMatchPress(item.id)}
                />
              </SwipeableDelete>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}
