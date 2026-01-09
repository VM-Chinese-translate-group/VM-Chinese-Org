import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import DefaultLayout from '@/Layout.vue'
import Main from '@/components/Main/Main.vue'

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

const mdRoutesFiltered = mdRoutes.filter((r) => r.path !== '/')

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
      ...mdRoutesFiltered,
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
