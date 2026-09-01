import { defineBoot } from '#q-app'
import { initAnalytics } from '@/utils/analytics'

export default defineBoot(({ router }) => {
  initAnalytics(router)
})
