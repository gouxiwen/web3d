<template>
  <div>画三角形（一切面都是由三角形组成）</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, getPosByMouse } from '../utils/helper'

onMounted(() => {
  // canvas 画布
  const canvas = document.getElementById('canvas')
  canvas.width = document.querySelector('.container').clientWidth
  canvas.height = document.querySelector('.container').clientHeight
  // webgl画笔
  const gl = canvas.getContext('webgl')
  gl.clearColor(0, 0, 0, 0)
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
  //顶点数据
  let points = [0, 0.2]
  //缓冲对象
  const vertexBuffer = gl.createBuffer()
  //绑定缓冲对象
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  //写入数据
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW)
  //获取attribute 变量
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  //修改attribute 变量
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
  //赋能-批处理
  gl.enableVertexAttribArray(a_Position)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.POINTS, 0, 1)
  // 异步绘制
  setTimeout(() => {
    points.push(-0.2, -0.1)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.POINTS, 0, 2)
  }, 1000)
  setTimeout(() => {
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.POINTS, 0, 2)
    gl.drawArrays(gl.LINE_STRIP, 0, 2)
  }, 2000)
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
  background: url('../assets/images/sky.jpg');
  background-size: cover;
  background-position: right bottom;
}
</style>
