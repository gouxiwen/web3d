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
    },
    {
      path: '/matrix-multiply-transform',
      name: 'matrix-multiply-transform',
      component: () => import('../views/matrix-multiply-transform.vue')
    },
    {
      path: '/matrix-views',
      name: 'matrix-views',
      component: () => import('../views/matrix-views.vue')
    },
    {
      path: '/matrix-views-wave',
      name: 'matrix-views-wave',
      component: () => import('../views/matrix-views-wave.vue')
    },
    {
      path: '/color-multiply',
      name: 'color-multiply',
      component: () => import('../views/color-multiply.vue')
    },
    {
      path: '/color-wave',
      name: 'color-wave',
      component: () => import('../views/color-wave.vue')
    },
    {
      path: '/texture',
      name: 'texture',
      component: () => import('../views/texture.vue')
    },
    {
      path: '/texture-multiply',
      name: 'texture-multiply',
      component: () => import('../views/texture-multiply.vue')
    }
  ]
})

export default router
