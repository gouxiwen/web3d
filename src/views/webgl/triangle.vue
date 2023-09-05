<template>
  <div>画三角形（一切面都是由三角形组成）</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, getMousePosInWebgl } from '../../utils/helper'

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
      //gl_PointSize = 20.0;
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
  // 设置顶点点位
  const vertices = new Float32Array([-0.2, 0.2, -0.2, -0.2, 0.2, 0.2, 0.2, -0.2])
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0) // 将缓冲区对象分配给attribute 变量
  gl.enableVertexAttribArray(a_Position) // 开启顶点数据的批处理功能
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  // gl.drawArrays(gl.POINTS, 0, 3) // 从第一个顶点（0）开始画三个（3）点（gl.POINTS），画点时需要设置顶点尺寸gl_PointSize
  // gl.drawArrays(gl.TRIANGLES, 0, 3) // 从第一个顶点（0）开始画三角形（gl.TRIANGLES）
  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4) // 从第一个顶点（0）开始画三角带（gl.TRIANGLE_STRIP）
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4) // 从第一个顶点（0）开始画三角扇形（gl.TRIANGLE_FAN）
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
