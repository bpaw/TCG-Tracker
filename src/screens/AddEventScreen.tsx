import React from 'react';
import {
  View,
  Text,
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
import { RootStackParamList } from '../navigation/RootNavigator';
import { useEventStore } from '../stores/eventStore';
import { useUiStore } from '../stores/uiStore';
import { FormLabel, FormInput } from '../components/FormControls';
import { eventSchema, EventFormData, gameTitles } from '../validation/schemas';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Add Event'>;

export default function AddEventScreen() {
  const navigation = useNavigation<NavigationProp>();
  const isDark = false; // Force light mode

  const { createEvent } = useEventStore();
  const { showToast } = useUiStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      game: 'Magic: The Gathering',
      date: new Date().toISOString(),
      totalRounds: 4,
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
                <View style={[styles.picker, isDark && styles.pickerDark]}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={[styles.pickerInput, isDark && styles.pickerInputDark]}
                  >
                    {[...gameTitles].map((game) => (
                      <Picker.Item key={game} label={game} value={game} color="#000" />
                    ))}
                  </Picker>
                </View>
              )}
            />
            {errors.game && (
              <Text style={styles.errorText}>{errors.game.message}</Text>
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
                  value={String(value)}
                  onChangeText={(text) => {
                    const num = parseInt(text);
                    onChange(isNaN(num) ? 1 : num);
                  }}
                  placeholder="e.g., 4"
                  keyboardType="number-pad"
                  error={errors.totalRounds?.message}
                />
              )}
            />
            <Text style={styles.helpText}>
              How many rounds will this event have? (1-20)
            </Text>
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
      <View style={[styles.footer, isDark && styles.footerDark]}>
        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? 'Creating...' : 'Create Event'}
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
  helpText: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
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
