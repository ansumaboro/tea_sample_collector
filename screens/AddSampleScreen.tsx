import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { AutoInfoPanel } from '@/components/AutoInfoPanel';
import { CameraModal } from '@/components/CameraModal';
import { CheckboxRow } from '@/components/CheckboxRow';
import { DropdownField } from '@/components/DropdownField';
import { FormField } from '@/components/FormField';
import { ImageThumbnailList } from '@/components/ImageThumbnailList';
import { ScreenHeader } from '@/components/ScreenHeader';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { useImageCapture } from '@/hooks/useImageCapture';
import { useLocationCapture } from '@/hooks/useLocation';
import { useSaveSample } from '@/hooks/useSaveSample';
import { useDeviceStore } from '@/store/deviceStore';
import type { SampleFormInput } from '@/types/sample';
import { toIsoTimestamp } from '@/utils/dateFormat';
import { buildSamplePrefix, generateSampleId, sanitizeDeviceModel } from '@/utils/sampleId';

export function AddSampleScreen() {
  const deviceInfo = useDeviceStore((state) => state.deviceInfo);
  const { saveSample, saving, error } = useSaveSample();
  const { coordinates, captureLocation, loading: gpsLoading } = useLocationCapture();
  const [now] = useState(() => new Date());

  const leafOptions = [
    { label: '1st Leaf', value: '1st_leaf' },
    { label: '2nd Leaf', value: '2nd_leaf' },
    { label: '3rd Leaf', value: '3rd_leaf' },
    { label: '4th Leaf', value: '4th_leaf' },
    { label: '5th Leaf', value: '5th_leaf' },
    { label: 'Maintenance Leaf', value: 'maintenance_leaf' },
  ];

  const {
    control,
    handleSubmit,
    watch,
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
    resetImages,
  } = useImageCapture({ cloneNumber, treeNumber, leafNumber });

  useEffect(() => {
    captureLocation();
  }, [captureLocation]);

  const sampleIdPreview = useMemo(() => {
    const prefix = buildSamplePrefix({ cloneNumber, treeNumber, leafNumber });
    if (!prefix || !deviceInfo) return '';
    return generateSampleId({
      cloneNumber,
      treeNumber,
      leafNumber,
      deviceModel: sanitizeDeviceModel(deviceInfo.model),
      timestamp: now,
    });
  }, [cloneNumber, deviceInfo, leafNumber, now, treeNumber]);

  const onSubmit = handleSubmit(async (values) => {
    const sample = await saveSample({
      ...values,
      images: images.map((image) => image.filePath ?? image.uri),
    });

    if (sample) {
      Alert.alert('Sample saved', `ID: ${sample.id}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
      resetImages();
    }
  });

  useEffect(() => {
    if (error) {
      Alert.alert('Save failed', error);
    }
  }, [error]);

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Add Sample" subtitle="Capture images and enter sample details" />

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
            label="Leaf Number"
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

      {deviceInfo ? (
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
      ) : null}

      {gpsLoading ? <Text style={styles.helper}>Reading GPS...</Text> : null}

      <View style={styles.actions}>
        <ActionButton label={saving ? 'Saving...' : 'Save Sample'} onPress={onSubmit} disabled={saving} />
        <ActionButton label="Back" onPress={() => router.back()} variant="secondary" />
      </View>

      <CameraModal
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCapture}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
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
  helper: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
});
