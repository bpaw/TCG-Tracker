import React, { useEffect, useMemo } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useDeckStore } from '../stores/deckStore';
import { useUiStore } from '../stores/uiStore';
import { FormLabel, FormInput } from '../components/FormControls';
import { deckSchema, DeckFormData, gameTitles } from '../validation/schemas';
import { useTheme } from '../hooks/useTheme';
import { Title, Body, Caption } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { handleSubscriptionError } from '../utils/subscriptionErrors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Edit Deck'>;
type EditDeckRouteProp = RouteProp<RootStackParamList, 'Edit Deck'>;

export default function EditDeckScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditDeckRouteProp>();

  const { deckId } = route.params || {};
  const { getDeck, createDeck, updateDeck } = useDeckStore();
  const { showToast } = useUiStore();

  const isEditing = !!deckId;
  const existingDeck = isEditing ? getDeck(deckId) : null;

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
    picker: {
      backgroundColor: colors.surface[100],
      borderWidth: 1,
      borderColor: colors.surface[300],
      borderRadius: spacing.sm,
      overflow: 'hidden',
    },
    pickerInput: {
      color: colors.text.primary,
    },
    pickerItem: {
      color: colors.text.primary,
      fontSize: 16,
    },
    errorText: {
      color: colors.brand.coral,
      marginTop: spacing.xs,
    },
    footer: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
      borderTopWidth: 1,
      borderTopColor: colors.surface[300],
      backgroundColor: colors.surface[100],
    },
  }), [colors, spacing]);

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
      handleSubscriptionError(error, navigation, showToast, 'Failed to save deck');
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
                <View style={styles.picker}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={styles.pickerInput}
                    itemStyle={styles.pickerItem}
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
      <View style={styles.footer}>
        <Button
          title={isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Deck'}
          intent="primary"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
