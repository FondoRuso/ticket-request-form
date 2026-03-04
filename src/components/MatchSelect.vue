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
  >
    <template #option="{ opt, itemProps }">
      <q-item v-bind="itemProps">
        <q-item-section>
          <q-item-label>{{ opt.team }} vs {{ opt.vs }}</q-item-label>
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
            <q-badge v-else color="grey" label="В гостях" class="q-ml-xs" />
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
        {{ opt.team }} vs {{ opt.vs }} &middot;
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

defineProps<{
  modelValue: Match | null
  matches: Match[]
  loading: boolean
}>()

defineEmits<{
  'update:modelValue': [value: Match | null]
}>()

function formatMatchLabel(match: Match): string {
  return `${match.team} vs ${match.vs} — ${formatMatchDate(match.date, match.isDateConfirmed)}`
}
</script>
