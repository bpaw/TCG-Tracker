import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useDeckStore } from '../stores/deckStore';
import { useUiStore } from '../stores/uiStore';
import { FormLabel, FormInput } from '../components/FormControls';
import { deckSchema, DeckFormData, gameTitles } from '../validation/schemas';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Edit Deck'>;
type EditDeckRouteProp = RouteProp<RootStackParamList, 'Edit Deck'>;

export default function EditDeckScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditDeckRouteProp>();
  const isDark = false; // Force light mode

  const { deckId } = route.params || {};
  const { getDeck, createDeck, updateDeck } = useDeckStore();
  const { showToast } = useUiStore();

  const isEditing = !!deckId;
  const existingDeck = isEditing ? getDeck(deckId) : null;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DeckFormData>({
    resolver: zodResolver(deckSchema),
    defaultValues: existingDeck || {
      title: '',
      game: 'Magic: The Gathering',
      notes: '',
    },
  });

  const onSubmit = async (data: DeckFormData) => {
    try {
      console.log('Creating deck with data:', data);
      if (isEditing && deckId) {
        await updateDeck(deckId, data);
        showToast('Deck updated successfully!', 'success');
      } else {
        const newDeck = await createDeck(data);
        console.log('Deck created:', newDeck);
        showToast('Deck created successfully!', 'success');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save deck:', error);
      showToast('Failed to save deck', 'error');
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
          {/* Deck Title */}
          <View style={styles.field}>
            <FormLabel text="Deck Title" required />
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g., Izzet Prowess"
                  error={errors.title?.message}
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
                    itemStyle={styles.pickerItem}
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
                  placeholder="Add notes about this deck..."
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Deck'}
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
  pickerItem: {
    color: '#000',
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
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
