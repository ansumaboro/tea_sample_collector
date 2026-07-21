import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { clearRecords, exportRecordsToFile, getExportCounts } from '@/services/exportService';

export default function ExportScreen() {
  const [recordCount, setRecordCount] = useState(0);
  const [exportableCount, setExportableCount] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadCounts = useCallback(async () => {
    try {
      const counts = await getExportCounts();
      setRecordCount(counts.totalCount);
      setExportableCount(counts.exportableCount);
    } catch {
      setRecordCount(0);
      setExportableCount(0);
    }
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const handleExport = useCallback(async () => {
    if (recordCount === 0) {
      Alert.alert('No records', 'There are no samples to export yet.');
      return;
    }

    if (exportableCount === 0) {
      Alert.alert('No exportable records', 'Only samples with images can be exported.');
      return;
    }

    setExporting(true);
    try {
      const result = await exportRecordsToFile();
      await loadCounts();
      Alert.alert(
        'Export complete',
        `Exported ${result.recordCount} sample(s).\nLeft to export: ${result.skippedCount} sample(s) without images.\n\nFile: ${result.filePath}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed.';
      if (!message.toLowerCase().includes('cancel')) {
        Alert.alert('Export failed', message);
      }
    } finally {
      setExporting(false);
    }
  }, [exportableCount, loadCounts, recordCount]);

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
              setExportableCount(0);

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
            <Text style={styles.statLabel}>Ready to export</Text>
            <Text style={styles.statSubValue}>{exportableCount}</Text>
            <Text style={styles.statLabel}>Left to export</Text>
            <Text style={styles.statSubValue}>{recordCount - exportableCount}</Text>
            <Text style={styles.help}>
              Only samples with images are exported. On Android, you will be asked to choose a
              folder using the system file picker (Storage Access Framework). The CSV file will be
              saved there.
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
  statSubValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  help: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 26,
  },
});
