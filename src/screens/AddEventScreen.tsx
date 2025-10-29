import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useEventStore } from '../stores/eventStore';
import { useUiStore } from '../stores/uiStore';
import { FormLabel, FormInput } from '../components/FormControls';
import { eventSchema, EventFormData, gameTitles } from '../validation/schemas';
import { colors, spacing } from '../design/tokens';
import { Body, Caption } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Add Event'>;

export default function AddEventScreen() {
  const navigation = useNavigation<NavigationProp>();

  const { createEvent } = useEventStore();
  const { showToast } = useUiStore();

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      game: 'Magic: The Gathering',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      totalRounds: undefined,
      notes: '',
    },
  });

  const onSubmit = async (data: EventFormData) => {
    try {
      console.log('Creating event:', data);
      await createEvent(data);
      console.log('Event created successfully');
      showToast('Event created successfully!', 'success');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create event:', error);
      showToast('Failed to create event', 'error');
    }
  };

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
          {/* Event Name */}
          <View style={styles.field}>
            <FormLabel text="Event Name" required />
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g., FNM - Modern, Prerelease"
                  error={errors.name?.message}
                />
              )}
            />
          </View>

          {/* Game */}
          <View style={styles.field}>
            <FormLabel text="Game" required />
            <Controller
              control={control}
              name="game"
              render={({ field: { onChange, value } }) => (
                <View style={styles.picker}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={styles.pickerInput}
                  >
                    {[...gameTitles].map((game) => (
                      <Picker.Item key={game} label={game} value={game} color={colors.text.primary} />
                    ))}
                  </Picker>
                </View>
              )}
            />
            {errors.game && (
              <Caption style={styles.errorText}>{errors.game.message}</Caption>
            )}
          </View>

          {/* Start Date */}
          <View style={styles.field}>
            <FormLabel text="Start Date" required />
            <Controller
              control={control}
              name="startDate"
              render={({ field: { onChange, value } }) => (
                <View>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartPicker(true)}
                  >
                    <Body style={styles.dateButtonText}>
                      {new Date(value).toLocaleDateString()}
                    </Body>
                  </TouchableOpacity>
                  {showStartPicker && (
                    <DateTimePicker
                      value={new Date(value)}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      textColor={colors.text.primary}
                      onChange={(event, selectedDate) => {
                        if (Platform.OS === 'android') {
                          setShowStartPicker(false);
                        }
                        if (event.type === 'set' && selectedDate) {
                          onChange(selectedDate.toISOString());
                        }
                      }}
                    />
                  )}
                  {showStartPicker && Platform.OS === 'ios' && (
                    <View style={styles.doneButtonContainer}>
                      <Button
                        title="Done"
                        intent="primary"
                        onPress={() => setShowStartPicker(false)}
                      />
                    </View>
                  )}
                </View>
              )}
            />
            {errors.startDate && (
              <Caption style={styles.errorText}>{errors.startDate.message}</Caption>
            )}
          </View>

          {/* End Date */}
          <View style={styles.field}>
            <FormLabel text="End Date" required />
            <Controller
              control={control}
              name="endDate"
              render={({ field: { onChange, value } }) => (
                <View>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndPicker(true)}
                  >
                    <Body style={styles.dateButtonText}>
                      {new Date(value).toLocaleDateString()}
                    </Body>
                  </TouchableOpacity>
                  {showEndPicker && (
                    <DateTimePicker
                      value={new Date(value)}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      textColor={colors.text.primary}
                      minimumDate={new Date(watch('startDate'))}
                      onChange={(event, selectedDate) => {
                        if (Platform.OS === 'android') {
                          setShowEndPicker(false);
                        }
                        if (event.type === 'set' && selectedDate) {
                          onChange(selectedDate.toISOString());
                        }
                      }}
                    />
                  )}
                  {showEndPicker && Platform.OS === 'ios' && (
                    <View style={styles.doneButtonContainer}>
                      <Button
                        title="Done"
                        intent="primary"
                        onPress={() => setShowEndPicker(false)}
                      />
                    </View>
                  )}
                </View>
              )}
            />
            {errors.endDate && (
              <Caption style={styles.errorText}>{errors.endDate.message}</Caption>
            )}
          </View>

          {/* Total Rounds */}
          <View style={styles.field}>
            <FormLabel text="Total Rounds" required />
            <Controller
              control={control}
              name="totalRounds"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  value={value !== undefined ? String(value) : ''}
                  onChangeText={(text) => {
                    if (text === '') {
                      onChange(undefined);
                    } else {
                      const num = parseInt(text, 10);
                      if (!isNaN(num)) {
                        onChange(num);
                      }
                    }
                  }}
                  placeholder="e.g., 4"
                  keyboardType="number-pad"
                  error={errors.totalRounds?.message}
                />
              )}
            />
            <Caption style={styles.helpText}>
              How many rounds will this event have? (1-20)
            </Caption>
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
                  placeholder="Add notes about this event..."
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
          title={isSubmitting ? 'Creating...' : 'Create Event'}
          intent="primary"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          style={isSubmitting && styles.buttonDisabled}
        />
      </View>
    </KeyboardAvoidingView>
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
  errorText: {
    color: colors.brand.coral,
    marginTop: 4,
  },
  helpText: {
    color: colors.text.secondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  footer: {
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: colors.surface[400],
    backgroundColor: colors.surface[100],
  },
  buttonDisabled: {
    opacity: 0.6,
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
  dateButtonText: {
    color: colors.text.primary,
  },
  doneButtonContainer: {
    marginTop: spacing.xs,
  },
});
