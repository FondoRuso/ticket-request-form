import { defineStore } from '#q-app/wrappers';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

export default defineStore(function () {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  return pinia;
});
