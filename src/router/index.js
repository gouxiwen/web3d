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
    },
    {
      path: '/texture-module',
      name: 'texture-module',
      component: () => import('../views/texture-module.vue')
    },
    {
      path: '/texture-mix',
      name: 'texture-mix',
      component: () => import('../views/texture-mix.vue')
    },
    {
      path: '/texture-video',
      name: 'texture-video',
      component: () => import('../views/texture-video.vue')
    },
    {
      path: '/glsl-1',
      name: 'glsl-1',
      component: () => import('../views/glsl-1.vue')
    },
    {
      path: '/glsl-2',
      name: 'glsl-2',
      component: () => import('../views/glsl-2.vue')
    },
    {
      path: '/glsl-3',
      name: 'glsl-3',
      component: () => import('../views/glsl-3.vue')
    },
    {
      path: '/three-world1',
      name: 'three-world1',
      component: () => import('../views/three-world1.vue')
    },
    {
      path: '/three-world2',
      name: 'three-world2',
      component: () => import('../views/three-world2.vue')
    },
    {
      path: '/three-world3',
      name: 'three-world3',
      component: () => import('../views/three-world3.vue')
    },
    {
      path: '/multiply-shader',
      name: 'multiply-shader',
      component: () => import('../views/multiply-shader.vue')
    },
    {
      path: '/my-three-test',
      name: 'my-three-test',
      component: () => import('../views/my-three-test.vue')
    },
    {
      path: '/three-world4',
      name: 'three-world4',
      component: () => import('../views/three-world4.vue')
    },
    {
      path: '/three-world5',
      name: 'three-world5',
      component: () => import('../views/three-world5.vue')
    }
  ]
})

export default router
