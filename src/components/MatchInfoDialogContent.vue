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
        <p>
          Данные о матчах берутся с&nbsp;<a
            href="https://www.realmadrid.com/es-ES/calendario"
            target="_blank"
            rel="noopener"
            >официального сайта</a
          >
          и обновляются автоматически каждый день в {{ localTime }} по вашему
          местному времени.
        </p>

        <p class="q-mb-none">
          Если дата и время матча ещё не подтверждены&nbsp;— попробуйте
          проверить завтра. Обычно, подтверждённая информация появляется
          за&nbsp2-3 недели до&nbsp;матча.
        </p>
      </q-card-section>

      <q-card-section>
        <div class="text-h6">Минимальный срок подачи заявки</div>
        <div class="text-body2">
          в&nbsp;календарных днях до (гостевого / домашнего) матча:
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none text-body1">
        <ul class="q-mt-none q-pl-md">
          <li>первая команда&nbsp;— 20&nbsp;/ 25</li>
          <li>женская команда&nbsp;— 20&nbsp;/ 25</li>
          <li>кантера&nbsp;— 10&nbsp;/ 15</li>
        </ul>

        <q-banner
          class="q-mt-sm q-pa-md"
          rounded
          style="border: 3px dashed var(--q-warning); background: none"
        >
          <template #avatar>
            <q-icon name="warning" color="warning" />
          </template>
          Если до&nbsp;матча осталось меньше указанного срока, он
          <strong>не&nbsp;будет показан в&nbsp;списке</strong>.
        </q-banner>
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
const midnightCET = new Date()
midnightCET.setUTCHours(23, 0, 0, 0) // 00:00 CET = 23:00 UTC

const localTime = midnightCET.toLocaleTimeString([], {
  hour: '2-digit',
  minute: '2-digit',
})
const timeZone = new Intl.DateTimeFormat('ru', { timeZoneName: 'long' })
  .formatToParts(new Date())
  .find(p => p.type === 'timeZoneName')!.value

defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
