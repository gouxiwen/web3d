<template>
  <div>封装异步绘图方法并应用</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, getMousePosInWebgl } from '../utils/helper'
import Poly from '../utils/Poly'

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
  const vsSource = `
    attribute vec4 a_Position;
    void main(){
      gl_Position = a_Position;
      gl_PointSize = 20.0;
    } 
  `
  // 片元着色器
  const fsSource = `
    void main() {
      gl_FragColor=vec4(1.0,1.0,0.0,1.0);
    }
  `
  // 初始化着色器
  initShaders(gl, vsSource, fsSource)

  const poly = new Poly({
    gl,
    vertices: [0, 0.2]
  })
  poly.draw(['POINTS'])

  setTimeout(() => {
    poly.addVertice(-0.2, -0.1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    poly.draw(['POINTS'])
  }, 1000)

  setTimeout(() => {
    gl.clear(gl.COLOR_BUFFER_BIT)
    poly.draw(['POINTS', 'LINE_STRIP'])
  }, 2000)
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
