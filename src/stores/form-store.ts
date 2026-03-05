import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Member } from './members-store'

export interface Match {
  type: string
  team: string
  vs: string
  tournament: string
  stadium: string
  atHome: boolean
  isWomen: boolean
  isCantera: boolean
  date: string
  isDateConfirmed: boolean
}

export interface PersonalData {
  firstName: string
  lastName: string
  birthDate: string
  documentNumber: string
}

export const TICKET_CATEGORIES = [
  'Нижний ряд ближе к угловому флагу',
  'Центр самый верх',
  'Третий или четвёртый ярус за воротами',
]

export const useFormStore = defineStore(
  'ticket-form',
  () => {
    const member = ref<Member | null>(null)
    const phone = ref('')
    const telegram = ref('')
    const email = ref('')
    const showAway = ref(true)
    const showWomen = ref(true)
    const showCantera = ref(true)
    const ticketCategory = ref<string | null>(null)
    const personalData = ref<PersonalData>({
      firstName: '',
      lastName: '',
      birthDate: '',
      documentNumber: '',
    })

    // Not persisted
    const selectedMatch = ref<Match | null>(null)
    const submitted = ref(false)

    function getSubmitData() {
      const isAway = selectedMatch.value && !selectedMatch.value.atHome
      return {
        memberId: member.value?.id ?? null,
        memberName: member.value?.name ?? '',
        phone: phone.value,
        telegram: telegram.value,
        email: email.value,
        match: selectedMatch.value,
        ticketCategory: ticketCategory.value,
        personalData: isAway ? { ...personalData.value } : null,
      }
    }

    function resetForm() {
      ticketCategory.value = null
      selectedMatch.value = null
      submitted.value = false
    }

    return {
      member,
      phone,
      telegram,
      email,
      showAway,
      showWomen,
      showCantera,
      ticketCategory,
      personalData,
      selectedMatch,
      submitted,
      getSubmitData,
      resetForm,
    }
  },
  {
    persist: {
      paths: [
        'member',
        'phone',
        'telegram',
        'email',
        'personalData',
        'showAway',
        'showWomen',
        'showCantera',
      ],
    },
  },
)
