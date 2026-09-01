import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { emailRule, requiredRule } from '@/utils/validation'

import type { Member } from './members-store'

export type Sport = 'football' | 'basketball'

const SPORT_EMOJI: Record<Sport, string> = {
  football: '⚽',
  basketball: '🏀',
}

export const sportEmoji = (sport: Sport) => SPORT_EMOJI[sport]

export interface Match {
  type: string
  sport: Sport
  team: string
  vs: string
  tournament: string
  stadium: string | null
  atHome: boolean
  isWomen: boolean
  isCantera: boolean
  canRequestTickets: boolean
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

export interface TeamFilter {
  sport: Sport
  isWomen: boolean
  team: string
  hiddenByDefault?: boolean
}

const teamKey = (sport: Sport, team: string, isWomen: boolean) =>
  `${sport}:${team}:${String(isWomen)}`

export const matchTeamKey = (match: Match) =>
  teamKey(match.sport, match.team, match.isWomen)

export const teamFilterKey = (filter: TeamFilter) =>
  teamKey(filter.sport, filter.team, filter.isWomen)

export const TEAM_FILTERS: TeamFilter[] = [
  { sport: 'football', isWomen: false, team: 'Real Madrid' },
  { sport: 'football', isWomen: false, team: 'Real Madrid Castilla' },
  {
    sport: 'football',
    isWomen: false,
    team: 'Real Madrid C',
    hiddenByDefault: true,
  },
  {
    sport: 'football',
    isWomen: false,
    team: 'Juvenil A',
    hiddenByDefault: true,
  },
  { sport: 'football', isWomen: true, team: 'Real Madrid' },
  {
    sport: 'football',
    isWomen: true,
    team: 'Real Madrid B femenino',
    hiddenByDefault: true,
  },
  { sport: 'basketball', isWomen: false, team: 'Real Madrid' },
]

const ALL_TEAM_KEYS = TEAM_FILTERS.map(teamFilterKey)

const isBlank = (value: string) => requiredRule(value) !== true

const DEFAULT_EXCLUDED_TEAMS = TEAM_FILTERS.filter(t => t.hiddenByDefault).map(
  teamFilterKey,
)

export const useFormStore = defineStore(
  'ticket-form',
  () => {
    const member = ref<Member | null>(null)
    const phone = ref('')
    const telegram = ref('')
    const email = ref('')
    // Save what is hidden, otherwise a new club team would not appear for those
    // who have already visited
    const excludedTeams = ref<string[]>([...DEFAULT_EXCLUDED_TEAMS])
    const selectedTeams = computed({
      get: () => ALL_TEAM_KEYS.filter(k => !excludedTeams.value.includes(k)),
      set: keys => {
        excludedTeams.value = ALL_TEAM_KEYS.filter(k => !keys.includes(k))
      },
    })
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

    const isTicketCategoryApplicable = computed(() => {
      const m = selectedMatch.value
      return (
        m !== null &&
        m.sport === 'football' &&
        !m.isWomen &&
        !m.isCantera &&
        m.atHome
      )
    })

    const isPersonalDataApplicable = computed(
      () => selectedMatch.value !== null && !selectedMatch.value.atHome,
    )

    // Mirrors the form's validation rules, so a rejected submit can be reported
    // as field names without touching the values themselves.
    const missingRequiredFields = computed(() => {
      const missing: string[] = []
      if (member.value === null) missing.push('member')
      if (isBlank(phone.value)) missing.push('phone')
      if (emailRule(email.value) !== true) missing.push('email')
      if (selectedMatch.value === null) missing.push('match')
      if (isPersonalDataApplicable.value) {
        const data = personalData.value
        if (isBlank(data.firstName)) missing.push('firstName')
        if (isBlank(data.lastName)) missing.push('lastName')
        if (isBlank(data.birthDate)) missing.push('birthDate')
        if (isBlank(data.documentNumber)) missing.push('documentNumber')
      }
      return missing
    })

    function getSubmitData() {
      return {
        memberId: member.value?.id ?? null,
        memberName: member.value?.name ?? '',
        phone: phone.value,
        telegram: telegram.value,
        email: email.value,
        match: selectedMatch.value,
        ticketCategory: isTicketCategoryApplicable.value
          ? ticketCategory.value
          : null,
        personalData: isPersonalDataApplicable.value
          ? { ...personalData.value }
          : null,
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
      excludedTeams,
      selectedTeams,
      ticketCategory,
      personalData,
      selectedMatch,
      submitted,
      isTicketCategoryApplicable,
      isPersonalDataApplicable,
      missingRequiredFields,
      getSubmitData,
      resetForm,
    }
  },
  {
    persist: {
      pick: [
        'member',
        'phone',
        'telegram',
        'email',
        'personalData',
        'excludedTeams',
      ],
    },
  },
)
