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
      path: '/async-draw-base',
      name: 'async-draw-base',
      component: () => import('../views/async-draw-base.vue')
    },
    {
      path: '/async-draw-1',
      name: 'async-draw-1',
      component: () => import('../views/async-draw-1.vue')
    },
    {
      path: '/async-draw-2',
      name: 'async-draw-2',
      component: () => import('../views/async-draw-2.vue')
    },
    {
      path: '/async-draw-3',
      name: 'async-draw-3',
      component: () => import('../views/async-draw-3.vue')
    },
    {
      path: '/async-draw-4',
      name: 'async-draw-4',
      component: () => import('../views/async-draw-4.vue')
    },
    {
      path: '/transform',
      name: 'transform',
      component: () => import('../views/transform.vue')
    },
    {
      path: '/matrix-transform',
      name: 'matrix-transform',
      component: () => import('../views/matrix-transform.vue')
    }
  ]
})

export default router
