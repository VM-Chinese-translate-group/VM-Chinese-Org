import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/Layout.vue'
import Main from '@/components/Main/Main.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'Main',
          component: Main,
        },
      ],
    },
  ],
})

export default router
