<template>
  <div>颜色-波浪异色</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, ScaleLinear, SinFn } from '../utils/helper'
import Poly from '../utils/Poly-color-wave'
import { Matrix4, Vector3, Color } from 'https://unpkg.com/three/build/three.module.js'

onMounted(() => {
  // canvas 画布
  const canvas = document.getElementById('canvas')
  canvas.width = document.querySelector('.container').clientWidth
  canvas.height = document.querySelector('.container').clientHeight
  // webgl画笔
  const gl = canvas.getContext('webgl')
  gl.clearColor(0, 0, 0, 1)
  // 顶点着色器
  // 用attribute定义顶点变量
  const vsSource = `
  attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ViewMatrix;
    varying vec4 v_Color;
    void main(){
      gl_Position = u_ViewMatrix*a_Position;
      gl_PointSize=3.0;
      v_Color=a_Color;
    }
  `
  // 片元着色器
  const fsSource = `
  precision mediump float;
  varying vec4 v_Color;
    void main() {
      gl_FragColor=v_Color;
    }
  `
  // 初始化着色器
  initShaders(gl, vsSource, fsSource)
  /* 视图矩阵 */
  const viewMatrix = new Matrix4().lookAt(
    new Vector3(0.2, 0.3, 1),
    new Vector3(),
    new Vector3(0, 1, 0)
  )
  /* x,z 方向的空间坐标极值 */
  const [minPosX, maxPosX, minPosZ, maxPosZ] = [-0.7, 0.8, -1, 1]
  /* x,z 方向的弧度极值 */
  const [minAngX, maxAngX, minAngZ, maxAngZ] = [0, Math.PI * 4, 0, Math.PI * 2]

  /* 比例尺：将空间坐标和弧度相映射 */
  const scalerX = ScaleLinear(minPosX, minAngX, maxPosX, maxAngX)
  const scalerZ = ScaleLinear(minPosZ, minAngZ, maxPosZ, maxAngZ)
  /* y 方向的坐标极值 */
  const [a1, a2] = [0.1, 0.03]
  const a12 = a1 + a2
  const [minY, maxY] = [-a12, a12]
  /* 色相极值 */
  const [minH, maxH] = [0.15, 0.5]
  /* 比例尺：将y坐标和色相相映射 */
  const scalerC = ScaleLinear(minY, minH, maxY, maxH)
  const color = new Color()

  /* 波浪对象的行数和列数 */
  const [rows, cols] = [50, 50]

  /* 波浪对象的两个attribute变量，分别是位置和颜色 */
  const a_Position = { size: 3, index: 0 }
  const a_Color = { size: 4, index: 3 }

  /* 类目尺寸 */
  const categorySize = a_Position.size + a_Color.size

  /* 波浪对象 */
  const wave = new Poly({
    gl,
    source: getSource(cols, rows, minPosX, maxPosX, minPosZ, maxPosZ),
    uniforms: {
      u_ViewMatrix: {
        type: 'uniformMatrix4fv',
        value: viewMatrix.elements
      }
    },
    attributes: {
      a_Position,
      a_Color
    }
  })
  /* 建立顶点集合 */
  function getSource(cols, rows, minPosX, maxPosX, minPosZ, maxPosZ) {
    const source = []
    const spaceZ = (maxPosZ - minPosZ) / rows
    const spaceX = (maxPosX - minPosX) / cols
    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < cols; x++) {
        const px = x * spaceX + minPosX
        const pz = z * spaceZ + minPosZ
        source.push(px, 0, pz, 1, 1, 1, 1)
      }
    }
    return source
  }
  render()
  /* 渲染 */
  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    wave.draw()
  }
  /* 动画:偏移phi */
  let offset = 0
  !(function ani() {
    offset += 0.08
    updateVertices(offset)
    wave.updateAttribute()
    render()
    requestAnimationFrame(ani)
  })()

  /* 更新顶点高度和颜色 */
  function updateVertices(offset = 0) {
    const { source, categorySize } = wave
    for (let i = 0; i < source.length; i += categorySize) {
      const [posX, posZ] = [source[i], source[i + 2]]
      const angZ = scalerZ(posZ)
      const Omega = 2 // 影响周期
      const a = Math.sin(angZ) * a1 + a2 // 影响振幅，范围：-0.1+0.03~0.1+0.03
      const phi = scalerX(posX) + offset // 影响偏移
      const y = SinFn(a, Omega, phi)(angZ)
      source[i + 1] = y
      const h = scalerC(y)
      const { r, g, b } = color.setHSL(h, 1, 0.6)
      source[i + 3] = r
      source[i + 4] = g
      source[i + 5] = b
    }
  }
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
