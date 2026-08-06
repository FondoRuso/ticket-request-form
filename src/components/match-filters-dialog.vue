<template>
  <q-dialog
    v-model="open"
    :aria-labelledby="`${uid}-title`"
    @hide="onHide"
  >
    <q-card>
      <q-card-section>
        <h2
          :id="`${uid}-title`"
          class="text-h6 q-ma-none"
        >
          Какие матчи показывать
        </h2>
      </q-card-section>

      <q-card-section class="q-pt-none column items-start">
        <q-checkbox
          v-model="allTeams"
          label="Все"
          dense
          class="q-py-xs"
        />

        <div
          v-for="group in TEAM_GROUPS"
          :key="group.slug"
          role="group"
          :aria-labelledby="`${uid}-${group.slug}`"
          class="column items-start"
        >
          <div
            :id="`${uid}-${group.slug}`"
            class="app-secondary-text text-subtitle2 q-mt-md q-mb-xs"
          >
            {{ group.title }}
          </div>
          <q-checkbox
            v-for="team in group.teams"
            :key="team.key"
            v-model="selectedTeams"
            :val="team.key"
            :label="team.label"
            dense
            class="q-py-xs"
          />
        </div>
      </q-card-section>

      <q-card-actions
        align="center"
        class="q-pa-md"
      >
        <q-btn
          label="Готово"
          flat
          no-caps
          class="full-width"
          size="lg"
          @click="complete"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import {
  sportEmoji,
  TEAM_FILTERS,
  teamFilterKey,
  type Sport,
} from 'stores/form-store'

interface TeamGroup {
  slug: string
  title: string
  teams: { key: string; label: string }[]
}

const SPORT_TITLES: Record<Sport, { men: string; women: string }> = {
  football: { men: 'Футбол', women: 'Женский футбол' },
  basketball: { men: 'Баскетбол', women: 'Женский баскетбол' },
}

const TEAM_GROUPS: TeamGroup[] = (Object.keys(SPORT_TITLES) as Sport[])
  .flatMap(sport =>
    [false, true].map(isWomen => ({
      slug: `${sport}-${isWomen ? 'women' : 'men'}`,
      title: `${sportEmoji(sport)} ${isWomen ? SPORT_TITLES[sport].women : SPORT_TITLES[sport].men}`,
      teams: TEAM_FILTERS.filter(
        t => t.sport === sport && t.isWomen === isWomen,
      ).map(t => ({ key: teamFilterKey(t), label: t.team })),
    })),
  )
  .filter(group => group.teams.length > 0)

const ALL_TEAM_KEYS = TEAM_FILTERS.map(teamFilterKey)
</script>

<script setup lang="ts">
import { computed, useId } from 'vue'

const open = defineModel<boolean>({ required: true })
const selectedTeams = defineModel<string[]>('selectedTeams', { required: true })

const emit = defineEmits<{
  closed: [completed: boolean]
}>()

const uid = useId()
let completed = false

const allTeams = computed({
  get: () => ALL_TEAM_KEYS.every(key => selectedTeams.value.includes(key)),
  set: value => {
    selectedTeams.value = value ? [...ALL_TEAM_KEYS] : []
  },
})

function complete() {
  completed = true
  open.value = false
}

function onHide() {
  emit('closed', completed)
  completed = false
}
</script>
