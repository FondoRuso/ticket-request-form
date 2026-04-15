<template>
  <q-select
    :model-value="modelValue"
    label="Матч"
    :options="matches"
    :loading="loading"
    :option-label="formatMatchLabel"
    lazy-rules
    :rules="[requiredMatchRule]"
    @update:model-value="$emit('update:modelValue', $event)"
    @popup-show="matchesStore.refreshMatches()"
  >
    <template #option="{ opt, itemProps }">
      <q-item v-bind="itemProps">
        <q-item-section>
          <q-item-label v-if="opt.atHome"
            >{{ opt.team }} vs {{ opt.vs }}</q-item-label
          >
          <q-item-label v-else>{{ opt.vs }} vs {{ opt.team }}</q-item-label>
          <q-item-label caption>
            {{ opt.tournament }} &middot;
            {{ formatMatchDate(opt.date, opt.isDateConfirmed) }}
          </q-item-label>
          <q-item-label
            v-if="!opt.isDateConfirmed"
            caption
            class="text-negative"
          >
            Дата и время не подтверждены
          </q-item-label>
          <q-item-label caption>
            {{ opt.stadium }}
            <q-badge
              v-if="opt.atHome"
              color="positive"
              label="Дома"
              class="q-ml-xs"
            />
            <q-badge v-else color="grey" label="Выезд" class="q-ml-xs" />
            <q-badge
              v-if="opt.isWomen"
              color="grey"
              label="Женщины"
              class="q-ml-xs"
            />
            <q-badge
              v-if="opt.isCantera"
              color="grey"
              label="Кантера"
              class="q-ml-xs"
            />
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>

    <template #selected-item="{ opt }">
      <span v-if="opt">
        <template v-if="opt.atHome">{{ opt.team }} vs {{ opt.vs }}</template>
        <template v-else>{{ opt.vs }} vs {{ opt.team }}</template>
        &middot;
        {{ formatMatchDate(opt.date, opt.isDateConfirmed) }}
        <span v-if="!opt.isDateConfirmed" class="text-negative q-ml-xs">
          Дата и время не подтверждены
        </span>
      </span>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { formatMatchDate } from 'src/utils/date'
import { requiredMatchRule } from 'src/utils/validation'
import type { Match } from 'stores/form-store'
import { useMatchesStore } from 'stores/matches-store'

const matchesStore = useMatchesStore()

defineProps<{
  modelValue: Match | null
  matches: Match[]
  loading: boolean
}>()

defineEmits<{
  'update:modelValue': [value: Match | null]
}>()

function formatMatchLabel(match: Match): string {
  const label = match.atHome
    ? `${match.team} vs ${match.vs}`
    : `${match.vs} vs ${match.team}`
  return `${label} — ${formatMatchDate(match.date, match.isDateConfirmed)}`
}
</script>
