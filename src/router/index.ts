import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'

import { defineRouter } from '#q-app'

import routes from './routes'

function historyFactory() {
  if (import.meta.env.QUASAR_SERVER) return createMemoryHistory
  return import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory
}

export default defineRouter(function () {
  const createHistory = historyFactory()

  return createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  })
})
