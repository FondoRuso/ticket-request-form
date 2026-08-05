<template>
  <q-select
    ref="select"
    :model-value="modelValue"
    name="match"
    label="Матч"
    :options="matches"
    :loading="loading"
    :option-label="formatMatchLabel"
    autocomplete="off"
    lazy-rules
    :rules="[requiredMatchRule]"
    @update:model-value="$emit('update:modelValue', $event)"
    @popup-show="onPopupShow"
  >
    <template #option="{ opt, itemProps }">
      <q-item v-bind="itemProps">
        <q-item-section>
          <q-item-label v-if="opt.atHome"
            >{{ opt.team }} vs {{ opt.vs }}</q-item-label
          >
          <q-item-label v-else>{{ opt.vs }} vs {{ opt.team }}</q-item-label>
          <q-item-label caption>
            {{ sportEmoji(opt.sport) }} {{ opt.tournament }} ·
            {{ formatMatchDate(opt.date, opt.isDateConfirmed) }}
          </q-item-label>
          <q-item-label
            v-if="!opt.isDateConfirmed"
            caption
            class="app-negative-text"
          >
            Дата и время не подтверждены
          </q-item-label>
          <q-item-label caption>
            {{ opt.stadium ?? 'Площадка не объявлена' }}
            <q-badge
              v-if="opt.atHome"
              color="positive"
              label="Дома"
              class="q-ml-xs"
            />
            <q-badge
              v-else
              color="grey"
              text-color="dark"
              label="Выезд"
              class="q-ml-xs"
            />
            <q-badge
              v-if="opt.isWomen"
              color="grey"
              text-color="dark"
              label="Женщины"
              class="q-ml-xs"
            />
            <q-badge
              v-if="opt.isCantera"
              color="grey"
              text-color="dark"
              label="Кантера"
              class="q-ml-xs"
            />
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>

    <template #no-option>
      <q-item>
        <q-item-section class="app-secondary-text">
          {{
            loading ? 'Загружаем матчи...' : 'Матчей по выбранным фильтрам нет'
          }}
        </q-item-section>
      </q-item>
    </template>

    <template #selected-item="{ opt }">
      <span v-if="opt">
        {{ sportEmoji(opt.sport) }}
        <template v-if="opt.atHome">{{ opt.team }} vs {{ opt.vs }}</template>
        <template v-else>{{ opt.vs }} vs {{ opt.team }}</template>
        ·
        {{ formatMatchDate(opt.date, opt.isDateConfirmed) }}
        <span
          v-if="!opt.isDateConfirmed"
          class="app-negative-text q-ml-xs"
        >
          Дата и время не подтверждены
        </span>
      </span>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import type { QSelect } from 'quasar'
import { formatMatchDate } from 'src/utils/date'
import { requiredMatchRule } from 'src/utils/validation'
import { sportEmoji, type Match } from 'stores/form-store'
import { useMatchesStore } from 'stores/matches-store'
import { useTemplateRef } from 'vue'

const matchesStore = useMatchesStore()

const props = defineProps<{
  modelValue: Match | null
  matches: Match[]
  loading: boolean
  noTeamsSelected: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Match | null]
  openFilters: []
}>()

const select = useTemplateRef<QSelect>('select')

function onPopupShow() {
  if (props.noTeamsSelected) {
    select.value?.hidePopup()
    emit('openFilters')
    return
  }
  matchesStore.refreshMatches()
}

function formatMatchLabel(match: Match): string {
  const label = match.atHome
    ? `${match.team} vs ${match.vs}`
    : `${match.vs} vs ${match.team}`
  return `${label} — ${formatMatchDate(match.date, match.isDateConfirmed)}`
}
</script>
