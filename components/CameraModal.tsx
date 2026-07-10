import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';

import { ActionButton } from '@/components/ActionButton';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

export function CameraModal({ visible, onClose, onCapture }: CameraModalProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });
      if (photo?.uri) {
        onCapture(photo.uri);
      }
    } catch (error) {
      console.error('Camera capture failed:', error);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
        {permission?.granted ? (
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        ) : (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionText}>Camera permission is required.</Text>
          </View>
        )}

        <View style={styles.controls}>
          <ActionButton label="Capture Photo" onPress={handleCapture} disabled={capturing} />
          <ActionButton label="Close Camera" onPress={onClose} variant="secondary" />
        </View>
      </View>
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
