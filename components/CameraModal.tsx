import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, usePhotoOutput } from 'react-native-vision-camera';

import { ActionButton } from '@/components/ActionButton';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

export function CameraModal({ visible, onClose, onCapture }: CameraModalProps) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [capturing, setCapturing] = useState(false);
  const device = useCameraDevice('back');
  const photoOutput = usePhotoOutput();

  const handleCapture = async () => {
    if (!device || capturing) return;

    setCapturing(true);
    let photo;
    let image;
    try {
      photo = await photoOutput.capturePhoto(
        { flashMode: 'off', enableShutterSound: false },
        {}
      );
      image = await photo.toImageAsync();
      const tempPngPath = await image.saveToTemporaryFileAsync('png');
      onCapture(tempPngPath);
    } catch (error) {
      console.error('Camera capture failed:', error);
    } finally {
      // Dispose native objects to avoid memory leaks and JPromise issues
      if (photo) {
        try {
          photo.dispose();
        } catch (e) {
          console.warn('Failed to dispose photo:', e);
        }
      }
      if (image) {
        try {
          image.dispose();
        } catch (e) {
          console.warn('Failed to dispose image:', e);
        }
      }
      setCapturing(false);
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {hasPermission && device ? (
          <Camera
            style={styles.camera}
            device={device}
            isActive={visible}
            outputs={[photoOutput]}
          />
        ) : (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionText}>Camera permission is required.</Text>
          </View>
        )}

        <View style={styles.controls}>
          <ActionButton label="Capture Photo" onPress={handleCapture} disabled={capturing} />
          <ActionButton label="Close Camera" onPress={onClose} variant="secondary" />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  permissionText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    textAlign: 'center',
  },
  controls: {
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
  },
});
