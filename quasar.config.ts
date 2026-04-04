import { readFileSync } from 'node:fs'
import { defineConfig } from '#q-app/wrappers'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig(() => {
  return {
    sourceFiles: {
      rootComponent: 'src/app.vue',
    },

    boot: ['defaults'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: { browser: ['es2022', 'firefox115', 'chrome115', 'safari14'] },
      vueRouterMode: 'history', // available values: 'hash', 'history'
      vueOptionsAPI: false,
      typescript: { strict: true, vueShim: true },
      env: {
        APP_VERSION: version,
        NOCODB_API_URL: process.env.NOCODB_API_URL,
        NOCODB_REQUESTS_FORM_PUBLIC_UUID:
          process.env.NOCODB_REQUESTS_FORM_PUBLIC_UUID,
        NOCODB_REQUESTS_VIEW_URL: process.env.NOCODB_REQUESTS_VIEW_URL,
        DATA_BASE_URL: process.env.DATA_BASE_URL,
      },
    },

    devServer: {
      open: true,
    },

    framework: {
      config: {
        dark: 'auto',
        ripple: false,
      },
    },
  }
})
