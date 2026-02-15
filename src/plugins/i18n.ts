import { createI18n } from 'vue-i18n'

import zhCN from '@/locales/zh-CN'
import zhTW from '@/locales/zh-TW'
import enUS from '@/locales/en-US'

// 定义 Message Schema 类型，以 zh-CN 为准。使用 t('...') 时会有代码提示，并且 key 会被校验
type MessageSchema = typeof zhCN

type AvailableLocales = 'zh-CN' | 'zh-TW' | 'en-US'

const savedLocale = (localStorage.getItem('locale') as AvailableLocales) || 'zh-CN'

const i18n = createI18n<[MessageSchema], AvailableLocales>({
  legacy: false,
  globalInjection: true,
  locale: savedLocale,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'en-US': enUS,
  },
})

export default i18n
