// https://nuxt.com/docs/api/configuration/nuxt-config
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineNuxtConfig({
  compatibilityDate: '2025-02-14',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt'
  ],
  plugins: [
    { src: '~/plugins/element-ui.ts', mode: 'client' },
  ],
  vite: {
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true // 允许在 Less 中使用 JavaScript 表达式
        },
      },
    },
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      // Components({
      //   resolvers: [ElementPlusResolver()],
      // }),
    ],
  },
})
