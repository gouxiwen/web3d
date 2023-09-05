<template>
  <div>颜色-多点异色</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, getMousePosInWebgl } from '../../utils/helper'
//   const source = new Float32Array([
//     0, 0.2, 0, 1, 0, 0, 1,
//     -0.2, -0.1, 0, 0, 1, 0, 1,
//     0.2, -0.1, 0, 0, 0, 1, 1
// ]);
// 数据源：整个合而为一的数据source
// 元素字节数：32位浮点集合中每个元素的字节数
// 类目：一个顶点对应一个类目，也就是上面source中的每一行
// 系列：一个类目中所包含的每一种数据，比如顶点位置数据、顶点颜色数据
// 系列尺寸：一个系列所对应的向量的分量数目
// 类目尺寸：一个类目中所有系列尺寸的总和
// 类目字节数：一个类目的所有字节数量
// 系列元素索引位置：一个系列在一个类目中，以集合元素为单位的索引位置
// 系列字节索引位置：一个系列在一个类目中，以字节为单位的索引位置
// 顶点总数：数据源中的顶点总数
// vertexAttribPointer可以从数据源中按照条件获取不同的系列数据:
// void gl.vertexAttribPointer(index, size, type, normalized, stride, offset)
// index：attribute 变量，具体而言是指向存储attribute变量的空间的指针
// size：系列尺寸
// type：元素的数据类型
// normalized：是否归一化
// stride：类目字节数
// offset：系列索引位置
onMounted(() => {
  // canvas 画布
  const canvas = document.getElementById('canvas')
  canvas.width = document.querySelector('.container').clientWidth
  canvas.height = document.querySelector('.container').clientHeight
  // webgl画笔
  const gl = canvas.getContext('webgl')
  gl.clearColor(0, 0, 0, 1)
  // 顶点着色器
  // 用attribute定义顶点变量
  const vsSource = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main(){
      gl_Position = a_Position;
      gl_PointSize = 50.0;
      v_Color = a_Color;
    } 
  `
  // 片元着色器
  const fsSource = `
  precision mediump float;
  varying vec4 v_Color;
    void main() {
      gl_FragColor=v_Color;
    }
  `
  // 初始化着色器
  initShaders(gl, vsSource, fsSource)
  // //顶点数据
  // let points = [0, 0.2, 0, -0.2, -0.1, 0, 0.2, -0.1, 0]
  // //缓冲对象
  // const vertexBuffer = gl.createBuffer()
  // //绑定缓冲对象
  // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  // //写入数据
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW)
  // //获取attribute 变量
  // const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  // //修改attribute 变量
  // gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0)
  // //赋能-批处理
  // gl.enableVertexAttribArray(a_Position)

  // // 颜色数据
  // let colors = [1, 0, 0, 0, 1, 0, 0, 0, 1]
  // // 颜色缓冲对象
  // const colorBuffer = gl.createBuffer()
  // // 绑定缓冲对象
  // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  // // 写入数据
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
  // // 获取变量
  // const a_Color = gl.getAttribLocation(gl.program, 'a_Color')
  // // 修改变量
  // gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0)
  // // 开启批处理
  // gl.enableVertexAttribArray(a_Color)

  // 将顶点数据和颜色数据合并为source
  const source = new Float32Array([
    0, 0.2, 0, 1, 0, 0, 1, -0.2, -0.1, 0, 0, 1, 0, 1, 0.2, -0.1, 0, 0, 0, 1, 1
  ])
  //元素字节数
  const elementBytes = source.BYTES_PER_ELEMENT
  //系列尺寸
  const verticeSize = 3
  const colorSize = 4
  //类目尺寸
  const categorySize = verticeSize + colorSize
  //类目字节数
  const categoryBytes = categorySize * elementBytes
  //系列字节索引位置
  const verticeByteIndex = 0
  const colorByteIndex = verticeSize * elementBytes
  //顶点总数
  const sourseSize = source.length / categorySize

  //缓冲对象
  const sourceBuffer = gl.createBuffer()
  //绑定缓冲对象
  gl.bindBuffer(gl.ARRAY_BUFFER, sourceBuffer)
  //写入数据
  gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW)

  //获取attribute 变量
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  //修改attribute 变量
  gl.vertexAttribPointer(a_Position, verticeSize, gl.FLOAT, false, categoryBytes, verticeByteIndex)
  //赋能-批处理
  gl.enableVertexAttribArray(a_Position)

  //获取attribute 变量
  const a_Color = gl.getAttribLocation(gl.program, 'a_Color')
  //修改attribute 变量
  gl.vertexAttribPointer(a_Color, colorSize, gl.FLOAT, false, categoryBytes, colorByteIndex)
  //赋能-批处理
  gl.enableVertexAttribArray(a_Color)

  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.POINTS, 0, 3)
  gl.drawArrays(gl.TRIANGLES, 0, sourseSize)
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
