<template>
  <div class="text-caption text-grey q-mt-xl q-mb-md full-width text-center">
    Сделано с 🤍 для «Fondo Ruso»<br />
    Есть проблемы? Пишите
    <a href="https://t.me/vovarevenko" target="_blank" rel="noopener"
      >@vovarevenko</a
    >, версия {{ version }}
  </div>
</template>

<script setup lang="ts">
const version = process.env.APP_VERSION;
</script>
