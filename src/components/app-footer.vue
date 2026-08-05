<template>
  <div
    class="app-secondary-text text-caption q-mt-xl q-mb-md full-width text-center"
  >
    <span aria-hidden="true">Сделано с {{ heartEmoji }} для «Fondo Ruso»</span>
    <span class="app-sr-only">Сделано с любовью для «Fondo Ruso»</span><br />
    Есть проблемы? Пишите
    <a
      href="https://t.me/vovarevenko"
      target="_blank"
      rel="noopener"
      class="app-link"
      >@vovarevenko</a
    >

    <div class="q-mt-sm">
      <a
        href="https://github.com/FondoRuso/ticket-request-form"
        target="_blank"
        rel="noopener"
        class="app-link"
      >
        <q-icon :name="githubIcon" size="1.4em" />
        GitHub
      </a>
      · версия {{ version }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { computed } from 'vue'

const $q = useQuasar()
const version = process.env.APP_VERSION
const heartEmoji = computed(() => ($q.dark.isActive ? '🤍' : '❤️'))
const githubIconFill = computed(() =>
  $q.dark.isActive ? '%23f0f6fc' : '%233b2460',
)
const githubIcon = computed(
  () =>
    'img:data:image/svg+xml,' +
    `%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z' fill='${githubIconFill.value}'/%3E%3C/svg%3E`,
)
</script>
