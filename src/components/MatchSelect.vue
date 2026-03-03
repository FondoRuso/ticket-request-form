<template>
  <q-select
    :model-value="modelValue"
    label="Матч"
    outlined
    :options="matches"
    :loading="loading"
    :option-label="formatMatchLabel"
    lazy-rules
    :rules="[(val: Match | null) => val !== null || 'Обязательное поле']"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #option="{ opt, itemProps }">
      <q-item v-bind="itemProps">
        <q-item-section>
          <q-item-label>{{ opt.team }} vs {{ opt.vs }}</q-item-label>
          <q-item-label caption>
            {{ opt.tournament }} &middot;
            {{ formatDate(opt.date, opt.isDateConfirmed) }}
          </q-item-label>
          <q-item-label v-if="!opt.isDateConfirmed" caption class="text-negative">
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
        {{ formatDate(opt.date, opt.isDateConfirmed) }}
        <span v-if="!opt.isDateConfirmed" class="text-negative q-ml-xs">
          Дата и время не подтверждены
        </span>
      </span>
    </template>
  </q-select>
</template>

<script setup lang="ts">
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
  return `${match.team} vs ${match.vs} — ${formatDate(match.date, match.isDateConfirmed)}`
}

function formatDate(dateStr: string, isConfirmed: boolean): string {
  const date = new Date(dateStr)

  if (!isConfirmed) {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return date.toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
