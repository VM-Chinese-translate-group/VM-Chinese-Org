import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import DefaultLayout from '@/Layout.vue'
import Main from '@/components/Main/Main.vue'
import Modpacks from '@/pages/modpacks.vue'

// 将 src/pages 下的 .md 文件作为 Vue 组件，并自动生成路由
const mdModules = import.meta.glob('../pages/**/*.md', { eager: true }) as Record<string, any>

function fileToRoutePath(file: string) {
  let p = file.replace('../pages', '').replace(/\.md$/, '')
  if (p.endsWith('/index')) p = p.replace(/\/index$/, '')
  if (p === '') return '/'
  return p.startsWith('/') ? p : `/${p}`
}

const mdRoutes: RouteRecordRaw[] = Object.keys(mdModules).map((file) => {
  const module = mdModules[file]
  const routePath = fileToRoutePath(file)
  const name = routePath === '/' ? 'home' : routePath.replace(/^\//, '').replace(/\//g, '-')
  return {
    path: routePath,
    name,
    component: module.default || module,
    meta: module.frontmatter || module.meta || {},
  } as RouteRecordRaw
})

const mdRoutesFiltered = mdRoutes.filter((r) => r.path !== '/' && r.path !== '/modpacks')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Main',
        component: Main,
      },
      {
        path: '/modpacks',
        name: 'modpacks-list',
        component: Modpacks,
      },
      ...mdRoutesFiltered,
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 添加以下滚动行为配置
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        // 如果你有顶部导航栏（假设高度为 70px），可以添加偏移量
        top: 80,
      }
    }
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

export default router
