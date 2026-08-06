import {
  defineConfigOxlintQuasar,
  type OxlintAddon,
} from '@govnotech/conventions/oxlint'

const projectRules = {
  rules: {
    // `window.__PRERENDER__` is the flag prerender.js sets on the page it
    // renders at build time; the dunder marks it as build-injected, not ours.
    'no-underscore-dangle': ['error', { allow: ['__PRERENDER__'] }],
  },
} satisfies OxlintAddon

export default defineConfigOxlintQuasar(projectRules)
