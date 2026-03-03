<template>
  <div class="text-caption text-grey q-mt-xl q-mb-md full-width text-center">
    Проблемы? Пишите
    <a href="https://t.me/vovarevenko" target="_blank" rel="noopener"
      >@vovarevenko</a
    >
    · v{{ version }}
  </div>
</template>

<script setup lang="ts">
const version = process.env.APP_VERSION;
</script>
