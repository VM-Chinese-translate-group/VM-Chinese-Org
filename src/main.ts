import { createApp, nextTick, watch } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'

import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'
import VueLazyload from 'vue-lazyload'

import 'github-markdown-css/github-markdown.css'
import '@/styles/markdown.css'

import DocSupport from '@/components/DocSupport.vue'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

const app = createApp(App)

app.component('Icon', Icon)
app.component('DocSupport', DocSupport)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

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
  const { locale, t } = i18n.global as any
  // 更新网页标题
  document.title = t('navbar.title')
  // 让 html 标签的 lang 属性跟随变化
  document.documentElement.lang = locale.value
}

syncHtmlMeta()
watch(() => (i18n.global as any).locale.value, syncHtmlMeta)

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
