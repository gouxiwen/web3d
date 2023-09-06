<template>
  <div>多着色器</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { createProgram } from '../../utils/helper'
import img from '../../assets/images/erha.jpg'

onMounted(() => {
  // canvas 画布
  const canvas = document.getElementById('canvas')
  canvas.width = document.querySelector('.container').clientWidth
  canvas.height = document.querySelector('.container').clientHeight
  // webgl画笔
  const gl = canvas.getContext('webgl')
  gl.clearColor(0, 0, 0, 1)
  // 着纯色
  const solidVsSource = `
    attribute vec4 a_Position;
    void main(){
      gl_Position = a_Position;
    }
  `

  const solidFsSource = `
    precision mediump float;
    uniform float u_Time;
    void main(){
      float r=(sin(u_Time/200.0)+1.0)/2.0;
      gl_FragColor=vec4(r,0.7,0.4,1);
    }
  `
  // 着纹理
  const textureVsSource = `
    attribute vec4 a_Position;
    attribute vec2 a_Pin;
    varying vec2 v_Pin;
    void main(){
      gl_Position = a_Position;
      v_Pin=a_Pin;
    }
  `
  const textureFsSource = `
    precision mediump float;
    uniform sampler2D u_Sampler;
    varying vec2 v_Pin;
    void main(){
      gl_FragColor=texture2D(u_Sampler,v_Pin);
    }
  `
  let solidProgram,
    solidVertexBuffer,
    solidPosition,
    solidTime = null
  let textureProgram,
    textureVertexBuffer,
    texturePosition = null
  let pinBuffer,
    pin = null

  function initSolid() {
    /* 1.建立程序对象*/
    solidProgram = createProgram(gl, solidVsSource, solidFsSource)
    gl.useProgram(solidProgram)

    /* 2.用当前的程序对象绘制图形 */
    const solidVertices = new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, -0.5])
    solidVertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, solidVertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, solidVertices, gl.STATIC_DRAW)
    solidPosition = gl.getAttribLocation(solidProgram, 'a_Position')
    gl.vertexAttribPointer(solidPosition, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(solidPosition)

    solidTime = gl.getUniformLocation(solidProgram, 'u_Time')

    /* gl.clear(gl.COLOR_BUFFER_BIT)
       gl.drawArrays(gl.TRIANGLES, 0, 3) */
  }
  function initTexture(image) {
    /* 1.建立程序对象，并应用 */
    textureProgram = createProgram(gl, textureVsSource, textureFsSource)
    gl.useProgram(textureProgram)

    /* 2.用当前的程序对象绘制图形 */
    // 顶点
    const textureVertices = new Float32Array([0.5, 0.5, -0.5, 0.5, 0.5, -0.5])
    textureVertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, textureVertices, gl.STATIC_DRAW)
    texturePosition = gl.getAttribLocation(textureProgram, 'a_Position')
    gl.vertexAttribPointer(texturePosition, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(texturePosition)
    // 图钉
    const pins = new Float32Array([1, 1, 0, 1, 1, 0])
    pinBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, pinBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, pins, gl.STATIC_DRAW)
    pin = gl.getAttribLocation(textureProgram, 'a_Pin')
    gl.vertexAttribPointer(pin, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(pin)
    // 纹理
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.activeTexture(gl.TEXTURE0)
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    const u_Sampler = gl.getUniformLocation(textureProgram, 'u_Sampler')
    gl.uniform1i(u_Sampler, 0)

    // gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  function render(time = 0) {
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(solidProgram)
    gl.bindBuffer(gl.ARRAY_BUFFER, solidVertexBuffer)
    gl.vertexAttribPointer(solidPosition, 2, gl.FLOAT, false, 0, 0)
    gl.uniform1f(solidTime, time)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    gl.useProgram(textureProgram)
    gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexBuffer)
    gl.vertexAttribPointer(texturePosition, 2, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, pinBuffer)
    gl.vertexAttribPointer(pin, 2, gl.FLOAT, false, 0, 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    requestAnimationFrame(render)
  }
  const image = new Image()
  image.src = img
  image.onload = function () {
    initSolid()
    initTexture(image)
    render()
  }
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
