import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'base',
      component: () => import('../views/base.vue')
    },
    {
      path: '/sky',
      name: 'sky',
      component: () => import('../views/sky.vue')
    },
    {
      path: '/triangle',
      name: 'triangle',
      component: () => import('../views/triangle.vue')
    },
    {
      path: '/async-draw',
      name: 'async-draw',
      component: () => import('../views/async-draw.vue')
    }
  ]
})

export default router
