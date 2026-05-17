import { nextTick, watch } from 'vue'
import VueLazyload from 'vue-lazyload'

import { createApp } from './app'
import { getClientLocale } from './plugins/i18n'
import { syncPageSeo } from './plugins/seo'
import { convertMarkdownContainers } from '@/utils/zhconv'

import 'github-markdown-css/github-markdown.css'
import '@/styles/markdown.css'
import 'virtual:uno.css'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

const appRoot = document.getElementById('app')
const hasPrerenderedHtml = Boolean(
  appRoot &&
  Array.from(appRoot.childNodes).some((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) return true
    if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim())
    if (node.nodeType === Node.COMMENT_NODE) return (node as Comment).data.trim() !== 'app-html'
    return false
  }),
)

const clientLocale = getClientLocale()
const { app, i18n, router } = createApp({
  hydrate: hasPrerenderedHtml,
  locale: hasPrerenderedHtml ? 'zh-CN' : clientLocale,
})

const registerImageCache = () => {
  if (!import.meta.env.PROD) return
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/image-cache-sw.js').catch(() => {
      // 图片缓存只是加速层，注册失败不影响页面内容。
    })
  })
}

app.use(VueLazyload as any, {
  preLoad: 1.3,
  error: '/imgs/missing.png',
  attempt: 3,
  observer: true,
  observerOptions: { rootMargin: '0px', threshold: 0.1 },
})

const syncHtmlMeta = () => {
  const { locale } = i18n.global as any
  document.documentElement.lang = locale.value
}

const syncSeo = () => {
  const { locale, t } = i18n.global as any
  syncPageSeo(router.currentRoute.value, locale.value, t)
}

router.isReady().then(async () => {
  app.mount('#app')

  const { locale } = i18n.global as any
  if (locale.value !== clientLocale) {
    locale.value = clientLocale
    await nextTick()
  }

  syncHtmlMeta()
  syncSeo()
  convertMarkdownContainers(locale.value)

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

  registerImageCache()

  if (import.meta.env.PROD) {
    router.afterEach(async () => {
      await nextTick()

      window.gtag?.('event', 'page_view', {
        page_title: document.title,
        page_path: location.pathname,
      })
    })
  }
})
