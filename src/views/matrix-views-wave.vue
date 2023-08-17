<template>
  <div>视图矩阵-波浪</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
import { initShaders, ScaleLinear, SinFn } from '../utils/helper'
import Poly from '../utils/Poly-wave'
import { Matrix4, Quaternion, Vector3 } from 'three'
// 正弦型函数的图像性质 y=Asin(ωx+φ):
// A 影响的是正弦曲线的波动幅度
// φ 影响的是正弦曲线的平移
// ω 影响的是正弦曲线的周期，ω 越大，周期越小

/* x,z 方向的空间坐标极值 */
const [minPosX, maxPosX, minPosZ, maxPosZ] = [-0.7, 0.8, -1, 1]
/* x,z 方向的弧度极值 */
const [minAngX, maxAngX, minAngZ, maxAngZ] = [0, Math.PI * 4, 0, Math.PI * 2]

/* 比例尺：将空间坐标和弧度相映射 */
const scalerX = ScaleLinear(minPosX, minAngX, maxPosX, maxAngX)
const scalerZ = ScaleLinear(minPosZ, minAngZ, maxPosZ, maxAngZ)
/* 建立顶点集合 */
function crtVertices(offset = 0) {
  const vertices = []
  for (let z = minPosZ; z < maxPosZ; z += 0.04) {
    for (let x = minPosX; x < maxPosX; x += 0.03) {
      vertices.push(x, 0, z)
    }
  }
  return vertices
}

onMounted(() => {
  // canvas 画布
  const canvas = document.getElementById('canvas')
  canvas.width = document.querySelector('.container').clientWidth
  canvas.height = document.querySelector('.container').clientHeight

  // webgl画笔
  const gl = canvas.getContext('webgl')
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 顶点着色器
  // 用attribute定义顶点变量
  // 用uniform定义矩阵变量
  // 四维矩阵
  const vsSource = `
    attribute vec4 a_Position;
    //视图矩阵
    uniform mat4 u_ViewMatrix;
    void main(){
      gl_Position = u_ViewMatrix*a_Position;
      gl_PointSize=3.0;
    }
  `
  // 片元着色器
  const fsSource = `
      void main(){
        gl_FragColor=vec4(1.0,1.0,0.0,1.0);
      }
  `
  // 初始化着色器
  initShaders(gl, vsSource, fsSource)

  /* 视图矩阵 */
  const viewMatrix = new Matrix4().lookAt(
    new Vector3(0.2, 0.3, 1),
    new Vector3(0, 0, 0),
    new Vector3(0, 1, 0)
  )
  const wave = new Poly({
    gl,
    vertices: crtVertices(),
    uniforms: {
      u_ViewMatrix: {
        type: 'uniformMatrix4fv',
        value: viewMatrix.elements
      }
    }
  })
  function updateVertices(offset = 0) {
    const { vertices } = wave
    for (let i = 0; i < vertices.length; i += 3) {
      const [posX, posZ] = [vertices[i], vertices[i + 2]]
      const angZ = scalerZ(posZ)
      const Omega = 2
      const a = Math.sin(angZ) * 0.1 + 0.03
      const phi = scalerX(posX) + offset
      vertices[i + 1] = SinFn(a, Omega, phi)(angZ)
    }
  }
  let offset = 0
  !(function ani() {
    offset += 0.08
    updateVertices(offset)
    wave.updateBuffer()
    gl.clear(gl.COLOR_BUFFER_BIT)
    wave.draw()
    requestAnimationFrame(ani)
  })()
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
