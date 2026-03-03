import { readFileSync } from 'node:fs';
import { defineConfig } from '#q-app/wrappers';

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig(() => {
  return {
    boot: ['defaults'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: { browser: ['es2022', 'firefox115', 'chrome115', 'safari14'] },
      vueRouterMode: 'hash',
      vueOptionsAPI: false,
      typescript: { strict: true, vueShim: true },
      env: {
        APP_VERSION: version,
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
      plugins: [],
    },
  };
});
