import { createApp, watch } from 'vue'
import App from './App.vue'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'

import NavBar from './components/NavBar/NavBar.vue'
import MainContent from './components/Main/Main.vue'
import Footer from './components/Footer/Footer.vue'

import i18n from './plugins/i18n'
import type { I18n } from 'vue-i18n'

import '@/styles/markdown.css'
import 'github-markdown-css/github-markdown.css'

const app = createApp(App)

app.use(i18n)

app.component('Icon', Icon)
app.component('NavBar', NavBar)
app.component('MainContent', MainContent)
app.component('Footer', Footer)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')

const i18nInstance = i18n as unknown as I18n

const updateTitle = () => {
  const t = i18nInstance.global.t as (key: string) => string
  document.title = `${t('navbar.title')}`
}

updateTitle()

watch(() => i18nInstance.global.locale, updateTitle)
