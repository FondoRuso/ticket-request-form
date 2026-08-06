import {
  defineConfigEslintQuasar,
  eslintPluginJsdoc,
  eslintPluginPinia,
  eslintPluginRegexp,
  eslintPluginSonarjs,
  eslintPluginVueA11y,
} from '@govnotech/conventions/eslint'

export default defineConfigEslintQuasar(
  { ...eslintPluginPinia.config, files: ['src/stores/**/*.ts'] },
  { ...eslintPluginVueA11y.config, files: ['**/*.vue'] },
  { ...eslintPluginJsdoc.config, files: ['src/**/*.ts'] },
  eslintPluginRegexp.config,
  eslintPluginSonarjs.config,
)
