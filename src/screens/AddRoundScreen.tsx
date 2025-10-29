import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
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
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { onePieceColors } from '../domain/gameTitle/onePiece';
import leaders from '../data/_data/leaders.json';
import { useTheme } from '../hooks/useTheme';
import { Title, Body, Caption } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Add Round'>;
type AddRoundRouteProp = RouteProp<RootStackParamList, 'Add Round'>;

export default function AddRoundScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddRoundRouteProp>();

  const { eventId, roundNumber } = route.params;
  const { decks, loadDecks } = useDeckStore();
  const { createMatch } = useMatchStore();
  const { getEvent, loadEvents } = useEventStore();
  const { showToast } = useUiStore();

  const [customScore, setCustomScore] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const event = getEvent(eventId);
  const isOnePiece = event?.game === 'One Piece';

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface[100],
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: spacing.lg,
    },
    form: {
      padding: spacing.md,
    },
    field: {
      marginBottom: spacing.lg,
    },
    infoCard: {
      backgroundColor: colors.surface[300],
      padding: spacing.md,
      borderRadius: 8,
      marginBottom: spacing.lg,
    },
    infoLabel: {
      color: colors.brand.violet,
      marginBottom: 4,
    },
    infoValue: {
      color: colors.text.primary,
    },
    picker: {
      backgroundColor: colors.surface[300],
      borderWidth: 1,
      borderColor: colors.surface[400],
      borderRadius: 8,
      overflow: 'hidden',
    },
    pickerInput: {
      color: colors.text.primary,
    },
    onePiecePicker: {
      marginBottom: spacing.sm,
    },
    errorText: {
      color: colors.brand.coral,
      marginTop: 4,
    },
    booleanButtons: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    booleanButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 8,
      backgroundColor: colors.surface[300],
      alignItems: 'center',
    },
    booleanButtonActive: {
      backgroundColor: colors.brand.violet,
    },
    booleanButtonText: {
      color: colors.text.secondary,
    },
    booleanButtonTextActive: {
      color: colors.text.primary,
    },
    footer: {
      padding: spacing.md,
      paddingBottom: spacing['2xl'],
      borderTopWidth: 1,
      borderTopColor: colors.surface[300],
      backgroundColor: colors.surface[100],
    },
    dateButton: {
      backgroundColor: colors.surface[300],
      borderWidth: 1,
      borderColor: colors.surface[400],
      borderRadius: 8,
      padding: spacing.sm,
      minHeight: 44,
      justifyContent: 'center',
    },
    doneButton: {
      marginTop: spacing.xs,
    },
  }), [colors, spacing]);

  // Autofill date logic: use current date unless it's after event end date
  const getDefaultDate = () => {
    const now = new Date();
    if (event) {
      const eventEnd = new Date(event.endDate);
      if (now > eventEnd) {
        return event.endDate;
      }
    }
    return now.toISOString();
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      date: getDefaultDate(),
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

      // For One Piece, build oppDeckArchetype from leader and color
      const matchData = isOnePiece && data.onePieceLeader && data.onePieceColor
        ? {
            ...data,
            oppDeckArchetype: `${data.onePieceLeader} - ${data.onePieceColor}`,
            tags: data.tags || [],
          }
        : {
            ...data,
            tags: data.tags || [],
          };

      await createMatch(matchData);
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
      <View style={styles.container}>
        <Body style={styles.errorText}>Event not found</Body>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
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
            <Body weight="semibold" style={styles.infoLabel}>
              {event.name}
            </Body>
            <Title size="lg" style={styles.infoValue}>
              Round {roundNumber} of {event.totalRounds}
            </Title>
          </View>

          {/* My Deck */}
          <View style={styles.field}>
            <FormLabel text="My Deck" required />
            <Controller
              control={control}
              name="myDeckId"
              render={({ field: { onChange, value } }) => (
                <View style={styles.picker}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={styles.pickerInput}
                  >
                    <Picker.Item label="Select a deck..." value="" color={colors.text.primary} />
                    {activeDecks.map((deck) => (
                      <Picker.Item
                        key={deck.id}
                        label={deck.title}
                        value={deck.id}
                        color={colors.text.primary}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            />
            {errors.myDeckId && (
              <Caption style={styles.errorText}>{errors.myDeckId.message}</Caption>
            )}
          </View>

          {/* Round Date */}
          <View style={styles.field}>
            <FormLabel text="Round Date" required />
            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, value } }) => (
                <View>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Body>{new Date(value).toLocaleDateString()}</Body>
                  </TouchableOpacity>
                  {showDatePicker && event && (
                    <DateTimePicker
                      value={new Date(value)}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      textColor="#fff"
                      minimumDate={new Date(event.startDate)}
                      maximumDate={new Date(event.endDate)}
                      onChange={(pickerEvent, selectedDate) => {
                        if (Platform.OS === 'android') {
                          setShowDatePicker(false);
                        }
                        if (pickerEvent.type === 'set' && selectedDate) {
                          onChange(selectedDate.toISOString());
                        }
                      }}
                    />
                  )}
                  {showDatePicker && Platform.OS === 'ios' && (
                    <Button
                      title="Done"
                      intent="primary"
                      onPress={() => setShowDatePicker(false)}
                      style={styles.doneButton}
                    />
                  )}
                </View>
              )}
            />
            {errors.date && (
              <Caption style={styles.errorText}>{errors.date.message}</Caption>
            )}
          </View>

          {/* Opponent Deck Archetype */}
          <View style={styles.field}>
            <FormLabel text="Opponent Deck Archetype" required />
            {isOnePiece ? (
              <View>
                <Controller
                  control={control}
                  name="onePieceLeader"
                  render={({ field: { onChange, value } }) => (
                    <View style={[styles.picker, styles.onePiecePicker]}>
                      <Picker
                        selectedValue={value || ''}
                        onValueChange={onChange}
                        style={styles.pickerInput}
                      >
                        <Picker.Item label="Select leader..." value="" color={colors.text.primary} />
                        {leaders.map((leader) => (
                          <Picker.Item
                            key={leader}
                            label={leader}
                            value={leader}
                            color={colors.text.primary}
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                />
                <Controller
                  control={control}
                  name="onePieceColor"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.picker}>
                      <Picker
                        selectedValue={value || ''}
                        onValueChange={onChange}
                        style={styles.pickerInput}
                      >
                        <Picker.Item label="Select color..." value="" color={colors.text.primary} />
                        {onePieceColors.map((color) => (
                          <Picker.Item
                            key={color}
                            label={color}
                            value={color}
                            color={colors.text.primary}
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                />
              </View>
            ) : (
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
            )}
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
              <Caption style={styles.errorText}>{errors.result.message}</Caption>
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
                    <Body
                      weight="semibold"
                      style={[
                        styles.booleanButtonText,
                        value === true && styles.booleanButtonTextActive,
                      ]}
                    >
                      Yes
                    </Body>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.booleanButton,
                      value === false && styles.booleanButtonActive,
                    ]}
                    onPress={() => onChange(false)}
                  >
                    <Body
                      weight="semibold"
                      style={[
                        styles.booleanButtonText,
                        value === false && styles.booleanButtonTextActive,
                      ]}
                    >
                      No
                    </Body>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.booleanButton,
                      value === undefined && styles.booleanButtonActive,
                    ]}
                    onPress={() => onChange(undefined)}
                  >
                    <Body
                      weight="semibold"
                      style={[
                        styles.booleanButtonText,
                        value === undefined && styles.booleanButtonTextActive,
                      ]}
                    >
                      Unknown
                    </Body>
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
      <View style={styles.footer}>
        <Button
          title={isSubmitting ? 'Saving...' : 'Save Round'}
          intent="primary"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
