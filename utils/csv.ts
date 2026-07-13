import type { Sample } from '@/types/sample';

const CSV_COLUMNS = [
  'sample_id',
  'clone_number',
  'tree_number',
  'leaf_number',
  'leaf_position',
  'meter_taken',
  'wet_lab_required',
  'wet_lab_completed',
  'gps_latitude',
  'gps_longitude',
  'device_model',
  'device_manufacturer',
  'installation_id',
  'app_version',
  'image_count',
  'image_paths',
  'created_at',
  'updated_at',
  'notes',
] as const;

function escapeCsvValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function sampleToRow(sample: Sample): string[] {
  return [
    sample.id,
    sample.cloneNumber,
    sample.treeNumber,
    sample.leafNumber,
    sample.leafPosition,
    sample.meterTaken,
    sample.wetLabRequired,
    sample.wetLabCompleted,
    sample.gpsLatitude,
    sample.gpsLongitude,
    sample.deviceModel,
    sample.deviceManufacturer,
    sample.installationId,
    sample.appVersion,
    sample.images.length,
    sample.images.join('|'),
    sample.createdAt,
    sample.updatedAt,
    sample.notes,
  ].map(escapeCsvValue);
}

/** Convert samples array to CSV string with header row. */
export function samplesToCsv(samples: Sample[]): string {
  const header = CSV_COLUMNS.join(',');
  const rows = samples.map((sample) => sampleToRow(sample).join(','));
  return [header, ...rows].join('\n');
}

export function getCsvExportFilename(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const stamp = `${date.getFullYear()}_${pad(date.getMonth() + 1)}_${pad(date.getDate())}`;
  return `tea_dataset_export_${stamp}.csv`;
}
