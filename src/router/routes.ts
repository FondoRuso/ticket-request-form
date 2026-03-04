import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/main-layout.vue'),
    children: [{ path: '', component: () => import('pages/index-page.vue') }],
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/',
  },
]

export default routes
