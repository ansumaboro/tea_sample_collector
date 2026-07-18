import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useCameraPermission } from 'react-native-vision-camera';

import { saveSampleImage } from '@/services/imageService';

export interface CapturedImage {
  uri: string;
  filePath?: string;
}

interface UseImageCaptureOptions {
  cloneNumber: string;
  treeNumber: string;
  leafNumber: string;
  installationId?: string;
}

export function useImageCapture(options: UseImageCaptureOptions) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const openCamera = useCallback(async () => {
    if (!hasPermission) {
      await requestPermission();
      if (!hasPermission) {
        Alert.alert('Camera permission', 'Camera access is required to capture leaf images.');
        return;
      }
    }

    setShowCamera(true);
  }, [hasPermission, requestPermission]);

  const handleCapture = useCallback(
    (tempUri: string) => {
      const nextIndex = images.length + 1;
      if (!options.installationId) {
        return;
      }

      const filePath = saveSampleImage({
        tempUri,
        installationId: options.installationId,
        imageIndex: nextIndex,
      });

      // console.log('Returned path:', filePath);

      setImages((current) => [...current, { uri: filePath, filePath }]);
      // console.log('Current images:', images);
      setShowCamera(false);
    },
    [images.length, options.installationId],
  );

  const removeImage = useCallback((index: number) => {
    setImages((current) => current.filter((_, i) => i !== index));
  }, []);

  const setExistingImages = useCallback((paths: string[]) => {
    setImages(paths.map((path) => ({ uri: path, filePath: path })));
  }, []);

  const resetImages = useCallback(() => {
    setImages([]);
  }, []);

  return {
    images,
    showCamera,
    setShowCamera,
    openCamera,
    handleCapture,
    removeImage,
    setExistingImages,
    resetImages,
  };
}
