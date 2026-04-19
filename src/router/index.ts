import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { createMarkdownRoutes } from '@/router/markdown-routes'

const DefaultLayout = () => import('@/layout/DefaultLayout.vue')
const Home = () => import('@/layout/HomeLayout.vue')
const NotFound = () => import('@/layout/NotFoundLayout.vue')
const Maps = () => import('@/pages/map.vue')
const Modpacks = () => import('@/pages/modpacks.vue')

const mdRoutes: RouteRecordRaw[] = createMarkdownRoutes()

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', name: 'Home', component: Home },
      { path: 'modpacks', name: 'modpacks-list', component: Modpacks },
      { path: 'map', name: 'map-list', component: Maps },

      ...mdRoutes,

      {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFound,
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
