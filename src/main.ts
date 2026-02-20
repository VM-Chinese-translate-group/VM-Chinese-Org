import { createApp, nextTick, watch } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'

import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'

import 'github-markdown-css/github-markdown.css'
import '@/styles/markdown.css'

import DocSupport from '@/components/DocSupport.vue'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    SITE_URL?: string
  }
}

const app = createApp(App)

// 全局组件
app.component('Icon', Icon)
app.component('DocSupport', DocSupport)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 安装插件
app.use(router)
app.use(i18n)

// 设置 meta 标签函数
function setMetaTag(name: string, content: string | null, attrName = 'name') {
  if (!content) return
  const selector = `${attrName}="${name}"`
  let el = document.querySelector(`meta[${selector}]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// 设置 canonical 链接
function setLinkCanonical(href: string) {
  if (!href) return
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

// 根据路由更新 meta
function updateMetaFromRoute() {
  const route = router.currentRoute.value
  const { locale, t } = i18n.global as any
  const loc = locale.value || 'zh-CN'

  // 获取候选 meta 来源：route.meta、以及匹配的路由组件上的 frontmatter（如果存在）
  let meta = route && route.meta ? { ...(route.meta as any) } : {}
  try {
    for (const record of route.matched || []) {
      const comp: any = record.components && (record.components as any).default
      if (!comp) continue
      // 常见位置：component.frontmatter, component.__pageMeta, component.__vccOpts?.frontmatter
      const fm =
        comp.frontmatter ||
        comp.__pageMeta ||
        (comp.__vccOpts && comp.__vccOpts.frontmatter) ||
        comp.meta ||
        null
      if (fm && typeof fm === 'object') {
        meta = { ...fm, ...meta }
      }
    }
  } catch (e) {
  }

  // title 优先取 route/meta 或组件 frontmatter 中的 `title`，否则回退到 i18n 默认
  const title = meta.title || t('navbar.title')
  document.title = title
  document.documentElement.lang = loc

  // description 优先取 route/meta 或组件 frontmatter 中的 `description`，否则回退到 i18n 默认
  const rawDesc = meta.description || t('main.slogan')
  const description = typeof rawDesc === 'string' ? (rawDesc.split('\n\n')[0] ?? '').trim() : ''
  setMetaTag('description', description)

  // Open Graph
  setMetaTag('og:title', title, 'property')
  setMetaTag('og:description', description, 'property')
  setMetaTag('og:type', 'website', 'property')

  // 图片
  const image = meta.icon || meta.image || '/imgs/logo/logo_64.png'
  setMetaTag('og:image', image, 'property')

  // URL
  const siteBase = window.SITE_URL || ''
  const fullUrl = siteBase
    ? `${siteBase.replace(/\/$/, '')}${route.fullPath}`
    : window.location.origin + route.fullPath
  setMetaTag('og:url', fullUrl, 'property')
  setLinkCanonical(fullUrl)

  // Twitter cards
  setMetaTag('twitter:card', 'summary_large_image')
  setMetaTag('twitter:title', title)
  setMetaTag('twitter:description', description)
  setMetaTag('twitter:image', image)
}

updateMetaFromRoute()

router.afterEach(() => {
  nextTick().then(updateMetaFromRoute)
})

watch(
  () => (i18n.global as any).locale.value,
  () => {
    updateMetaFromRoute()
  },
)

// Google Analytics 页面访问
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
