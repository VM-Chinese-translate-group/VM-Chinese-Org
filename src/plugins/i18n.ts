import { createI18n } from 'vue-i18n'

import zhCN from '@/locales/zh-CN'
import zhTW from '@/locales/zh-TW'
import enUS from '@/locales/en-US'

// 定义 Message Schema 类型，以 zh-CN 为准。使用 t('...') 时会有代码提示，并且 key 会被校验
type MessageSchema = typeof zhCN

type AvailableLocales = 'zh-CN' | 'zh-TW' | 'en-US'

const SUPPORTED_LOCALES: AvailableLocales[] = ['zh-CN', 'zh-TW', 'en-US']

// 语言映射表（系统语言 → 站点语言）
function matchLocale(lang: string): AvailableLocales | null {
  const lower = lang.toLowerCase()

  if (lower.startsWith('zh')) {
    if (lower.includes('tw') || lower.includes('hk') || lower.includes('mo')) {
      return 'zh-TW'
    }
    return 'zh-CN'
  }

  if (lower.startsWith('en')) {
    return 'en-US'
  }

  return null
}

// 获取系统语言（按优先级匹配）
function getSystemLocale(): AvailableLocales {
  const langs = navigator.languages || [navigator.language]

  for (const lang of langs) {
    const matched = matchLocale(lang)
    if (matched && SUPPORTED_LOCALES.includes(matched)) {
      return matched
    }
  }

  return 'zh-CN'
}

function getSavedLocale(): AvailableLocales | null {
  const saved = localStorage.getItem('locale') as AvailableLocales | null
  if (saved && SUPPORTED_LOCALES.includes(saved)) {
    return saved
  }
  return null
}

const locale: AvailableLocales = getSavedLocale() ?? getSystemLocale()

const i18n = createI18n<[MessageSchema], AvailableLocales>({
  legacy: false,
  globalInjection: true,
  locale,
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'en-US': enUS,
  },
})

export default i18n
