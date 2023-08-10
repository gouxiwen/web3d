<template>
  <div>三维世界-顶点索引</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, imgPromise } from '../utils/helper'
import {
  Matrix4,
  Vector3,
  Vector2,
  Spherical,
  Object3D,
  PerspectiveCamera
} from 'https://unpkg.com/three/build/three.module.js'
import Poly from '../utils/Poly-texture'
import OrbitControls from '../utils/OrbitControls.js'

// 顶点索引
// 画正方体
// js实现
// const verticeLib = [
//     1.0, 1.0, 1.0,
//     -1.0, 1.0, 1.0,
//     -1.0, -1.0, 1.0,
//     1.0, -1.0, 1.0,
//     1.0, -1.0, -1.0,
//     1.0, 1.0, -1.0,
//     -1.0, 1.0, -1.0,
//     -1.0, -1.0, -1.0,
// ];

// const indices = [
//     0, 1,
//     1, 2,
//     2, 3,
//     3, 0,

//     0, 5,
//     1, 6,
//     2, 7,
//     3, 4,

//     4, 5,
//     5, 6,
//     6, 7,
//     7, 4
// ];

// const arr = [];
// indices.forEach(n => {
//     const i = n * 3
//     arr.push(
//         verticeLib[i] / 5,
//         verticeLib[i + 1] / 5,
//         verticeLib[i + 2] / 5,
//     )
// })
// const vertices = new Float32Array(arr)

// webgl库实现
// 1. 把顶点索引写入webgl缓冲区
// //建立缓冲对象
// const indicesBuffer = gl.createBuffer();
// //在ELEMENT_ARRAY_BUFFER上绑定缓冲对象
// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
// //将顶点索引数据写入缓冲对象
// gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
// 2. 改变绘图方式,drawArrays -> drawElements
// gl.clear(gl.COLOR_BUFFER_BIT);
// // gl.drawArrays(gl.LINES, 0, indices.length);
// gl.drawElements(
//     gl.LINES,
//     indices.length,
//     gl.UNSIGNED_BYTE,
//     0
// )

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
    attribute vec4 a_Color;
    uniform mat4 u_PvMatrix;
    uniform mat4 u_ModelMatrix;
    varying vec4 v_Color;
    void main(){
      gl_Position = u_PvMatrix*u_ModelMatrix*a_Position;
      v_Color=a_Color;
    }
  `
  // 片元着色器
  const fsSource = `
    precision mediump float;
    varying vec4 v_Color;
    void main(){
      gl_FragColor=v_Color;
    }
  `
  // 初始化着色器
  initShaders(gl, vsSource, fsSource)
  gl.clearColor(0, 0, 0, 1)
  gl.enable(gl.DEPTH_TEST) // 深度测试可以解决物体的遮挡问题，不然后面的物体可能挡住前面的物体。
  /* 透视相机 */
  const eye = new Vector3(1, 2, 3)
  const target = new Vector3(0, 0, 0)
  const up = new Vector3(0, 1, 0)
  const [fov, aspect, near, far] = [45, canvas.width / canvas.height, 1, 20]
  const camera = new PerspectiveCamera(fov, aspect, near, far)
  camera.position.copy(eye)

  /* 实例化轨道控制器 */
  const orbit = new OrbitControls({
    camera,
    target,
    dom: canvas,
    render
  })
  /* 取消右击菜单的显示 */
  canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault()
  })
  /* 指针按下时，设置拖拽起始位，获取轨道控制器状态。 */
  canvas.addEventListener('pointerdown', (event) => {
    orbit.pointerdown(event)
  })
  /* 指针移动时，若控制器处于平移状态，平移相机；若控制器处于旋转状态，旋转相机。 */
  canvas.addEventListener('pointermove', (event) => {
    orbit.pointermove(event)
  })
  /* 指针抬起 */
  canvas.addEventListener('pointerup', (event) => {
    orbit.pointerup(event)
  })
  /* 滚轮事件 */
  canvas.addEventListener('wheel', (event) => {
    orbit.wheel(event)
  })

  // 声明顶点数据vertices 和顶点索引indexes。
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  const vertices = new Float32Array([
    1,
    1,
    1,
    1,
    0,
    0, // v0
    -1,
    1,
    1,
    0,
    1,
    0, // v1
    -1,
    -1,
    1,
    0,
    0,
    1, // v2
    1,
    -1,
    1,
    1,
    1,
    0, // v3
    1,
    -1,
    -1,
    0,
    1,
    1, // v4
    1,
    1,
    -1,
    1,
    0,
    1, // v5
    -1,
    1,
    -1,
    1,
    1,
    1, // v6
    -1,
    -1,
    -1,
    0,
    0,
    0 // v7
  ])

  const indexes = new Uint8Array([
    0,
    1,
    2,
    0,
    2,
    3, // front
    0,
    3,
    4,
    0,
    4,
    5, // right
    0,
    5,
    6,
    0,
    6,
    1, // up
    1,
    6,
    7,
    1,
    7,
    2, // left
    7,
    4,
    3,
    7,
    3,
    2, // down
    4,
    7,
    6,
    4,
    6,
    5 // back
  ])

  // 将顶点数据写入缓冲区，并将其中的点位和颜色数据分别分配给a_Position 和a_Color
  //元素字节数
  const elementBytes = vertices.BYTES_PER_ELEMENT
  const FSIZE = vertices.BYTES_PER_ELEMENT
  //系列尺寸
  const verticeSize = 3
  const colorSize = 3
  //类目尺寸
  const categorySize = verticeSize + colorSize
  //类目字节数
  const categoryBytes = categorySize * elementBytes
  //系列字节索引位置
  const verticeByteIndex = 0
  const colorByteIndex = verticeSize * elementBytes

  /* 顶点缓冲区 */
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  // 将顶点缓冲区里的点位数据分配给a_Position
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  gl.vertexAttribPointer(a_Position, verticeSize, gl.FLOAT, false, categoryBytes, verticeByteIndex)
  gl.enableVertexAttribArray(a_Position)

  // 将顶点缓冲区里的颜色数据分配给a_Color
  const a_Color = gl.getAttribLocation(gl.program, 'a_Color')
  gl.vertexAttribPointer(a_Color, colorSize, gl.FLOAT, false, categoryBytes, colorByteIndex)
  gl.enableVertexAttribArray(a_Color)

  // 将顶点索引写入缓冲区。
  // 建立缓冲区对象
  const indexesBuffer = gl.createBuffer()
  //把缓冲区绑定到webgl 上下文对象上
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexesBuffer)
  // 往缓冲区写数据
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexes, gl.STATIC_DRAW)

  // 模型矩阵
  const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
  const modelMatrix = new Matrix4()
  modelMatrix.makeScale(0.5, 0.5, 0.5)
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

  // 投影视图矩阵
  const u_PvMatrix = gl.getUniformLocation(gl.program, 'u_PvMatrix')
  gl.uniformMatrix4fv(u_PvMatrix, false, orbit.getPvMatrix().elements)

  function render() {
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
    gl.uniformMatrix4fv(u_PvMatrix, false, orbit.getPvMatrix().elements)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawElements(gl.TRIANGLES, indexes.length, gl.UNSIGNED_BYTE, 0)
  }
  !(function ani() {
    modelMatrix.multiply(new Matrix4().makeRotationY(0.05))
    render()
    requestAnimationFrame(ani)
  })()
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
