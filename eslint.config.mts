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
  {
    // Quasar's Vite build loads this one through PostCSS's CommonJS resolver,
    // so it has to stay `.cjs` even though the package is an ES module.
    files: ['postcss.config.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
)
