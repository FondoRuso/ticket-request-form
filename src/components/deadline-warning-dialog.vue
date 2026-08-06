<template>
  <q-dialog
    :model-value="modelValue"
    :aria-labelledby="dialogTitleId"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card>
      <q-card-section>
        <h2
          :id="dialogTitleId"
          class="text-h6 q-ma-none"
        >
          Срок подачи заявки
        </h2>
      </q-card-section>

      <q-card-section class="q-pt-none text-body1">
        Дней до матча: {{ daysLeft }}. Рекомендуемый срок подачи заявки
        на&nbsp;{{ where }} матч&nbsp;— не&nbsp;позднее
        {{ deadlineDays }}&nbsp;дней.
      </q-card-section>

      <q-card-actions
        align="right"
        class="q-pa-md"
      >
        <q-btn
          flat
          no-caps
          label="Всё равно отправить"
          @click="$emit('confirm')"
        />
        <q-btn
          outline
          no-caps
          label="Отмена"
          @click="$emit('cancel')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { DEADLINE_DAYS_AWAY, DEADLINE_DAYS_HOME } from 'src/utils/date'
import type { Match } from 'stores/form-store'
import { computed, useId } from 'vue'

const props = defineProps<{
  modelValue: boolean
  match: Match | null
  daysLeft: number
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const dialogTitleId = useId()
const deadlineDays = computed(() =>
  props.match?.atHome ? DEADLINE_DAYS_HOME : DEADLINE_DAYS_AWAY,
)

const where = computed(() => (props.match?.atHome ? 'домашний' : 'гостевой'))
</script>
