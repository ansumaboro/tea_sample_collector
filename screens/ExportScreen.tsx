import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { sampleRepository } from '@/database/sampleRepository';
import { clearRecords, exportRecordsToFile } from '@/services/exportService';

export function ExportScreen() {
  const [recordCount, setRecordCount] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    sampleRepository.count().then(setRecordCount).catch(() => setRecordCount(0));
  }, []);

  const handleExport = useCallback(async () => {
    if (recordCount === 0) {
      Alert.alert('No records', 'There are no samples to export yet.');
      return;
    }

    setExporting(true);
    try {
      const result = await exportRecordsToFile();
      Alert.alert(
        'Export complete',
        `Exported ${result.recordCount} record(s).\n\nFile: ${result.filePath}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed.';
      if (!message.toLowerCase().includes('cancel')) {
        Alert.alert('Export failed', message);
      }
    } finally {
      setExporting(false);
    }
  }, [recordCount]);

  const handleClear = useCallback(() => {
    Alert.alert(
      'Clear Records',
      'This will permanently delete all samples and stored images. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);

            try {
              await clearRecords();

              setRecordCount(0);

              Alert.alert(
                'Records Cleared',
                'All sample records have been deleted.'
              );
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Failed to clear records.';
              Alert.alert('Error', message);
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.page}>
        <View style={styles.container}>
          <ScreenHeader title="Export Records" subtitle="Generate CSV from local database" />

          <View style={styles.card}>
            <Text style={styles.statLabel}>Total samples</Text>
            <Text style={styles.statValue}>{recordCount}</Text>
            <Text style={styles.help}>
              On Android, you will be asked to choose a folder using the system file picker (Storage
              Access Framework). The CSV file will be saved there.
            </Text>
          </View>

          <ActionButton
            label={exporting ? 'Exporting...' : 'Export Records'}
            onPress={handleExport}
            disabled={exporting}
          />
          <ActionButton
            label={clearing ? 'Clearing...' : 'Clear Records'}
            onPress={handleClear}
            disabled={exporting || clearing}
            variant="danger"
          />
          <ActionButton label="Back" onPress={() => router.back()} variant="secondary" />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  card: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  statLabel: {
    fontSize: FONT_SIZES.label,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  help: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 26,
  },
});
