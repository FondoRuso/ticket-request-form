<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card>
      <q-card-section>
        <div class="text-h6">О расписании матчей</div>
      </q-card-section>

      <q-card-section class="q-pt-none text-body1">
        <p>Время матчей указано по&nbsp;Мадриду.</p>

        <p>
          Расписание обновляется ежедневно в&nbsp;{{ localTime }} по&nbsp;вашему
          местному времени на&nbsp;основе данных
          <a
            href="https://www.realmadrid.com/es-ES/calendario"
            target="_blank"
            rel="noopener"
            class="app-link app-link--underline"
            >официального сайта</a
          >.
        </p>

        <p>
          Если дата и&nbsp;время матча ещё не&nbsp;подтверждены&nbsp;— проверьте
          завтра. Обычно информация появляется за&nbsp;3–4&nbsp;недели
          до&nbsp;матча.
        </p>

        <p>
          Срок подачи заявки&nbsp;— не&nbsp;позднее 20&nbsp;дней
          до&nbsp;домашнего матча и&nbsp;25&nbsp;дней до&nbsp;гостевого.
        </p>
      </q-card-section>

      <q-card-actions align="center" class="q-pa-md">
        <q-btn
          v-close-popup
          label="Понятно"
          flat
          no-caps
          class="full-width"
          size="lg"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const midnightCET = new Date()
midnightCET.setUTCHours(23, 0, 0, 0) // 00:00 CET = 23:00 UTC

const localTime = midnightCET.toLocaleTimeString([], {
  hour: '2-digit',
  minute: '2-digit',
})
</script>
