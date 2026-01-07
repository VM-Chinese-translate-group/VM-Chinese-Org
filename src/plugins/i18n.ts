import { createI18n } from 'vue-i18n'

import zhCN from '@/locales/zh-CN'
import enUS from '@/locales/en-US'

// 定义 Message Schema 类型，以 zh-CN 为准。使用 t('...') 时会有代码提示，并且 key 会被校验
type MessageSchema = typeof zhCN

const i18n = createI18n<[MessageSchema], 'zh-CN' | 'en-US'>({
  legacy: false,
  globalInjection: true,
  locale: 'zh-CN', // 设置默认语言
  fallbackLocale: 'zh-CN', // 设置回退语言
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

export default i18n
