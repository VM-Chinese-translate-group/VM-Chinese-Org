import { createApp } from 'vue'
import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import Footer from './components/Footer/Footer.vue'
import NavBar from './components/NavBar/NavBar.vue'
import MainContent from './components/Main-Content/Main-Content.vue'
const app = createApp(App)
app.component('Icon', Icon)
app.component('Footer', Footer)
app.component('NavBar', NavBar)
app.component('MainContent', MainContent)
app.mount('#app')
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
