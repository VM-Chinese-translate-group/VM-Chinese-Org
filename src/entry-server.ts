import { renderToString } from '@vue/server-renderer'

import { createApp } from './app'
import { renderSeoHead, resolvePageSeo } from './plugins/seo'
import type { AvailableLocales } from './plugins/i18n'

export async function render(url: string, locale: AvailableLocales = 'zh-CN') {
  const { app, i18n, router } = createApp({ locale, ssr: true })

  await router.push(url)
  await router.isReady()

  const html = await renderToString(app)
  const { t } = i18n.global as any
  const seo = await resolvePageSeo(router.currentRoute.value, locale, t)

  return {
    appHtml: html,
    head: renderSeoHead(seo),
    htmlAttrs: `lang="${locale}"`,
  }
}
