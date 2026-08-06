import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'

import { defineRouter } from '#q-app/wrappers'

import routes from './routes'

function historyFactory() {
  if (process.env.SERVER) return createMemoryHistory
  return process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory
}

export default defineRouter(function () {
  const createHistory = historyFactory()

  return createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })
})
