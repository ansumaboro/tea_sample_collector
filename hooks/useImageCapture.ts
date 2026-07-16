import { useCameraPermissions } from 'expo-camera';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

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
  const [permission, requestPermission] = useCameraPermissions();
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [showCamera, setShowCamera] = useState(false);


  const openCamera = useCallback(async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Camera permission', 'Camera access is required to capture leaf images.');
        return;
      }
    }

    setShowCamera(true);
  }, [permission, requestPermission]);

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
