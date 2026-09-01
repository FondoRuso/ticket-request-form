import { readFileSync } from 'node:fs'

import { defineConfig } from '#q-app'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig(() => {
  return {
    sourceFiles: {
      rootComponent: 'src/app.vue',
    },

    boot: ['defaults', 'analytics'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: { browser: ['es2022', 'firefox115', 'chrome115', 'safari14'] },
      vueRouterMode: 'history', // available values: 'hash', 'history'
      vueOptionsAPI: false,
      typescript: { strict: true, vueShim: true },
      defineEnv: {
        APP_VERSION: version,
        NOCODB_API_URL: import.meta.env.NOCODB_API_URL,
        NOCODB_REQUESTS_FORM_PUBLIC_UUID: import.meta.env
          .NOCODB_REQUESTS_FORM_PUBLIC_UUID,
        NOCODB_REQUESTS_VIEW_URL: import.meta.env.NOCODB_REQUESTS_VIEW_URL,
        DATA_BASE_URL: import.meta.env.DATA_BASE_URL,
        OPENPANEL_API_URL: import.meta.env.OPENPANEL_API_URL || '',
        OPENPANEL_CLIENT_ID: import.meta.env.OPENPANEL_CLIENT_ID || '',
      },
    },

    devServer: {
      open: true,
    },

    framework: {
      lang: 'ru',
      config: {
        dark: 'auto',
        ripple: false,
      },
    },
  }
})
