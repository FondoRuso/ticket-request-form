<template>
  <div class="row items-center q-gutter-sm q-mb-md full-width">
    <div class="logo-crop">
      <img src="/logo.svg" alt="Фондо Русо" class="logo-img" />
    </div>
    <div>
      <div class="text-h4">Заявка на билет</div>
      <a
        href="https://fondoruso.ru"
        target="_blank"
        rel="noopener"
        class="text-subtitle1 site-link"
        >FondoRuso<span class="site-link__tld">.ru</span></a
      >
    </div>
  </div>
</template>

<style scoped lang="sass">
.logo-crop
  width: 68px
  height: 64px
  overflow: hidden
  flex-shrink: 0

.logo-img
  height: 64px

.site-link
  text-decoration: none
  color: $dark
  font-weight: 700
  letter-spacing: -0.02em

  .body--dark &
    color: $grey-4

  &__tld
    font-weight: 400
</style>
