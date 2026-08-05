import { boot } from 'quasar/wrappers'
import { initAnalytics } from 'src/utils/analytics'

export default boot(({ router }) => {
  initAnalytics(router)
})
