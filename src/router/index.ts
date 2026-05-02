import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import DefaultLayout from '@/layout/DefaultLayout.vue'
import Home from '@/layout/HomeLayout.vue'
import NotFound from '@/layout/NotFoundLayout.vue'
import Credits from '@/pages/credits.vue'
import Maps from '@/pages/map.vue'
import Modpacks from '@/pages/modpacks.vue'

const mdModules = import.meta.glob('../pages/**/*.md', { eager: true }) as Record<string, any>

function fileToRoutePath(file: string) {
  let p = file.replace('../pages', '').replace(/\.md$/, '')
  if (p.endsWith('/index')) p = p.replace(/\/index$/, '')
  if (p === '') return '/'
  return p.startsWith('/') ? p : `/${p}`
}

const mdRoutes: RouteRecordRaw[] = []

Object.keys(mdModules).forEach((file) => {
  const module = mdModules[file]
  const routePath = fileToRoutePath(file)

  if (['/', '/modpacks', '/map'].includes(routePath)) return

  const isDocLayout = routePath.startsWith('/modpacks/fc5-wiki') || routePath.endsWith('/secret')

  mdRoutes.push({
    path: routePath,
    name: routePath.replace(/^\//, '').replace(/\//g, '-') || `md-${Math.random()}`,
    component: module.default,
    meta: {
      ...(module.frontmatter || module.default?.frontmatter || {}),
      layout: isDocLayout ? 'doc' : 'default',
      noindex: routePath.endsWith('/secret'),
    },
  })
})

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', name: 'Home', component: Home },
      { path: 'modpacks', name: 'modpacks-list', component: Modpacks },
      { path: 'map', name: 'map-list', component: Maps },
      {
        path: 'credits',
        name: 'credits',
        component: Credits,
        meta: {
          title: '贡献名单',
          description: '按网页开发、外部贡献人员与 VM汉化组成员分类展示贡献名单。',
        },
      },

      ...mdRoutes,

      {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFound,
        meta: {
          noindex: true,
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
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
