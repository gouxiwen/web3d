<template>
  <div class="container">
    <button @click="handleClear">clear</button>
    <span>画笔尺寸</span>
    <button @click="() => handleChangeSize(10)">10</button>
    <button @click="() => handleChangeSize(20)">20</button>
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, getMousePosInWebgl } from '../utils/helper'

const mousedown = ref(false)
const glRef = ref()
let g_points = []

function handleChangeSize(size) {
  if (glRef.value) {
    const a_PointSize = glRef.value.getAttribLocation(glRef.value.program, 'a_PointSize')
    glRef.value.vertexAttrib1f(a_PointSize, size)
  }
}

function handleClear() {
  if (glRef.value) {
    glRef.value.clear(glRef.value.COLOR_BUFFER_BIT)
    g_points = []
  }
}

onMounted(() => {
  // canvas 画布
  const canvas = document.getElementById('canvas')
  canvas.width = document.querySelector('.container').clientWidth
  canvas.height = document.querySelector('.container').clientHeight
  // webgl画笔
  const gl = canvas.getContext('webgl')
  glRef.value = gl
  // vue里面用字符串拼接
  // 顶点着色器
  // 用attribute定义顶点变量
  const vsSource = `
    attribute vec4 a_Position;
    attribute float a_PointSize;
    void main(){
        gl_Position = a_Position;
        gl_PointSize = a_PointSize;
  }
  `
  // 片元着色器
  // precision mediump float;定义浮点数精度
  // 用uniform定义片元变量
  const fsSource = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
      gl_FragColor = u_FragColor;
  }
  `
  // 初始化着色器
  initShaders(gl, vsSource, fsSource)
  // 获取变量指针
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize')
  const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')
  gl.vertexAttrib1f(a_PointSize, 50.0)
  // 指定将要用来清理绘图区的颜色
  gl.clearColor(0, 0.0, 0.0, 1.0)
  // 清理绘图区
  gl.clear(gl.COLOR_BUFFER_BIT)
  canvas.addEventListener('mousedown', function (event) {
    mousedown.value = true
  })
  canvas.addEventListener('mouseup', function (event) {
    mousedown.value = false
  })

  canvas.addEventListener('mousemove', function (event) {
    if (mousedown.value) {
      const { x, y } = getMousePosInWebgl(event, canvas)
      const color = new Float32Array([Math.random(), Math.random(), Math.random(), 1.0])
      // 用类型数组代替数组，效率更高
      g_points.push({ x, y, color })
      gl.clear(gl.COLOR_BUFFER_BIT)
      g_points.forEach(({ x, y, color }) => {
        gl.vertexAttrib2f(a_Position, x, y)
        gl.drawArrays(gl.POINTS, 0, 1)
        gl.uniform4fv(u_FragColor, color)
      })
    }
  })
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
