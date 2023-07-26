<template>
  <div>纹理</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, getMousePosInWebgl } from '../utils/helper'
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
    -0.5, 0.5, 0.0, 2.0, -0.5, -0.5, 0.0, 0.0, 0.5, 0.5, 2.0, 2.0, 0.5, -0.5, 2.0, 0.0
  ])
  //元素字节数
  const elementBytes = source.BYTES_PER_ELEMENT
  //系列尺寸
  const posSize = 2
  const PinSize = 2
  //类目尺寸
  const categorySize = posSize + PinSize
  //类目字节数
  const categoryBytes = categorySize * elementBytes
  //系列字节索引位置
  const posByteIndex = 0
  const pinByteIndex = posSize * elementBytes
  //顶点总数
  const sourceSize = source.length / categorySize
  const sourceBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, sourceBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW)

  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  gl.vertexAttribPointer(a_Position, posSize, gl.FLOAT, false, categoryBytes, posByteIndex)
  gl.enableVertexAttribArray(a_Position)

  const a_Pin = gl.getAttribLocation(gl.program, 'a_Pin')
  gl.vertexAttribPointer(a_Pin, PinSize, gl.FLOAT, false, categoryBytes, pinByteIndex)
  gl.enableVertexAttribArray(a_Pin)

  //对纹理图像垂直翻转
  // 栅格坐标系y方向与uv坐标系相反
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)

  //纹理单元
  gl.activeTexture(gl.TEXTURE0)

  //纹理对象
  const texture = gl.createTexture()
  //把纹理对象装进纹理单元里
  gl.bindTexture(gl.TEXTURE_2D, texture)

  //image 对象
  const image = new Image()
  image.src = img
  image.onload = function () {
    showMap()
  }

  //贴图
  function showMap() {
    //配置纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
    //配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    // 非二次幂图像源的显示
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE) // s方向，等于u方向
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE) // t方向，等于t方向
    //获取u_Sampler
    const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')
    //将0号纹理分配给着色器，0 是纹理单元编号
    gl.uniform1i(u_Sampler, 0)
    //渲染
    render()
  }

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, sourceSize)
  }
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
