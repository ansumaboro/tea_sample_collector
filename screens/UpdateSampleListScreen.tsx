import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { DropdownField } from '@/components/DropdownField';
import { SampleListItem } from '@/components/SampleListItem';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';

import {
  COLORS,
  FONT_SIZES,
  SPACING,
} from '@/constants/theme';

import { useSampleStore } from '@/store/sampleStore';
import type { SampleSearchField } from '@/types/sample';

const searchOptions = [
  { label: 'All Fields', value: 'all' },
  { label: 'Sample ID', value: 'id' },
  { label: 'Clone Number', value: 'clone_number' },
  { label: 'Tree Number', value: 'tree_number' },
  { label: 'Leaf Number', value: 'leaf_number' },
  { label: 'Leaf Position', value: 'leaf_position' },
  { label: 'Notes', value: 'notes' },
];

export function UpdateSampleListScreen() {
  const {
    samples,
    loading,
    searchQuery,
    searchField,
    loadSamples,
    setSearchQuery,
    setSearchField,
  } = useSampleStore();

  useEffect(() => {
    loadSamples();
  }, [loadSamples]);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      loadSamples(text, searchField);
    },
    [loadSamples, searchField, setSearchQuery],
  );

  const handleSearchFieldChange = useCallback(
    (field: string) => {
      const value = field as SampleSearchField;

      setSearchField(value);

      loadSamples(searchQuery, value);
    },
    [loadSamples, searchQuery, setSearchField],
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.page}>
        <View style={styles.container}>
          <ScreenHeader
            title="Update Sample"
            subtitle="Search existing records"
          />

          <DropdownField
            label="Search By"
            value={searchField}
            onValueChange={handleSearchFieldChange}
            options={searchOptions}
          />

          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
          />

          <Text style={styles.resultTitle}>
            Results
          </Text>

          <FlatList
            data={samples}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              loading ? (
                <Text style={styles.empty}>
                  Loading samples...
                </Text>
              ) : (
                <Text style={styles.empty}>
                  No samples found.
                </Text>
              )
            }
            renderItem={({ item }) => (
              <SampleListItem
                sample={item}
                onPress={() =>
                  router.push({
                    pathname: '/update-sample/[id]',
                    params: {
                      id: item.id,
                    },
                  })
                }
              />
            )}
          />

          <ActionButton
            label="Back"
            variant="secondary"
            onPress={() => router.back()}
            style={styles.back}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },

  resultTitle: {
    fontSize: FONT_SIZES.label,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: SPACING.md,
  },

  empty: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SPACING.md,
  },

  back: {
    marginTop: SPACING.md,
  },
});