<template>
  <q-page class="q-pa-md">
    <div class="column items-center q-gutter-md page-content">
      <!-- SUCCESS STATE -->
      <template v-if="formStore.submitted">
        <div class="full-width column items-center q-mt-xl q-pt-xl">
          <h1
            ref="successHeading"
            tabindex="-1"
            class="text-h5 q-mt-none q-mb-lg"
          >
            Спасибо за заявку
          </h1>
          <a
            :href="requestsViewUrl"
            class="app-link app-link--underline q-mb-lg"
            @click="track('request_status_opened')"
          >
            Отследить статус заявки
          </a>
          <q-btn
            label="Отправить ещё одну"
            color="primary"
            text-color="white"
            no-caps
            @click="handleNewRequest"
          />
        </div>
      </template>

      <!-- FORM STATE -->
      <template v-else>
        <AppHeader />

        <div class="text-body1 q-mb-sm full-width">
          Одна заявка — один билет. Билеты ТОЛЬКО для членов фан-клуба.
        </div>

        <q-form
          ref="formRef"
          class="full-width column q-gutter-y-sm"
          greedy
          @submit.prevent="onSubmit"
          @validation-error="onValidationError"
        >
          <q-select
            v-model="formStore.member"
            name="member"
            label="Выберите себя из списка"
            :options="memberOptions"
            option-label="name"
            option-value="id"
            use-input
            input-debounce="300"
            fill-input
            hide-selected
            autocomplete="off"
            lazy-rules
            :rules="[requiredRule]"
            @filter="filterMembers"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="app-secondary-text">
                  Нет результатов
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input
            v-model="formStore.phone"
            name="phone"
            label="Номер телефона для связи"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            enterkeyhint="next"
            debounce="500"
            lazy-rules
            :rules="[requiredRule]"
          />

          <q-input
            v-model="formStore.telegram"
            name="telegram"
            label="Ник в Telegram"
            autocomplete="off"
            autocapitalize="none"
            enterkeyhint="next"
            spellcheck="false"
            debounce="500"
            lazy-rules
            class="q-mb-md"
          />

          <q-input
            v-model="formStore.email"
            name="email"
            label="Электропочта"
            type="email"
            inputmode="email"
            autocomplete="email"
            autocapitalize="none"
            enterkeyhint="next"
            spellcheck="false"
            hint="Внимательно проверяй почту, туда будут приходить оповещения по статусу заявки"
            debounce="500"
            lazy-rules
            :rules="[requiredRule, emailRule]"
          />

          <div class="row items-center q-mt-lg">
            <button
              type="button"
              class="app-link app-link--dotted app-link-button app-touch-target"
              @click="openMatchInfo"
            >
              Как это работает?
            </button>

            <q-space />

            <button
              type="button"
              class="app-link-button app-touch-target row items-center cursor-pointer"
              @click="openFilters('link')"
            >
              <span class="app-link app-link--dotted">Фильтры</span>
              <span class="app-secondary-text q-ml-xs">
                ·
                {{ formStore.selectedTeams.length }}/{{ TEAM_FILTERS.length }}
              </span>
            </button>
          </div>

          <div
            class="app-sr-only"
            aria-live="polite"
            aria-atomic="true"
            v-text="matchesStore.loading ? 'Загружаем список матчей…' : ''"
          />

          <q-banner
            v-if="matchesStore.error"
            class="text-white bg-negative q-mt-sm"
            rounded
          >
            Не удалось загрузить матчи: {{ matchesStore.error }}
            <template #action>
              <q-btn
                flat
                label="Повторить"
                @click="reloadMatches"
              />
            </template>
          </q-banner>

          <MatchSelect
            ref="matchSelect"
            v-model="formStore.selectedMatch"
            :matches="filteredMatches"
            :loading="matchesStore.loading"
            :no-teams-selected="formStore.selectedTeams.length === 0"
            @open-filters="openFilters('match_field')"
          />

          <div
            class="app-sr-only"
            aria-live="polite"
            aria-atomic="true"
            v-text="personalDataAnnouncement"
          />

          <q-select
            v-if="formStore.isTicketCategoryApplicable"
            v-model="formStore.ticketCategory"
            name="ticketCategory"
            label="Категория билета"
            :options="TICKET_CATEGORIES"
            emit-value
            map-options
            clearable
            hint="Мы можем выразить желание на одну из доступных категорий, но клуб может решить по-своему"
          />

          <PersonalDataBlock
            v-if="formStore.isPersonalDataApplicable"
            v-model="formStore.personalData"
            class="q-mt-lg"
          />

          <q-btn
            label="Отправить заявку"
            type="submit"
            class="q-mt-xl full-width"
            color="primary"
            text-color="white"
            size="lg"
            no-caps
            :loading="isSubmitting"
            :disable="isSubmitting"
          />
        </q-form>

        <AppFooter />

        <MatchInfoDialogContent v-model="showMatchInfo" />

        <MatchFiltersDialog
          v-model="showFilters"
          v-model:selected-teams="formStore.selectedTeams"
          @closed="onFiltersClosed"
        />

        <DeadlineWarningDialog
          v-model="showDeadlineWarning"
          :match="formStore.selectedMatch"
          :days-left="deadlineDaysLeft"
          @confirm="onDeadlineConfirm"
          @cancel="onDeadlineCancel"
        />
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import AppFooter from 'components/app-footer.vue'
import AppHeader from 'components/app-header.vue'
import DeadlineWarningDialog from 'components/deadline-warning-dialog.vue'
import MatchFiltersDialog from 'components/match-filters-dialog.vue'
import MatchInfoDialogContent from 'components/match-info-dialog-content.vue'
import MatchSelect from 'components/match-select.vue'
import PersonalDataBlock from 'components/personal-data-block.vue'
import type { QForm } from 'quasar'
import { useQuasar } from 'quasar'
import { matchProperties, track } from 'src/utils/analytics'
import {
  daysUntilMatch,
  DEADLINE_DAYS_AWAY,
  DEADLINE_DAYS_HOME,
} from 'src/utils/date'
import { emailRule, requiredRule } from 'src/utils/validation'
import {
  matchTeamKey,
  TEAM_FILTERS,
  TICKET_CATEGORIES,
  useFormStore,
} from 'stores/form-store'
import { useMatchesStore } from 'stores/matches-store'
import { type Member, useMembersStore } from 'stores/members-store'
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'

type FiltersSource = 'link' | 'match_field'

const $q = useQuasar()
const requestsViewUrl = process.env.NOCODB_REQUESTS_VIEW_URL

function formatDateForApi(dateStr: string): string {
  const date = new Date(dateStr)
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`
}

const formStore = useFormStore()
const matchesStore = useMatchesStore()
const membersStore = useMembersStore()
const formRef = ref<QForm | null>(null)
const successHeading = useTemplateRef<HTMLHeadingElement>('successHeading')
const matchSelect =
  useTemplateRef<InstanceType<typeof MatchSelect>>('matchSelect')
const isSubmitting = ref(false)
const showMatchInfo = ref(false)
const showFilters = ref(false)
const showDeadlineWarning = ref(false)
const deadlineDaysLeft = ref(0)
const memberOptions = ref<Member[]>([])
let deadlineResolve: ((confirmed: boolean) => void) | null = null
let filtersSource: FiltersSource | null = null

async function filterMembers(val: string, update: (fn: () => void) => void) {
  await membersStore.fetchMembers()
  update(() => {
    const needle = val.toLowerCase()
    memberOptions.value = !val
      ? membersStore.members
      : membersStore.members.filter(m => m.name.toLowerCase().includes(needle))
  })
}

const filteredMatches = computed(() =>
  matchesStore.matches.filter(
    m =>
      m.canRequestTickets && !formStore.excludedTeams.includes(matchTeamKey(m)),
  ),
)

const isFirstTeam = computed(() => {
  const m = formStore.selectedMatch
  return m !== null && m.sport === 'football' && !m.isWomen && !m.isCantera
})

function isPastDeadline(): boolean {
  const m = formStore.selectedMatch
  if (!m || !isFirstTeam.value) return false
  const deadlineDays = m.atHome ? DEADLINE_DAYS_HOME : DEADLINE_DAYS_AWAY
  const days = daysUntilMatch(m.date)
  if (days >= deadlineDays) return false
  deadlineDaysLeft.value = Math.max(0, days)
  track('deadline_warning_shown', {
    atHome: m.atHome,
    daysLeft: deadlineDaysLeft.value,
    deadlineDays,
  })
  return true
}

function confirmDeadline(): Promise<boolean> {
  return new Promise(resolve => {
    deadlineResolve = resolve
    showDeadlineWarning.value = true
  })
}

function resolveDeadline(confirmed: boolean) {
  track('deadline_warning_resolved', {
    confirmed,
    atHome: formStore.selectedMatch?.atHome ?? false,
    daysLeft: deadlineDaysLeft.value,
  })
  showDeadlineWarning.value = false
  deadlineResolve?.(confirmed)
  deadlineResolve = null
}

function onDeadlineConfirm() {
  resolveDeadline(true)
}

function onDeadlineCancel() {
  resolveDeadline(false)
}

// QForm only emits `submit` once validation passes, so a rejected attempt is
// only observable here.
function onValidationError() {
  track('request_incomplete', {
    missingFields: formStore.missingRequiredFields.join(),
  })
}

async function onSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  if (isPastDeadline()) {
    const confirmed = await confirmDeadline()
    if (!confirmed) return
  }

  isSubmitting.value = true

  const data = formStore.getSubmitData()
  const match = data.match

  let sport = data.match?.sport ?? ''
  if (data.match?.sport) {
    switch (data.match.sport) {
      case 'football':
        sport = 'Футбол'
        break
      case 'basketball':
        sport = 'Баскетбол'
        break
    }
  }

  // NocoDB's date column rejects an empty string, so an unfilled birth date has
  // to go out as an explicit null.
  const birthDate = data.personalData?.birthDate ?? ''

  const record = {
    'Имя': data.memberName,
    'Дата матча': match?.date ? formatDateForApi(match.date) : null,
    'Спорт': sport,
    'Команда': match?.team ?? '',
    'Соперник': match?.vs ?? '',
    'Где?': match?.atHome ? 'Дома' : 'Выезд',
    'Категория билета': data.ticketCategory ?? '',
    'Турнир': match?.tournament ?? '',
    'Тип': match?.type ?? '',
    'Телефон': data.phone,
    'Телеграм': data.telegram,
    'Электропочта': data.email,
    'Имя лат.': data.personalData?.firstName ?? '',
    'Фамилия лат.': data.personalData?.lastName ?? '',
    'Дата рождения': birthDate === '' ? null : birthDate,
    '№ документа': data.personalData?.documentNumber ?? '',
    'Raw': JSON.stringify(data),
  }

  let status = 0

  try {
    const res = await fetch(
      `${process.env.NOCODB_API_URL}/api/v2/public/shared-view/${process.env.NOCODB_REQUESTS_FORM_PUBLIC_UUID}/rows`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: record }),
      },
    )
    status = res.status
    if (!res.ok) throw new Error(`${String(res.status)} ${res.statusText}`)
    formStore.submitted = true
    if (match) {
      track('request_submitted', {
        ...matchProperties(match),
        ticketCategory: data.ticketCategory ?? '',
        withPersonalData: data.personalData !== null,
        withTelegram: data.telegram.trim().length > 0,
      })
    }
    await nextTick()
    successHeading.value?.focus()
  } catch (err) {
    track('request_failed', { status })
    $q.notify({
      type: 'negative',
      message: 'Не удалось отправить заявку. Попробуйте ещё раз.',
    })
    console.error('Submit error:', err)
  } finally {
    isSubmitting.value = false
  }
}

function openMatchInfo() {
  track('match_info_opened')
  showMatchInfo.value = true
}

function openFilters(source: FiltersSource) {
  filtersSource = source
  track('match_filters_opened', { source })
  showFilters.value = true
}

function onFiltersClosed(completed: boolean) {
  const shouldOpenMatch =
    completed &&
    filtersSource === 'match_field' &&
    formStore.selectedTeams.length > 0

  filtersSource = null

  if (shouldOpenMatch) matchSelect.value?.showPopup()
}

function reloadMatches() {
  track('matches_reload_requested')
  void matchesStore.fetchMatches()
}

function handleNewRequest() {
  track('new_request_started')
  formStore.resetForm()
}

watch(
  () => [
    formStore.member,
    formStore.phone,
    formStore.telegram,
    formStore.email,
    formStore.selectedMatch,
    formStore.ticketCategory,
    formStore.personalData,
  ],
  () => {
    track('form_started')
  },
  { deep: true, once: true },
)

watch(
  () => formStore.selectedMatch,
  match => {
    if (match) track('match_selected', matchProperties(match))
  },
)

watch(
  () => formStore.ticketCategory,
  category => {
    if (category) track('ticket_category_selected', { category })
  },
)

// Picking an away match reveals four more required fields. Moving focus into
// them would land past the block's heading and instructions, which a screen
// reader then never reads, so announce the block instead and leave focus where
// the user put it. The live region has to sit outside the block's `v-if` —
// a region inserted together with its text is not reliably announced.
const personalDataAnnouncement = ref('')
watch(
  () => formStore.isPersonalDataApplicable,
  applicable => {
    personalDataAnnouncement.value = applicable
      ? 'Для выездного матча ниже добавлены поля с персональными данными.'
      : ''
  },
)

// Checkboxes fire per click, so report the net result once the dialog closes.
let teamsBeforeFilters = ''
watch(showFilters, open => {
  const teams = formStore.selectedTeams.join()
  if (open) {
    teamsBeforeFilters = teams
    return
  }
  if (teams === teamsBeforeFilters) return
  track('match_filters_changed', {
    selectedTeams: formStore.selectedTeams.length,
    totalTeams: TEAM_FILTERS.length,
  })
})

onMounted(() => {
  void matchesStore.fetchMatches()
})
</script>

<style scoped lang="sass">
.page-content
  max-width: 600px
  margin: 0 auto

.info-link
  text-decoration: underline dotted
  font-size: 13px
</style>
