import autoprefixer from 'autoprefixer'
import type { AcceptedPlugin, ProcessOptions } from 'postcss'

export default {
  plugins: [autoprefixer()],
} satisfies ProcessOptions & { plugins: AcceptedPlugin[] }
