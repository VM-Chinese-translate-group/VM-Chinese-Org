import { createI18n } from 'vue-i18n'

import zhCN from '../locales/zh-CN'
import enUS from '../locales/en-US'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN', // 设置默认语言
  fallbackLocale: 'zh-CN', // 设置回退语言
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

export default i18n
