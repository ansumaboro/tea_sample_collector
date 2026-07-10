import { create } from 'zustand';

import { sampleRepository } from '@/database/sampleRepository';
import type { Sample } from '@/types/sample';

interface SampleStore {
  samples: Sample[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedSampleId: string | null;
  loadSamples: (query?: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  selectSample: (id: string | null) => void;
  refreshSelectedSample: () => Promise<void>;
}

export const useSampleStore = create<SampleStore>((set, get) => ({
  samples: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedSampleId: null,

  loadSamples: async (query?: string) => {
    const searchQuery = query ?? get().searchQuery;
    set({ loading: true, error: null });
    try {
      const samples = searchQuery.trim()
        ? await sampleRepository.search(searchQuery)
        : await sampleRepository.getAll();
      set({ samples, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load samples.';
      set({ error: message, loading: false });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  selectSample: (id: string | null) => {
    set({ selectedSampleId: id });
  },

  refreshSelectedSample: async () => {
    const { selectedSampleId, searchQuery } = get();
    await get().loadSamples(searchQuery);
    if (selectedSampleId) {
      const stillExists = get().samples.some((sample) => sample.id === selectedSampleId);
      if (!stillExists) {
        set({ selectedSampleId: null });
      }
    }
  },
}));
