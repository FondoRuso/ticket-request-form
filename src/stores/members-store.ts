import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Member {
  id: number
  name: string
}

export const useMembersStore = defineStore('members', () => {
  const members = ref<Member[]>([])
  const error = ref<string | null>(null)

  async function fetchMembers() {
    if (members.value.length > 0) return
    error.value = null
    try {
      const response = await fetch('/members.json')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      members.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load members'
    }
  }

  return { members, error, fetchMembers }
})
