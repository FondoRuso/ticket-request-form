import { defineStore } from 'pinia'
import { ref } from 'vue'
import { track } from 'src/utils/analytics'
import { getCetDate } from 'src/utils/date'
import type { Match } from './form-store'

export const useMatchesStore = defineStore('matches', () => {
  const matches = ref<Match[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let lastFetchDate: string | null = null

  async function fetchMatches() {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${process.env.DATA_BASE_URL}/matches.json`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      matches.value = await response.json()
      lastFetchDate = getCetDate()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load matches'
      track('matches_load_failed', { reason: error.value })
    } finally {
      loading.value = false
    }
  }

  async function refreshMatches() {
    if (getCetDate() === lastFetchDate) return
    try {
      const response = await fetch(`${process.env.DATA_BASE_URL}/matches.json`)
      if (!response.ok) return
      matches.value = await response.json()
      lastFetchDate = getCetDate()
    } catch {
      // silently ignore — user keeps existing data
    }
  }

  return { matches, loading, error, fetchMatches, refreshMatches }
})
