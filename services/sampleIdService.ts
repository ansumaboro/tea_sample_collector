import { generateSampleId, sanitizeDeviceModel } from '@/utils/sampleId';
import { getDeviceInfo } from '@/services/deviceService';

export interface BuildSampleIdParams {
  cloneNumber: string;
  treeNumber: string;
  leafNumber: string;
}

/** Build a unique sample ID using current device model and timestamp. */
export async function buildSampleId(params: BuildSampleIdParams): Promise<string> {
  const device = await getDeviceInfo();
  return generateSampleId({
    cloneNumber: params.cloneNumber,
    treeNumber: params.treeNumber,
    leafNumber: params.leafNumber,
    deviceModel: sanitizeDeviceModel(device.model),
  });
}
