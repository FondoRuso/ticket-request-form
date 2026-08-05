<template>
  <q-page class="q-pa-md">
    <div class="column items-center q-gutter-md page-content">
      <!-- SUCCESS STATE -->
      <template v-if="formStore.submitted">
        <div class="full-width column items-center q-mt-xl q-pt-xl">
          <div class="text-h5 q-mb-lg">Спасибо за заявку</div>
          <a
            :href="requestsViewUrl"
            target="_blank"
            class="app-link app-link--underline q-mb-lg"
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
        >
          <q-select
            v-model="formStore.member"
            label="Выберите себя из списка"
            :options="memberOptions"
            option-label="name"
            option-value="id"
            use-input
            input-debounce="300"
            fill-input
            hide-selected
            lazy-rules
            :rules="[requiredRule]"
            @filter="filterMembers"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Нет результатов
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input
            v-model="formStore.phone"
            label="Номер телефона для связи"
            debounce="500"
            lazy-rules
            :rules="[requiredRule]"
          />

          <q-input
            v-model="formStore.telegram"
            label="Ник в Telegram"
            debounce="500"
            lazy-rules
            class="q-mb-md"
          />

          <q-input
            v-model="formStore.email"
            label="Электропочта"
            type="email"
            hint="Внимательно проверяй почту, туда будут приходить оповещения по статусу заявки"
            debounce="500"
            lazy-rules
            :rules="[requiredRule, emailRule]"
          />

          <div class="row items-center q-mt-lg">
            <a class="app-link app-link--dotted" @click="showMatchInfo = true">
              Как это работает?
            </a>

            <q-space />

            <span
              class="row items-center cursor-pointer"
              @click="showFilters = true"
            >
              <a class="app-link app-link--dotted">Фильтры</a>
              <span class="q-ml-xs text-grey">
                ·
                {{ formStore.selectedTeams.length }}/{{ TEAM_FILTERS.length }}
              </span>
            </span>
          </div>

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
                @click="matchesStore.fetchMatches()"
              />
            </template>
          </q-banner>

          <MatchSelect
            v-model="formStore.selectedMatch"
            :matches="filteredMatches"
            :loading="matchesStore.loading"
            :no-teams-selected="formStore.selectedTeams.length === 0"
            @open-filters="showFilters = true"
          />

          <q-select
            v-if="showTicketCategory"
            v-model="formStore.ticketCategory"
            label="Категория билета"
            :options="TICKET_CATEGORIES"
            emit-value
            map-options
            clearable
            hint="Мы можем выразить желание на одну из доступных категорий, но клуб может решить по-своему"
          />

          <PersonalDataBlock
            v-if="showPersonalData"
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
import { DEADLINE_DAYS_AWAY, DEADLINE_DAYS_HOME } from 'src/utils/date'
import { emailRule, requiredRule } from 'src/utils/validation'
import {
  matchTeamKey,
  TEAM_FILTERS,
  TICKET_CATEGORIES,
  useFormStore,
} from 'stores/form-store'
import { useMatchesStore } from 'stores/matches-store'
import { useMembersStore, type Member } from 'stores/members-store'
import { computed, onMounted, ref } from 'vue'

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
  const get = (type: string) => parts.find(p => p.type === type)!.value
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`
}

const formStore = useFormStore()
const matchesStore = useMatchesStore()
const membersStore = useMembersStore()
const formRef = ref<QForm | null>(null)
const isSubmitting = ref(false)
const showMatchInfo = ref(false)
const showFilters = ref(false)
const showDeadlineWarning = ref(false)
const deadlineDaysLeft = ref(0)
const memberOptions = ref<Member[]>([])
let deadlineResolve: ((confirmed: boolean) => void) | null = null

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

const showTicketCategory = computed(
  () => isFirstTeam.value && formStore.selectedMatch!.atHome,
)

const showPersonalData = computed(
  () => formStore.selectedMatch !== null && !formStore.selectedMatch.atHome,
)

function isPastDeadline(): boolean {
  const m = formStore.selectedMatch
  if (!m || !isFirstTeam.value) return false
  const deadlineDays = m.atHome ? DEADLINE_DAYS_HOME : DEADLINE_DAYS_AWAY
  const msLeft = new Date(m.date).getTime() - Date.now()
  const days = Math.floor(msLeft / (1000 * 60 * 60 * 24))
  if (days >= deadlineDays) return false
  deadlineDaysLeft.value = Math.max(0, days)
  return true
}

function confirmDeadline(): Promise<boolean> {
  return new Promise(resolve => {
    deadlineResolve = resolve
    showDeadlineWarning.value = true
  })
}

function onDeadlineConfirm() {
  showDeadlineWarning.value = false
  deadlineResolve?.(true)
  deadlineResolve = null
}

function onDeadlineCancel() {
  showDeadlineWarning.value = false
  deadlineResolve?.(false)
  deadlineResolve = null
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

  const record = {
    Имя: data.memberName,
    'Дата матча': match?.date ? formatDateForApi(match.date) : null,
    Спорт: sport,
    Команда: match?.team ?? '',
    Соперник: match?.vs ?? '',
    'Где?': match?.atHome ? 'Дома' : 'Выезд',
    'Категория билета': data.ticketCategory ?? '',
    Турнир: match?.tournament ?? '',
    Тип: match?.type ?? '',
    Телефон: data.phone,
    Телеграм: data.telegram,
    Электропочта: data.email,
    'Имя лат.': data.personalData?.firstName ?? '',
    'Фамилия лат.': data.personalData?.lastName ?? '',
    'Дата рождения': data.personalData?.birthDate || null,
    '№ документа': data.personalData?.documentNumber ?? '',
    Raw: JSON.stringify(data),
  }

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
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    formStore.submitted = true
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Не удалось отправить заявку. Попробуйте ещё раз.',
    })
    console.error('Submit error:', err)
  } finally {
    isSubmitting.value = false
  }
}

function handleNewRequest() {
  formStore.resetForm()
}

onMounted(() => {
  matchesStore.fetchMatches()
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
