import { createApp, watch } from 'vue'
import App from './App.vue'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'

import NavBar from './components/NavBar/NavBar.vue'
import MainContent from './components/Main/Main.vue'
import Footer from './components/Footer/Footer.vue'

import i18n from './plugins/i18n'

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

const updateTitle = () => {
  const t = (i18n as any).global.t as (key: string) => string
  document.title = `${t('navbar.title')}`
}

updateTitle()

watch(() => ((i18n as any).global.locale?.value ?? (i18n as any).global.locale), updateTitle)

