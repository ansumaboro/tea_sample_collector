import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { leafOptions } from '@/constants/leafOptions'
import { ActionButton } from '@/components/ActionButton';
import { CameraModal } from '@/components/CameraModal';
import { CheckboxRow } from '@/components/CheckboxRow';
import { DropdownField } from '@/components/DropdownField';
import { FormField } from '@/components/FormField';
import { ImageThumbnailList } from '@/components/ImageThumbnailList';
import { ScreenHeader } from '@/components/ScreenHeader';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { useImageCapture } from '@/hooks/useImageCapture';
import type { SampleFormInput } from '@/types/sample';
import { sampleRepository } from '@/database/sampleRepository';
import { ActivityIndicator } from "react-native";

export function EditSampleScreen() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SampleFormInput>({
    defaultValues: {
      cloneNumber: '',
      treeNumber: '',
      leafNumber: '',
      leafPosition: '',
      meterTaken: false,
      wetLabRequired: false,
      wetLabCompleted: false,
      notes: '',
    },
  });

  const cloneNumber = watch('cloneNumber');
  const treeNumber = watch('treeNumber');
  const leafNumber = watch('leafNumber');

  const {
    images,
    showCamera,
    setShowCamera,
    openCamera,
    handleCapture,
    removeImage,
    setExistingImages,
  } = useImageCapture({
    cloneNumber,
    treeNumber,
    leafNumber,
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!id) {
      Alert.alert('Error', 'Invalid sample ID.');
      return;
    }

    try {
      setSaving(true);

      await sampleRepository.update(id, {
        ...values,
        images: images.map((image) => image.filePath ?? image.uri),
      });

      Alert.alert(
        'Success',
        'Sample updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to update sample.';

      Alert.alert('Update Failed', message);
    } finally {
      setSaving(false);
    }
  });

  useEffect(() => {
    async function loadSample() {
      if (!id) return;

      try {
        const sample = await sampleRepository.getById(id);

        if (!sample) {
          Alert.alert('Error', 'Sample not found.');
          router.back();
          return;
        }

        reset({
          cloneNumber: sample.cloneNumber,
          treeNumber: sample.treeNumber,
          leafNumber: sample.leafNumber,
          leafPosition: sample.leafPosition,
          meterTaken: sample.meterTaken,
          wetLabRequired: sample.wetLabRequired,
          wetLabCompleted: sample.wetLabCompleted,
          notes: sample.notes,
        });

        setExistingImages(sample.images);
      } catch (err) {
        Alert.alert('Error', 'Failed to load sample.');
        router.back();
      } finally {
        setLoading(false);
      }
    }

    loadSample();
  }, [id, reset, setExistingImages]);

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={{ marginTop: SPACING.md }}>
            Loading sample...
          </Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ScreenHeader title="Edit Sample" subtitle="Update an existing sample" />

          <Text style={styles.sectionTitle}>Image Section</Text>
          <ActionButton label="Capture Images" onPress={openCamera} />
          <ImageThumbnailList
            images={images.map((image) => image.uri)}
            onRemove={removeImage}
          />

          <Text style={styles.sectionTitle}>Sample Information</Text>
          <Controller
            control={control}
            name="cloneNumber"
            rules={{ required: 'Clone number is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="Clone Number"
                placeholder="e.g. V1 or TV1"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.cloneNumber?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="treeNumber"
            rules={{ required: 'Tree number is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="Tree Number"
                placeholder="e.g. 12"
                keyboardType="number-pad"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.treeNumber?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="leafNumber"
            rules={{ required: 'Leaf number is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="Leaf Number"
                placeholder="e.g. 3"
                keyboardType="number-pad"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.leafNumber?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="leafPosition"
            rules={{ required: 'Leaf position is required' }}
            render={({ field: { onChange, value } }) => (
              <DropdownField
                label="Leaf Position"
                placeholder="Select leaf position"
                value={value}
                onValueChange={onChange}
                options={leafOptions}
                error={errors.leafPosition?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="meterTaken"
            render={({ field: { value, onChange } }) => (
              <CheckboxRow label="Meter Reading Taken?" value={value} onValueChange={onChange} />
            )}
          />
          <Controller
            control={control}
            name="wetLabRequired"
            render={({ field: { value, onChange } }) => (
              <CheckboxRow label="Wet Lab Required?" value={value} onValueChange={onChange} />
            )}
          />
          <Controller
            control={control}
            name="wetLabCompleted"
            render={({ field: { value, onChange } }) => (
              <CheckboxRow
                label="Wet Lab Completed?"
                value={value}
                onValueChange={onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="Notes (optional)"
                placeholder="Additional observations"
                multiline
                numberOfLines={3}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                style={styles.notesInput}
              />
            )}
          />

          <View style={styles.actions}>
            <ActionButton label={saving ? 'Saving...' : 'Save Changes'} onPress={onSubmit} disabled={saving} />
            <ActionButton label="Back" onPress={() => router.back()} variant="secondary" />
          </View>

          <CameraModal
            visible={showCamera}
            onClose={() => setShowCamera(false)}
            onCapture={handleCapture}
          />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.background,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  notesInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  actions: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
});
