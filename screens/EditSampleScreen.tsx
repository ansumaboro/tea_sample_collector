import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';

import { ActionButton } from '@/components/ActionButton';
import { AutoInfoPanel } from '@/components/AutoInfoPanel';
import { CameraModal } from '@/components/CameraModal';
import { ImageThumbnailList } from '@/components/ImageThumbnailList';
import { SampleFields } from '@/components/SampleFields';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionCard } from '@/components/SectionCard';

import {
  COLORS,
  FONT_SIZES,
  LAYOUT,
  SPACING,
} from '@/constants/theme';

import { sampleRepository } from '@/database/sampleRepository';

import { useImageCapture } from '@/hooks/useImageCapture';

import type {
  Sample,
  SampleFormInput,
} from '@/types/sample';

import { validateSample } from '@/utils/sampleValidation';

export default function EditSampleScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [sample, setSample] = useState<Sample | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
  } = useForm<SampleFormInput>({
    defaultValues: {
      cloneNumber: '',
      treeNumber: '',
      leafNumber: '',

      leafPosition: '3rd_leaf',

      meterReading1: '',
      meterReading2: '',
      meterReading3: '',

      wetLabRequired: false,
      wetLabCompleted: false,

      flush: 'first_flush',
      flushAutoDetected: false,

      gardenName: '',
      sectionName: '',

      wilting: false,
      chlorosis: false,
      scorching: false,
      pestDamage: false,
      disease: false,

      remarks: '',
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
    installationId: sample?.installationId,
  });

  useEffect(() => {
    async function loadSample() {
      if (!id) return;

      try {
        const loaded = await sampleRepository.getById(id);

        if (!loaded) {
          Alert.alert('Error', 'Sample not found.');
          router.back();
          return;
        }

        setSample(loaded);

        reset({
          cloneNumber: loaded.cloneNumber,
          treeNumber: loaded.treeNumber,
          leafNumber: loaded.leafNumber,

          leafPosition: loaded.leafPosition,

          meterReading1: loaded.meterReading1.toString(),
          meterReading2: loaded.meterReading2.toString(),
          meterReading3: loaded.meterReading3.toString(),

          wetLabRequired: loaded.wetLabRequired,
          wetLabCompleted: loaded.wetLabCompleted,

          flush: loaded.flush,
          flushAutoDetected: loaded.flushAutoDetected,

          gardenName: loaded.gardenName,
          sectionName: loaded.sectionName,

          wilting: loaded.wilting,
          chlorosis: loaded.chlorosis,
          scorching: loaded.scorching,
          pestDamage: loaded.pestDamage,
          disease: loaded.disease,

          remarks: loaded.remarks,
        });

        setExistingImages(loaded.images);
      } catch {
        Alert.alert('Error', 'Failed to load sample.');
        router.back();
      } finally {
        setLoading(false);
      }
    }

    loadSample();
  }, [id, reset, setExistingImages]);

  const onSubmit = handleSubmit(async (values) => {
    if (!sample) return;

    const validation = validateSample(values);

    if (!validation.valid) {
      Alert.alert(
        'Validation Error',
        validation.message,
      );
      return;
    }


    try {
      setSaving(true);

      await sampleRepository.update(sample.id, {
        ...values,

        meterReading1: Number(values.meterReading1),
        meterReading2: Number(values.meterReading2),
        meterReading3: Number(values.meterReading3),

        images: images.map(
          (image) => image.filePath ?? image.uri,
        ),
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
      Alert.alert(
        'Update Failed',
        err instanceof Error
          ? err.message
          : 'Failed to update sample.',
      );
    } finally {
      setSaving(false);
    }
  });

  if (loading) {
    return (
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

        <Text
          style={{
            marginTop: SPACING.md,
          }}
        >
          Loading sample...
        </Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <ScreenHeader
          title="Edit Sample"
          subtitle="Update an existing sample"
        />

        <View style={styles.sections}>
          <SectionCard title="Leaf Images (Optional)">
            <ActionButton
              label="Capture Images"
              onPress={openCamera}
            />

            <ImageThumbnailList
              images={images.map((image) => image.uri)}
              onRemove={removeImage}
            />
          </SectionCard>

          <SampleFields control={control} />

          {sample && (
            <SectionCard title="Automatic Information">
              <AutoInfoPanel
                sampleIdPreview={sample.id}
                timestamp={sample.createdAt}
                latitude={sample.gpsLatitude}
                longitude={sample.gpsLongitude}
                deviceManufacturer={sample.deviceManufacturer}
                deviceModel={sample.deviceModel}
                installationId={sample.installationId}
                appVersion={sample.appVersion}
              />
            </SectionCard>
          )}

          <View style={styles.actions}>
            <ActionButton
              label={
                saving
                  ? 'Updating...'
                  : 'Update Sample'
              }
              onPress={onSubmit}
              disabled={saving}
            />

            <ActionButton
              label="Back"
              variant="secondary"
              onPress={() => router.back()}
            />
          </View>
        </View>
      </ScrollView>

      <CameraModal
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCapture}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },

  sections: {
    gap: LAYOUT.sectionGap,
  },

  actions: {
    gap: SPACING.md,
  },

  helper: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

