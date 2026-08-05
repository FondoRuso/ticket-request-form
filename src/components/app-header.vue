<template>
  <div class="app-header row items-center q-gutter-sm q-mb-md full-width">
    <div class="logo-crop">
      <img src="/logo.svg" alt="Фондо Русо" class="logo-img" />
    </div>
    <div class="app-header__copy">
      <h1 class="app-header__title text-h4 q-ma-none">Заявка на билет</h1>
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
.app-header
  flex-wrap: nowrap

  &__copy
    min-width: 0

  &__title
    white-space: nowrap

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

@media (max-width: 420px)
  .logo-crop
    width: 60px
    height: 56px

  .logo-img
    height: 56px

  .app-header__title
    font-size: clamp(1.5rem, 7.5vw, 1.75rem)
    line-height: 1.2
</style>
