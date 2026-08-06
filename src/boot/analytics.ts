import { initAnalytics } from 'src/utils/analytics'

import { defineBoot } from '#q-app/wrappers'

export default defineBoot(({ router }) => {
  initAnalytics(router)
})
