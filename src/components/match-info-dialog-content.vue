<template>
  <q-dialog
    v-model="open"
    :aria-labelledby="dialogTitleId"
  >
    <q-card>
      <q-card-section>
        <h2
          :id="dialogTitleId"
          class="text-h6 q-ma-none"
        >
          О расписании матчей
        </h2>
      </q-card-section>

      <q-card-section class="q-pt-none text-body1">
        <p>Время матчей указано по&nbsp;Мадриду.</p>

        <p>
          Расписание обновляется ежедневно около&nbsp;{{ localTime }}
          по&nbsp;вашему местному времени на&nbsp;основе данных
          <a
            href="https://www.realmadrid.com/es-ES/calendario"
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
          В&nbsp;списке только матчи, билетами на&nbsp;которые занимается клуб.
          На&nbsp;остальные матчи билеты ищите у&nbsp;организатора или покупайте
          на&nbsp;месте.
        </p>

        <p>
          Срок подачи заявки&nbsp;— не&nbsp;позднее
          {{ DEADLINE_DAYS_HOME }}&nbsp;дней до&nbsp;домашнего матча и&nbsp;{{
            DEADLINE_DAYS_AWAY
          }}&nbsp;дней до&nbsp;гостевого.
        </p>
      </q-card-section>

      <q-card-actions
        align="center"
        class="q-pa-md"
      >
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

<script lang="ts">
function madridMidnightInLocalTime(now: Date): string {
  const madridHour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Madrid',
      hour: 'numeric',
      hourCycle: 'h23',
    }).format(now),
  )
  const madridUtcOffsetHours = (madridHour - now.getUTCHours() + 24) % 24
  const updateTime = new Date(now)
  updateTime.setUTCHours(24 - madridUtcOffsetHours, 0, 0, 0)

  return updateTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<script setup lang="ts">
import { useId } from 'vue'

import { DEADLINE_DAYS_AWAY, DEADLINE_DAYS_HOME } from '@/utils/date'

const open = defineModel<boolean>({ required: true })

const dialogTitleId = useId()
const localTime = madridMidnightInLocalTime(new Date())
</script>
