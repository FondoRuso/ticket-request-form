import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { defineStore } from '#q-app'

export default defineStore(function () {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  return pinia
})
