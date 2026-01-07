import { createApp, watch } from 'vue'
import App from './App.vue'
import router from './router'

import i18n from './plugins/i18n'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'

import '@/styles/markdown.css'
import 'github-markdown-css/github-markdown.css'
import type { Composer } from 'vue-i18n'

const app = createApp(App)

app.use(router)
app.use(i18n)

app.component('Icon', Icon)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')

const updateHtmlMeta = () => {
  const i18nGlobal = i18n.global as unknown as Composer
  const currentLocale = i18nGlobal.locale.value
  // 更新网页标题
  document.title = i18nGlobal.t('navbar.title')
  // 让 html 标签的 lang 属性跟随变化
  document.documentElement.lang = currentLocale
}

updateHtmlMeta()

watch(
  () => (i18n.global as unknown as Composer).locale.value,
  () => {
    updateHtmlMeta()
  },
)
