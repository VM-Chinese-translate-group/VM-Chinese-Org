import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { convertInlineText } from '@/utils/zhconv'

const SITE_URL = 'https://v4.vmct-cn.top'
const DEFAULT_IMAGE = '/imgs/og_image.png'

type TranslateFn = (key: string, values?: Record<string, unknown>) => string

interface SeoMeta {
  description?: string
  icon?: string
  image?: string
  noindex?: boolean
  title?: string
}

function normalizeText(value: unknown, fallback = '') {
  if (typeof value !== 'string') return fallback
  return value.replace(/\s+/g, ' ').trim() || fallback
}

function absoluteUrl(value: string) {
  if (/^https?:\/\//.test(value)) return value
  return new URL(value.startsWith('/') ? value : `/${value}`, SITE_URL).toString()
}

function canonicalUrl(route: RouteLocationNormalizedLoaded) {
  return new URL(route.path || '/', SITE_URL).toString()
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)

  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }

  Object.entries(attrs).forEach(([key, value]) => el?.setAttribute(key, value))
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)

  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }

  el.href = href
}

function upsertJsonLd(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null

  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }

  el.textContent = JSON.stringify(data)
}

function getRouteSeo(route: RouteLocationNormalizedLoaded, t: TranslateFn): SeoMeta {
  const meta = route.meta as SeoMeta
  const siteName = t('navbar.title')
  const defaultDescription = t('seo.defaultDescription')

  if (route.name === 'Home') {
    return {
      title: siteName,
      description: t('main.subheadline'),
      image: DEFAULT_IMAGE,
    }
  }

  if (route.name === 'modpacks-list') {
    return {
      title: t('navbar.modpack'),
      description: t('seo.modpacksDescription'),
      image: DEFAULT_IMAGE,
    }
  }

  if (route.name === 'map-list') {
    return {
      title: t('navbar.map'),
      description: t('seo.mapsDescription'),
      image: DEFAULT_IMAGE,
    }
  }

  if (route.name === 'not-found') {
    return {
      title: t('notFound.title'),
      description: t('notFound.desc'),
      image: DEFAULT_IMAGE,
      noindex: true,
    }
  }

  return {
    title: normalizeText(meta.title, siteName),
    description: normalizeText(meta.description, defaultDescription),
    image: normalizeText(meta.image || meta.icon, DEFAULT_IMAGE),
    noindex: meta.noindex || route.path.endsWith('/secret'),
  }
}

export async function syncPageSeo(
  route: RouteLocationNormalizedLoaded,
  locale: string,
  t: TranslateFn,
) {
  const siteName = t('navbar.title')
  const defaultDescription = t('seo.defaultDescription')
  const rawSeo = getRouteSeo(route, t)
  const title = await convertInlineText(normalizeText(rawSeo.title, siteName), locale)
  const description = await convertInlineText(
    normalizeText(rawSeo.description, defaultDescription),
    locale,
  )
  const pageTitle = title === siteName ? siteName : `${title} | ${siteName}`
  const url = canonicalUrl(route)
  const image = absoluteUrl(rawSeo.image || DEFAULT_IMAGE)
  const robots = rawSeo.noindex ? 'noindex, nofollow' : 'index, follow'

  document.title = pageTitle

  upsertMeta('meta[name="description"]', { name: 'description', content: description })
  upsertMeta('meta[name="robots"]', { name: 'robots', content: robots })
  upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: siteName })
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: pageTitle })
  upsertMeta('meta[property="og:description"]', {
    property: 'og:description',
    content: description,
  })
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image })
  upsertMeta('meta[property="og:locale"]', {
    property: 'og:locale',
    content: locale === 'zh-TW' ? 'zh_TW' : locale === 'en-US' ? 'en_US' : 'zh_CN',
  })
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: pageTitle })
  upsertMeta('meta[name="twitter:description"]', {
    name: 'twitter:description',
    content: description,
  })
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })
  upsertLink('canonical', url)

  upsertJsonLd('vmct-jsonld', {
    '@context': 'https://schema.org',
    '@type': route.name === 'Home' ? 'WebSite' : 'WebPage',
    name: pageTitle,
    description,
    url,
    image,
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: SITE_URL,
      logo: absoluteUrl('/imgs/logo/logo_512.png'),
    },
  })
}
