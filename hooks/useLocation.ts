import { useCallback, useState } from 'react';

import { resolveCoordinates } from '@/services/locationService';
import type { GpsCoordinates } from '@/services/locationService';

export function useLocationCapture() {
  const [coordinates, setCoordinates] = useState<GpsCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const coords = await resolveCoordinates();
      if (!coords) {
        setError('GPS unavailable. Sample will be saved without coordinates.');
      }
      setCoordinates(coords);
      return coords;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to read GPS.';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    coordinates,
    loading,
    error,
    captureLocation,
    setCoordinates,
  };
}
