import * as Location from 'expo-location';

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

/** Request permission and read current GPS coordinates. */
export async function getCurrentCoordinates(): Promise<GpsCoordinates | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch (error) {
    console.warn('Failed to get GPS coordinates:', error);
    return null;
  }
}

/** Best-effort last known location when fresh fix is unavailable. */
export async function getLastKnownCoordinates(): Promise<GpsCoordinates | null> {
  try {
    const position = await Location.getLastKnownPositionAsync();
    if (!position) return null;
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return null;
  }
}

/** Try current position first, then fall back to last known. */
export async function resolveCoordinates(): Promise<GpsCoordinates | null> {
  const current = await getCurrentCoordinates();
  if (current) return current;
  return getLastKnownCoordinates();
}
