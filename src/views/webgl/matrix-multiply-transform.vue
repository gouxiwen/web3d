<template>
  <div>复合变换</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
import { initShaders } from '../../utils/helper'
import { Matrix4, Quaternion, Vector3 } from 'three'
// 复合变换：
// 一次变换就是用向量乘以变换矩阵，那复合变换就是用向量乘以第一个变换矩阵，得到的向量继续乘以下一个变换矩阵，以此类推
// 以上过程可以改为先用矩阵相乘得到的结果再乘以向量
// 当两个矩阵的每个元素相互等比时
// a*b=b*a
// 当两个矩阵的每个元素相互不等比时
// a*b!=b*a

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
  // 用uniform定义矩阵变量
  // 四维矩阵
  const vsSource = `
    attribute vec4 a_Position;
    uniform mat4 u_Matrix;
    void main(){
      gl_Position = u_Matrix*a_Position;
    }
  `
  // 片元着色器
  const fsSource = `
      void main(){
        gl_FragColor=vec4(1.0,1.0,0.0,1.0);
      }
  `
  // 初始化着色器
  initShaders(gl, vsSource, fsSource)

  const vertices = new Float32Array([0, 0.1, -0.1, -0.1, 0.1, -0.1])
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(a_Position)

  const u_Matrix = gl.getUniformLocation(gl.program, 'u_Matrix')
  gl.uniformMatrix4fv(u_Matrix, false, new Matrix4().elements)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  setTimeout(() => {
    // const mr = new Matrix4()
    // const mt = new Matrix4()
    // mr.makeRotationZ(Math.PI / 4)
    // mt.makeTranslation(0.3, 0, 0)
    // // 复合（矩阵相乘）,复合顺序不一样结果也可能不一样
    // const matrix = mr.multiply(mt).elements
    // gl.uniformMatrix4fv(u_Matrix, false, matrix)

    // 使用组合函数compose(position, quaternion, scale)
    const matrix = new Matrix4()
    const pos = new Vector3(0.3, 0, 0)
    const rot = new Quaternion()
    rot.setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 4)
    const scale = new Vector3(2, 0.5, 1)
    matrix.compose(pos, rot, scale)
    const u_Matrix = gl.getUniformLocation(gl.program, 'u_Matrix')
    gl.uniformMatrix4fv(u_Matrix, false, matrix.elements)

    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }, 1000)
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
