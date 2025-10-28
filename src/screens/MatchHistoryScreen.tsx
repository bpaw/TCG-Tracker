import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useDeckStore } from '../stores/deckStore';
import { useMatchStore } from '../stores/matchStore';
import MatchRow from '../components/MatchRow';
import { GameTitle, MatchResult } from '../domain/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MatchHistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const isDark = false; // Force light mode

  const { decks, loadDecks } = useDeckStore();
  const { matches, loadMatches, loading } = useMatchStore();

  const [filterGame, setFilterGame] = useState<GameTitle | 'all'>('all');
  const [filterDeck, setFilterDeck] = useState<string>('all');
  const [filterResult, setFilterResult] = useState<MatchResult | 'all'>('all');

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

  const availableDecks = decks.filter((d) => !d.archived);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
          Match History
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <View style={[styles.filterItem, styles.filterItemLarge]}>
            <Text style={[styles.filterLabel, isDark && styles.filterLabelDark]}>
              Game
            </Text>
            <View style={[styles.picker, isDark && styles.pickerDark]}>
              <Picker
                selectedValue={filterGame}
                onValueChange={(value) => setFilterGame(value as GameTitle | 'all')}
                style={[styles.pickerInput, isDark && styles.pickerInputDark]}
              >
                <Picker.Item label="All Games" value="all" color="#000" />
                <Picker.Item label="Magic: The Gathering" value="Magic: The Gathering" color="#000" />
                <Picker.Item label="Pokémon" value="Pokémon" color="#000" />
                <Picker.Item label="Yu-Gi-Oh!" value="Yu-Gi-Oh!" color="#000" />
                <Picker.Item label="Flesh and Blood" value="Flesh and Blood" color="#000" />
                <Picker.Item label="Lorcana" value="Lorcana" color="#000" />
                <Picker.Item label="One Piece" value="One Piece" color="#000" />
                <Picker.Item label="Other" value="Other" color="#000" />
              </Picker>
            </View>
          </View>

          <View style={styles.filterItem}>
            <Text style={[styles.filterLabel, isDark && styles.filterLabelDark]}>
              Result
            </Text>
            <View style={[styles.picker, isDark && styles.pickerDark]}>
              <Picker
                selectedValue={filterResult}
                onValueChange={(value) =>
                  setFilterResult(value as MatchResult | 'all')
                }
                style={[styles.pickerInput, isDark && styles.pickerInputDark]}
              >
                <Picker.Item label="All" value="all" color="#000" />
                <Picker.Item label="Win" value="WIN" color="#000" />
                <Picker.Item label="Loss" value="LOSS" color="#000" />
                <Picker.Item label="Tie" value="TIE" color="#000" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.filterRow}>
          <View style={[styles.filterItem, { flex: 1 }]}>
            <Text style={[styles.filterLabel, isDark && styles.filterLabelDark]}>
              Deck
            </Text>
            <View style={[styles.picker, isDark && styles.pickerDark]}>
              <Picker
                selectedValue={filterDeck}
                onValueChange={(value) => setFilterDeck(value)}
                style={[styles.pickerInput, isDark && styles.pickerInputDark]}
              >
                <Picker.Item label="All Decks" value="all" color="#000" />
                {availableDecks.map((deck) => (
                  <Picker.Item key={deck.id} label={deck.title} value={deck.id} color="#000" />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {/* Match List */}
      {loading && matches.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
            No matches found
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const deck = decks.find((d) => d.id === item.myDeckId);
            return (
              <MatchRow
                match={item}
                deckTitle={deck?.title}
                onPress={() => handleMatchPress(item.id)}
              />
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  header: {
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
  filterContainer: {
    padding: 16,
    paddingTop: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterItemLarge: {
    flex: 2,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  filterLabelDark: {
    color: '#98989F',
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    overflow: 'hidden',
    height: 44,
  },
  pickerDark: {
    backgroundColor: '#1C1C1E',
    borderColor: '#38383A',
  },
  pickerInput: {
    color: '#000',
  },
  pickerInputDark: {
    color: '#fff',
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
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyTextDark: {
    color: '#98989F',
  },
  listContent: {
    paddingBottom: 16,
  },
});
