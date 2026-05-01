import { createApp, nextTick, watch } from 'vue'
import { Icon } from '@iconify/vue'

import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'
import { syncPageSeo } from './plugins/seo'
import { convertMarkdownContainers } from '@/utils/zhconv'
import VueLazyload from 'vue-lazyload'

import 'github-markdown-css/github-markdown.css'
import '@/styles/markdown.css'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

const app = createApp(App)

app.component('Icon', Icon)

app.use(router)
app.use(i18n)
app.use(VueLazyload as any, {
  preLoad: 1.3,
  error: '/imgs/missing.png',
  attempt: 3,
  observer: true,
  observerOptions: { rootMargin: '0px', threshold: 0.1 },
})

const syncHtmlMeta = () => {
  const { locale } = i18n.global as any
  // 让 html 标签的 lang 属性跟随变化
  document.documentElement.lang = locale.value
}

const syncSeo = () => {
  const { locale, t } = i18n.global as any
  syncPageSeo(router.currentRoute.value, locale.value, t)
}

syncHtmlMeta()
syncSeo()

convertMarkdownContainers((i18n.global as any).locale.value)

watch(
  () => (i18n.global as any).locale.value,
  async (val) => {
    syncHtmlMeta()
    syncSeo()

    await nextTick()
    convertMarkdownContainers(val)
  },
)

router.afterEach(() => {
  syncSeo()
})

if (import.meta.env.PROD) {
  router.afterEach(async () => {
    await nextTick()

    window.gtag?.('event', 'page_view', {
      page_title: document.title,
      page_path: location.pathname,
    })
  })
}

app.mount('#app')
