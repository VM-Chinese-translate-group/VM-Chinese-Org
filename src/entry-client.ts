import { nextTick, watch } from 'vue'
import VueLazyload from 'vue-lazyload'

import { createApp } from './app'
import { getClientLocale } from './plugins/i18n'
import { syncPageSeo } from './plugins/seo'
import { isAprilFoolsDay, syncAprilFoolsBranding } from '@/utils/aprilFools'
import { convertMarkdownContainers } from '@/utils/zhconv'
import { applyTheme, getPreferredTheme } from '@/utils/theme'

import '@/styles/markdown.css'
import 'virtual:uno.css'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

const clientLocale = getClientLocale()
applyTheme(getPreferredTheme(), false)

const { app, i18n, router } = createApp({
  locale: clientLocale,
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

let aprilFoolsFrame = 0

const scheduleAprilFoolsBranding = () => {
  if (!isAprilFoolsDay()) return
  cancelAnimationFrame(aprilFoolsFrame)
  aprilFoolsFrame = requestAnimationFrame(() => {
    syncAprilFoolsBranding(router.currentRoute.value.path)
  })
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
  scheduleAprilFoolsBranding()

  watch(
    () => (i18n.global as any).locale.value,
    async (val) => {
      syncHtmlMeta()
      syncSeo()

      await nextTick()
      convertMarkdownContainers(val)
      scheduleAprilFoolsBranding()
    },
  )

  router.afterEach(async () => {
    syncSeo()
    await nextTick()
    scheduleAprilFoolsBranding()
  })

  registerImageCache()

  if (isAprilFoolsDay()) {
    const observer = new MutationObserver(() => scheduleAprilFoolsBranding())
    observer.observe(document.body, { childList: true, subtree: true })
  }

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
