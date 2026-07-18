import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
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

import { useImageCapture } from '@/hooks/useImageCapture';
import { useLocationCapture } from '@/hooks/useLocation';
import { useSaveSample } from '@/hooks/useSaveSample';

import { useDeviceStore } from '@/store/deviceStore';

import type { SampleFormInput } from '@/types/sample';

import { toIsoTimestamp } from '@/utils/dateFormat';
import {
  generateSampleId,
  sanitizeDeviceModel,
} from '@/utils/sampleId';

import { validateSample } from '@/utils/sampleValidation';

export default function AddSampleScreen() {
  const deviceInfo = useDeviceStore((state) => state.deviceInfo);

  const { saveSample, saving, error } = useSaveSample();

  const {
    coordinates,
    captureLocation,
    loading: gpsLoading,
  } = useLocationCapture();

  const [now] = useState(() => new Date());

  const {
    control,
    handleSubmit,
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
    resetImages,
  } = useImageCapture({
    cloneNumber,
    treeNumber,
    leafNumber,
    installationId: deviceInfo?.installationId,
  });

  useEffect(() => {
    captureLocation();
  }, [captureLocation]);

  const sampleIdPreview = useMemo(() => {
    if (!deviceInfo) return '';

    return generateSampleId({
      installationId: deviceInfo.installationId,
      deviceModel: sanitizeDeviceModel(deviceInfo.model),
      timestamp: now,
    });
  }, [deviceInfo, now]);

  const onSubmit = handleSubmit(async (values) => {

    const validation = validateSample(values);

    if (!validation.valid) {
      Alert.alert(
        'Validation Error',
        validation.message,
      );
      return;
    }

    const sample = await saveSample({
      ...values,
      images: images.map((image) => image.filePath ?? image.uri),
    });

    if (!sample) return;

    Alert.alert(
      'Sample Saved',
      `Sample ID: ${sample.id}`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ],
    );

    resetImages();
  });

  useEffect(() => {
    if (!error) return;

    Alert.alert('Save Failed', error);
  }, [error]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <ScreenHeader
          title="Add Sample"
          subtitle="Capture images and enter sample details"
        />

        <View style={styles.sections}>
          <SectionCard title="Images">
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

          {deviceInfo && (
            <SectionCard title="Automatic Information">
              <AutoInfoPanel
                sampleIdPreview={sampleIdPreview}
                timestamp={toIsoTimestamp(now)}
                latitude={coordinates?.latitude ?? null}
                longitude={coordinates?.longitude ?? null}
                deviceManufacturer={deviceInfo.manufacturer}
                deviceModel={deviceInfo.model}
                installationId={deviceInfo.installationId}
                appVersion={deviceInfo.appVersion}
              />
            </SectionCard>
          )}

          {gpsLoading && (
            <Text style={styles.helper}>
              Reading GPS...
            </Text>
          )}

          <View style={styles.actions}>
            <ActionButton
              label={saving ? 'Saving...' : 'Save Sample'}
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