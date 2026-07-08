import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import DefaultLayout from '@/layout/DefaultLayout.vue'
import Home from '@/layout/HomeLayout.vue'
import { routeMeta } from 'virtual:route-meta'

const mdComponents = import.meta.glob('../pages/**/*.md')

function fileToRoutePath(file: string) {
  let p = file.replace('../pages', '').replace(/\.md$/, '')
  if (p.endsWith('/index')) p = p.replace(/\/index$/, '')
  if (p === '') return '/'
  return p.startsWith('/') ? p : `/${p}`
}

const mdRoutes: RouteRecordRaw[] = []

Object.keys(mdComponents).forEach((file) => {
  const routePath = fileToRoutePath(file)

  if (['/', '/modpacks', '/map'].includes(routePath)) return

  const isDocLayout = routePath.startsWith('/modpacks/fc5-wiki') || routePath.endsWith('/secret')

  mdRoutes.push({
    path: routePath,
    name: routePath.replace(/^\//, '').replace(/\//g, '-') || `md-${Math.random()}`,
    component: mdComponents[file],
    meta: {
      ...(routeMeta[file] || {}),
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
      { path: 'modpacks', name: 'modpacks-list', component: () => import('@/pages/modpacks.vue') },
      { path: 'map', name: 'map-list', component: () => import('@/pages/map.vue') },
      { path: 'join', name: 'join-redirect', redirect: '/community#加入我们' },
      {
        path: 'credits',
        name: 'credits',
        component: () => import('@/pages/credits.vue'),
        meta: {
          title: '贡献名单',
          description: '按网页开发、外部贡献人员与 VM汉化组成员分类展示贡献名单。',
        },
      },

      ...mdRoutes,

      {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/layout/NotFoundLayout.vue'),
        meta: {
          noindex: true,
        },
      },
    ],
  },
]

export function createAppRouter(ssr = false) {
  return createRouter({
    history: ssr ? createMemoryHistory() : createWebHistory(),
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
}
