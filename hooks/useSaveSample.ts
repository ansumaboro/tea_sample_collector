import { useCallback, useState } from 'react';

import { sampleRepository } from '@/database/sampleRepository';
import { buildSampleId } from '@/services/sampleIdService';
import { getDeviceInfo } from '@/services/deviceService';
import { resolveCoordinates } from '@/services/locationService';
import type { Sample, SampleFormInput } from '@/types/sample';

interface SaveSampleParams extends SampleFormInput {
  images: string[];
}

export function useSaveSample() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveSample = useCallback(async (input: SaveSampleParams): Promise<Sample | null> => {
    setSaving(true);
    setError(null);

    try {
      if (input.images.length === 0) {
        throw new Error('Capture at least one image before saving.');
      }

      const [device, coordinates, sampleId] = await Promise.all([
        getDeviceInfo(),
        resolveCoordinates(),
        buildSampleId({
          cloneNumber: input.cloneNumber,
          treeNumber: input.treeNumber,
          leafNumber: input.leafNumber,
        }),
      ]);

      const sample = await sampleRepository.create({
        ...input,
        id: sampleId,
        gpsLatitude: coordinates?.latitude ?? null,
        gpsLongitude: coordinates?.longitude ?? null,
        deviceManufacturer: device.manufacturer,
        deviceModel: device.model,
        installationId: device.installationId,
        appVersion: device.appVersion,
        wetLabCompleted: input.wetLabCompleted ?? false,
      });

      return sample;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save sample.';
      setError(message);
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  return { saveSample, saving, error };
}
