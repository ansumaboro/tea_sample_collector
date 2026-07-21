import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { sampleRepository } from '@/database/sampleRepository';
import { getCsvExportFilename, samplesToCsv } from '@/utils/csv';

export interface ExportResult {
  filePath: string;
  recordCount: number;
  skippedCount: number;
  totalCount: number;
}

async function getExportableSamples() {
  const samples = await sampleRepository.getAll();
  return samples.filter((sample) => sample.images.length > 0);
}

async function getExportData() {
  const samples = await sampleRepository.getAll();
  const exportableSamples = samples.filter((sample) => sample.images.length > 0);

  return {
    totalCount: samples.length,
    exportableSamples,
    exportableCount: exportableSamples.length,
    skippedCount: samples.length - exportableSamples.length,
  };
}

export async function getExportCounts(): Promise<{
  totalCount: number;
  exportableCount: number;
  skippedCount: number;
}> {
  const { totalCount, exportableCount, skippedCount } = await getExportData();

  return {
    totalCount,
    exportableCount,
    skippedCount,
  };
}

/** Generate CSV content from stored samples that have images. */
export async function buildExportCsv(): Promise<{ csv: string; count: number; skippedCount: number }> {
  const { exportableSamples, skippedCount } = await getExportData();

  return {
    csv: samplesToCsv(exportableSamples),
    count: exportableSamples.length,
    skippedCount,
  };
}

export async function exportImages(directory: Directory) {
  const samples = await getExportableSamples();

  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const stamp = `${date.getFullYear()}_${pad(date.getMonth() + 1)}_${pad(date.getDate())}`;
  const imageDirectory = directory.createDirectory(`sample_images_${stamp}`);

  for (const sample of samples) {
    for (const imageUri of sample.images) {
      try {
        const sourceFile = new File(imageUri);
        const bytes = await sourceFile.bytes();
        const fileName = imageUri.split('/').pop() || 'none.png';

        const destinationFile = imageDirectory.createFile(fileName, 'image/png');
        destinationFile.write(bytes);
      } catch (error) {
        console.warn(
          `Failed to export image ${imageUri}`,
          error
        );
      }
    }
  }
}

/**
 * Export CSV to user-selected directory (Android SAF) or share sheet fallback.
 */
export async function exportRecordsToFile(): Promise<ExportResult> {
  const { csv, count, skippedCount } = await buildExportCsv();
  const filename = getCsvExportFilename();

  if (Platform.OS === 'android') {
    const directory = await Directory.pickDirectoryAsync();
    const file = directory.createFile(filename, 'text/csv');
    file.write(csv);

    await exportImages(directory);
    return {
      filePath: file.uri,
      recordCount: count,
      skippedCount,
      totalCount: count + skippedCount,
    };
  }

  const cacheFile = new File(Paths.cache, filename);
  cacheFile.write(csv);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(cacheFile.uri, {
      mimeType: 'text/csv',
      dialogTitle: 'Save tea dataset export',
    });
  }

  return {
    filePath: cacheFile.uri,
    recordCount: count,
    skippedCount,
    totalCount: count + skippedCount,
  };
}

export async function clearRecords() {
  await sampleRepository.clear();

  const imageDirectory = new Directory(
    Paths.document,
    'sample_images'
  );

  if (imageDirectory.exists) {
    imageDirectory.delete();
  }
}
