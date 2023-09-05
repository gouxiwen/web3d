<template>
  <div>纹理</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, getMousePosInWebgl } from '../../utils/helper'
import Poly from '../../utils/Poly-texture'
// import img from '../assets/images/sky.jpg' // 非二次幂图像
import img from '../assets/images/erha.jpg'

onMounted(() => {
  // canvas 画布
  const canvas = document.getElementById('canvas')
  canvas.width = document.querySelector('.container').clientWidth
  canvas.height = document.querySelector('.container').clientHeight
  // webgl画笔
  const gl = canvas.getContext('webgl')
  gl.clearColor(0, 0, 0, 1)
  // 顶点着色器
  const vsSource = `
    attribute vec4 a_Position;
    attribute vec2 a_Pin;
    varying vec2 v_Pin;
    void main(){
      gl_Position = a_Position;
      v_Pin=a_Pin;
    } 
  `
  // 片元着色器
  const fsSource = `
    precision mediump float;
    uniform sampler2D u_Sampler;
    varying vec2 v_Pin;
    void main(){
      gl_FragColor=texture2D(u_Sampler,v_Pin);
    }
  `
  // 初始化着色器
  initShaders(gl, vsSource, fsSource)
  //数据源
  const source = new Float32Array([
    -0.5, 0.5, 0, 1, -0.5, -0.5, 0, 0.0, 0.5, 0.5, 1.0, 1, 0.5, -0.5, 1.0, 0.0
  ])

  const rect = new Poly({
    gl,
    source,
    type: 'TRIANGLE_STRIP',
    attributes: {
      a_Position: {
        size: 2,
        index: 0
      },
      a_Pin: {
        size: 2,
        index: 2
      }
    }
  })

  const image = new Image()
  image.src = img
  image.onload = function () {
    rect.maps = {
      u_Sampler: { image }
    }
    rect.updateMaps()
    render()
  }

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    rect.draw()
  }
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
