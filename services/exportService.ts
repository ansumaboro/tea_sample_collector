import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

import { sampleRepository } from '@/database/sampleRepository';
import { getCsvExportFilename, samplesToCsv } from '@/utils/csv';

export interface ExportResult {
  filePath: string;
  recordCount: number;
}

/** Generate CSV content from all stored samples. */
export async function buildExportCsv(): Promise<{ csv: string; count: number }> {
  const samples = await sampleRepository.getAll();
  return {
    csv: samplesToCsv(samples),
    count: samples.length,
  };
}

/**
 * Export CSV to user-selected directory (Android SAF) or share sheet fallback.
 */
export async function exportRecordsToFile(): Promise<ExportResult> {
  const { csv, count } = await buildExportCsv();
  const filename = getCsvExportFilename();

  if (Platform.OS === 'android') {
    const directory = await Directory.pickDirectoryAsync();
    const file = directory.createFile(filename, 'text/csv');
    file.write(csv);
    return { filePath: file.uri, recordCount: count };
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

  return { filePath: cacheFile.uri, recordCount: count };
}
