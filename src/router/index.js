import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
  {
    path: '/webgl',
    name: 'webgl',
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/webgl/HomeView.vue'),
      },
      {
        path: 'base',
        name: 'base',
        component: () => import('../views/webgl/base.vue')
      },
      {
        path: 'sky',
        name: 'sky',
        component: () => import('../views/webgl/sky.vue')
      },
      {
        path: 'triangle',
        name: 'triangle',
        component: () => import('../views/webgl/triangle.vue')
      },
      {
        path: 'async-draw-base',
        name: 'async-draw-base',
        component: () => import('../views/webgl/async-draw-base.vue')
      },
      {
        path: 'async-draw-1',
        name: 'async-draw-1',
        component: () => import('../views/webgl/async-draw-1.vue')
      },
      {
        path: 'async-draw-2',
        name: 'async-draw-2',
        component: () => import('../views/webgl/async-draw-2.vue')
      },
      {
        path: 'async-draw-3',
        name: 'async-draw-3',
        component: () => import('../views/webgl/async-draw-3.vue')
      },
      {
        path: 'async-draw-4',
        name: 'async-draw-4',
        component: () => import('../views/webgl/async-draw-4.vue')
      },
      {
        path: 'transform',
        name: 'transform',
        component: () => import('../views/webgl/transform.vue')
      },
      {
        path: 'matrix-transform',
        name: 'matrix-transform',
        component: () => import('../views/webgl/matrix-transform.vue')
      },
      {
        path: 'matrix-multiply-transform',
        name: 'matrix-multiply-transform',
        component: () => import('../views/webgl/matrix-multiply-transform.vue')
      },
      {
        path: 'matrix-views',
        name: 'matrix-views',
        component: () => import('../views/webgl/matrix-views.vue')
      },
      {
        path: 'matrix-views-wave',
        name: 'matrix-views-wave',
        component: () => import('../views/webgl/matrix-views-wave.vue')
      },
      {
        path: 'color-multiply',
        name: 'color-multiply',
        component: () => import('../views/webgl/color-multiply.vue')
      },
      {
        path: 'color-wave',
        name: 'color-wave',
        component: () => import('../views/webgl/color-wave.vue')
      },
      {
        path: 'texture',
        name: 'texture',
        component: () => import('../views/webgl/texture.vue')
      },
      {
        path: 'texture-multiply',
        name: 'texture-multiply',
        component: () => import('../views/webgl/texture-multiply.vue')
      },
      {
        path: 'texture-module',
        name: 'texture-module',
        component: () => import('../views/webgl/texture-module.vue')
      },
      {
        path: 'texture-mix',
        name: 'texture-mix',
        component: () => import('../views/webgl/texture-mix.vue')
      },
      {
        path: 'texture-video',
        name: 'texture-video',
        component: () => import('../views/webgl/texture-video.vue')
      },
      {
        path: 'glsl-1',
        name: 'glsl-1',
        component: () => import('../views/webgl/glsl-1.vue')
      },
      {
        path: 'glsl-2',
        name: 'glsl-2',
        component: () => import('../views/webgl/glsl-2.vue')
      },
      {
        path: 'glsl-3',
        name: 'glsl-3',
        component: () => import('../views/webgl/glsl-3.vue')
      },
      {
        path: 'three-world1',
        name: 'three-world1',
        component: () => import('../views/webgl/three-world1.vue')
      },
      {
        path: 'three-world2',
        name: 'three-world2',
        component: () => import('../views/webgl/three-world2.vue')
      },
      {
        path: 'three-world3',
        name: 'three-world3',
        component: () => import('../views/webgl/three-world3.vue')
      },
      {
        path: 'multiply-shader',
        name: 'multiply-shader',
        component: () => import('../views/webgl/multiply-shader.vue')
      },
      {
        path: 'my-three-test',
        name: 'my-three-test',
        component: () => import('../views/webgl/my-three-test.vue')
      },
      {
        path: 'three-world4',
        name: 'three-world4',
        component: () => import('../views/webgl/three-world4.vue')
      },
      {
        path: 'three-world5',
        name: 'three-world5',
        component: () => import('../views/webgl/three-world5.vue')
      },
      {
        path: 'light1',
        name: 'light1',
        component: () => import('../views/webgl/light1.vue')
      },
      {
        path: 'light2',
        name: 'light2',
        component: () => import('../views/webgl/light2.vue')
      },
      {
        path: 'light3',
        name: 'light3',
        component: () => import('../views/webgl/light3.vue')
      },
      {
        path: 'light4',
        name: 'light4',
        component: () => import('../views/webgl/light4.vue')
      },
      {
        path: 'light5',
        name: 'light5',
        component: () => import('../views/webgl/light5.vue')
      },
      {
        path: 'light6',
        name: 'light6',
        component: () => import('../views/webgl/light6.vue')
      },
      {
        path: 'stencil-buffer',
        name: 'stencil-buffer',
        component: () => import('../views/webgl/stencil-buffer.vue')
      },
    ]
  },
  {
    path: '/three',
    name: 'three',
    children: [
      {
        path: 'plane',
        name: 'plane',
        component: () => import('@/views/three/plane.vue'),
      },
      {
        path: 'sphere',
        name: 'sphere',
        component: () => import('@/views/three/sphere.vue'),
      },
      {
        path: 'buffer1',
        name: 'buffer1',
        component: () => import('@/views/three/buffer1.vue'),
      },
      {
        path: 'buffer2',
        name: 'buffer2',
        component: () => import('@/views/three/buffer2.vue'),
      },
      {
        path: 'buffer3',
        name: 'buffer3',
        component: () => import('@/views/three/buffer3.vue'),
      },
      {
        path: 'tree1',
        name: 'tree1',
        component: () => import('@/views/three/tree1.vue'),
      },
      {
        path: 'tree2',
        name: 'tree2',
        component: () => import('@/views/three/tree2.vue'),
      },
      {
        path: 'machineRoom',
        name: 'machineRoom',
        component: () => import('@/views/three/machineRoom.vue'),
        path: 'car',
        name: 'car',
        component: () => import('@/views/three/car.vue'),
      }
    ]
  },
  {
    path: '/jsx',
    name: 'jsx',
    component: () => import('../views/jsx.jsx')
  }
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
