import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import DefaultLayout from '@/layout/DefaultLayout.vue'
import DocLayout from '@/layout/DocLayout.vue'
import Main from '@/components/Main/Main.vue'
import Maps from '@/pages/map.vue'
import Modpacks from '@/pages/modpacks.vue'
import NotFound from '@/pages/NotFound.vue'

const mdModules = import.meta.glob('../pages/**/*.md', { eager: true }) as Record<string, any>

const STATIC_DOCS = [
  '/tools',
  '/support-us',
  '/community',
  '/rule',
  '/friends-links',
  '/privacy',
  '/agreement',
]

function isDocRoute(routePath: string): boolean {
  if (STATIC_DOCS.includes(routePath)) return true
  if (routePath.startsWith('/modpacks/fc5-wiki')) return true
  if (routePath.endsWith('/secret')) return true
  return false
}

function fileToRoutePath(file: string) {
  let p = file.replace('../pages', '').replace(/\.md$/, '')
  if (p.endsWith('/index')) p = p.replace(/\/index$/, '')
  if (p === '') return '/'
  return p.startsWith('/') ? p : `/${p}`
}

const docRoutes: RouteRecordRaw[] = []
const plainMdRoutes: RouteRecordRaw[] = []

Object.keys(mdModules).forEach((file) => {
  const module = mdModules[file]
  const routePath = fileToRoutePath(file)

  if (['/', '/modpacks', '/map'].includes(routePath)) return

  const routeRecord: RouteRecordRaw = {
    path: routePath,
    name: routePath.replace(/^\//, '').replace(/\//g, '-') || `md-${Math.random()}`,
    component: module.default,
    meta: module.frontmatter || {},
  }

  if (isDocRoute(routePath)) {
    docRoutes.push(routeRecord)
  } else {
    plainMdRoutes.push(routeRecord)
  }
})

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', name: 'Main', component: Main },
      { path: 'modpacks', name: 'modpacks-list', component: Modpacks },
      { path: 'map', name: 'map-list', component: Maps },

      ...plainMdRoutes,

      {
        path: '',
        component: DocLayout,
        children: docRoutes,
      },
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
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
