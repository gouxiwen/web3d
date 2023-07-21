<template>
  <div>封装异步绘图方法并应用，一条线段</div>
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

  // //实例化多边形
  const poly = new Poly({
    gl,
    types: ['POINTS', 'LINE_STRIP']
  })

  // 鼠标点击事件
  canvas.addEventListener('click', (event) => {
    const { x, y } = getMousePosInWebgl(event, canvas)
    poly.addVertice(x, y)
    gl.clear(gl.COLOR_BUFFER_BIT)
    poly.draw()
  })
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
