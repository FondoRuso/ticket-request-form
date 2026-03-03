import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Match } from './form-store';

export const useMatchesStore = defineStore('matches', () => {
  const matches = ref<Match[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchMatches() {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch('/data.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      matches.value = await response.json();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load matches';
    } finally {
      loading.value = false;
    }
  }

  return { matches, loading, error, fetchMatches };
});
