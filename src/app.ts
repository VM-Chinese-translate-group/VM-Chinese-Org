import { createApp as createClientApp, createSSRApp, type Directive } from 'vue'
import { Icon } from '@iconify/vue'

import App from './App.vue'
import { createAppRouter } from './router'
import { createI18nInstance, type AvailableLocales } from './plugins/i18n'

const ssrLazyDirective: Directive<HTMLImageElement, string> = {
  getSSRProps(binding) {
    return {
      loading: 'lazy',
      src: binding.value,
    }
  },
}

interface CreateAppOptions {
  hydrate?: boolean
  locale?: AvailableLocales
  ssr?: boolean
}

export function createApp(options: CreateAppOptions = {}) {
  const createVueApp = options.ssr || options.hydrate ? createSSRApp : createClientApp
  const app = createVueApp(App)
  const router = createAppRouter(Boolean(options.ssr))
  const i18n = createI18nInstance(options.locale)

  app.component('Icon', Icon)
  app.use(router)
  app.use(i18n)

  if (options.ssr) {
    app.directive('lazy', ssrLazyDirective)
  }

  return { app, i18n, router }
}
