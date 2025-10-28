import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useDeckStore } from '../stores/deckStore';
import { useMatchStore } from '../stores/matchStore';
import { useEventStore } from '../stores/eventStore';
import { useUiStore } from '../stores/uiStore';
import {
  FormLabel,
  FormInput,
  SegmentedControl,
  ChipSelect,
} from '../components/FormControls';
import {
  matchSchema,
  MatchFormData,
  matchResults,
  startChoices,
  scoreOptions,
} from '../validation/schemas';
import { Picker } from '@react-native-picker/picker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Add Round'>;
type AddRoundRouteProp = RouteProp<RootStackParamList, 'Add Round'>;

export default function AddRoundScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddRoundRouteProp>();
  const isDark = false; // Force light mode

  const { eventId, roundNumber } = route.params;
  const { decks, loadDecks } = useDeckStore();
  const { createMatch } = useMatchStore();
  const { getEvent, loadEvents } = useEventStore();
  const { showToast } = useUiStore();

  const [customScore, setCustomScore] = useState('');

  const event = getEvent(eventId);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      date: new Date().toISOString(),
      game: event?.game || 'Magic: The Gathering',
      eventId,
      roundNumber,
      result: 'WIN',
      started: 'UNKNOWN',
    },
  });

  useEffect(() => {
    loadDecks();
    loadEvents();
  }, []);

  const selectedGame = watch('game');
  const activeDecks = decks.filter(
    (d) => !d.archived && d.game === selectedGame
  );

  const onSubmit = async (data: MatchFormData) => {
    try {
      console.log('Saving round:', data);
      await createMatch({
        ...data,
        tags: data.tags || [],
      });
      console.log('Round saved successfully, navigating back');
      showToast('Round saved successfully!', 'success');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save round:', error);
      showToast('Failed to save round', 'error');
    }
  };

  if (!event) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
          Event not found
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.form}>
          {/* Event & Round Info */}
          <View style={styles.infoCard}>
            <Text style={[styles.infoLabel, isDark && styles.infoLabelDark]}>
              {event.name}
            </Text>
            <Text style={[styles.infoValue, isDark && styles.infoValueDark]}>
              Round {roundNumber} of {event.totalRounds}
            </Text>
          </View>

          {/* My Deck */}
          <View style={styles.field}>
            <FormLabel text="My Deck" required />
            <Controller
              control={control}
              name="myDeckId"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.picker, isDark && styles.pickerDark]}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={[styles.pickerInput, isDark && styles.pickerInputDark]}
                  >
                    <Picker.Item label="Select a deck..." value="" color="#000" />
                    {activeDecks.map((deck) => (
                      <Picker.Item
                        key={deck.id}
                        label={deck.title}
                        value={deck.id}
                        color="#000"
                      />
                    ))}
                  </Picker>
                </View>
              )}
            />
            {errors.myDeckId && (
              <Text style={styles.errorText}>{errors.myDeckId.message}</Text>
            )}
          </View>

          {/* Opponent Deck Archetype */}
          <View style={styles.field}>
            <FormLabel text="Opponent Deck Archetype" required />
            <Controller
              control={control}
              name="oppDeckArchetype"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  value={value || ''}
                  onChangeText={onChange}
                  placeholder="e.g., Rakdos Midrange"
                  error={errors.oppDeckArchetype?.message}
                />
              )}
            />
          </View>

          {/* Opponent Name */}
          <View style={styles.field}>
            <FormLabel text="Opponent Name" />
            <Controller
              control={control}
              name="opponentName"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  value={value || ''}
                  onChangeText={onChange}
                  placeholder="Optional"
                />
              )}
            />
          </View>

          {/* Result */}
          <View style={styles.field}>
            <FormLabel text="Result" required />
            <Controller
              control={control}
              name="result"
              render={({ field: { onChange, value } }) => (
                <SegmentedControl
                  options={matchResults}
                  selectedValue={value}
                  onValueChange={onChange}
                />
              )}
            />
            {errors.result && (
              <Text style={styles.errorText}>{errors.result.message}</Text>
            )}
          </View>

          {/* Score */}
          <View style={styles.field}>
            <FormLabel text="Score" />
            <Controller
              control={control}
              name="score"
              render={({ field: { onChange, value } }) => (
                <ChipSelect
                  options={scoreOptions}
                  selectedValue={value}
                  onValueChange={onChange}
                />
              )}
            />
          </View>

          {/* Won Die Roll */}
          <View style={styles.field}>
            <FormLabel text="Won Die Roll?" />
            <Controller
              control={control}
              name="wonDieRoll"
              render={({ field: { onChange, value } }) => (
                <View style={styles.booleanButtons}>
                  <TouchableOpacity
                    style={[
                      styles.booleanButton,
                      value === true && styles.booleanButtonActive,
                    ]}
                    onPress={() => onChange(true)}
                  >
                    <Text
                      style={[
                        styles.booleanButtonText,
                        value === true && styles.booleanButtonTextActive,
                      ]}
                    >
                      Yes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.booleanButton,
                      value === false && styles.booleanButtonActive,
                    ]}
                    onPress={() => onChange(false)}
                  >
                    <Text
                      style={[
                        styles.booleanButtonText,
                        value === false && styles.booleanButtonTextActive,
                      ]}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.booleanButton,
                      value === undefined && styles.booleanButtonActive,
                    ]}
                    onPress={() => onChange(undefined)}
                  >
                    <Text
                      style={[
                        styles.booleanButtonText,
                        value === undefined && styles.booleanButtonTextActive,
                      ]}
                    >
                      Unknown
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>

          {/* Started */}
          <View style={styles.field}>
            <FormLabel text="Started" />
            <Controller
              control={control}
              name="started"
              render={({ field: { onChange, value } }) => (
                <SegmentedControl
                  options={startChoices}
                  selectedValue={value}
                  onValueChange={onChange}
                />
              )}
            />
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <FormLabel text="Notes" />
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  value={value || ''}
                  onChangeText={onChange}
                  placeholder="Add notes about this round..."
                  multiline
                  numberOfLines={4}
                />
              )}
            />
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={[styles.footer, isDark && styles.footerDark]}>
        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? 'Saving...' : 'Save Round'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoLabelDark: {
    color: '#64B5F6',
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D47A1',
  },
  infoValueDark: {
    color: '#90CAF9',
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    overflow: 'hidden',
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
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  errorTextDark: {
    color: '#FF6B6B',
  },
  booleanButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  booleanButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
  },
  booleanButtonActive: {
    backgroundColor: '#007AFF',
  },
  booleanButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  booleanButtonTextActive: {
    color: '#fff',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  footerDark: {
    borderTopColor: '#38383A',
    backgroundColor: '#000',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#8E8E93',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
