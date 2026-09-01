import { defineStore } from 'pinia'
import { ref } from 'vue'

import { track } from '@/utils/analytics'
import { getCetDate } from '@/utils/date'

export interface Member {
  id: number
  name: string
}

export const useMembersStore = defineStore('members', () => {
  const members = ref<Member[]>([])
  const error = ref<string | null>(null)
  let lastFetchDate: string | null = null

  async function fetchMembers() {
    if (members.value.length > 0) {
      if (getCetDate() !== lastFetchDate) void refreshMembers()
      return
    }
    error.value = null
    try {
      const response = await fetch(
        `${import.meta.env.DATA_BASE_URL}/members.json`,
      )
      if (!response.ok) throw new Error(`HTTP ${String(response.status)}`)
      members.value = await response.json()
      lastFetchDate = getCetDate()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load members'
      track('members_load_failed', { reason: error.value })
    }
  }

  async function refreshMembers() {
    try {
      const response = await fetch(
        `${import.meta.env.DATA_BASE_URL}/members.json`,
      )
      if (!response.ok) return
      members.value = await response.json()
      lastFetchDate = getCetDate()
    } catch {
      // silently ignore
    }
  }

  return { members, error, fetchMembers }
})
