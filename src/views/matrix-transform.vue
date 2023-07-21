<template>
  <div>矩阵变换</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
import { initShaders } from '../utils/helper'
import { Matrix4 } from 'https://unpkg.com/three/build/three.module.js'
// 点旋转公式：
// 点A(ax,ay)围绕z轴旋β度,其旋转后的位置是点B(bx,by)，则：
// bx=cosβ*ax-sinβ*ay
// by=sinβ*ax+cosβ*ay

// 向量乘法：
// 向量(a,b)乘以向量v(x,y)的结果是：
// a*x+b*y

// 矩阵乘向量：
// 矩阵可以认为是由多维向量构成的集合，矩阵乘向量就是矩阵里的向量分别乘向量

// 行主序和列主序：
// 矩阵按照向量的横竖方向又分为行主序和列主序，其中webgl是烈主序，数学中是行主序

// 由上可以知道，webgl中想要通过矩阵旋转一个点，可以在顶点着色器中定义一个行主序矩阵，然后和该点相乘
// 如：
//  mat2 m2=mat2(
//   cosB, sinB,
//   -sinB,cosB
//   );

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
  // 二维矩阵
  // const vsSource = `
  //   attribute vec4 a_Position;
  //   uniform mat2 u_Matrix;
  //   void main(){
  //     gl_Position = vec4(
  //       u_Matrix*vec2(a_Position),
  //       a_Position.z,a_Position.w
  //     );
  //   }
  // `
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
  let angle = 0.2,
    x = 0,
    y = 0,
    z = 0,
    scalex = 1,
    scaley = 1,
    scalez = 1
  const matrix4 = new Matrix4()
  !(function ani() {
    angle += 0.02
    const [sinB, cosB] = [Math.sin(angle), Math.cos(angle)]
    // 二维矩阵-z轴旋转
    // const matrix = [cosB, sinB, -sinB, cosB]
    // gl.uniformMatrix2fv(u_Matrix, false, matrix)
    // 四维矩阵-z轴旋转
    // cosB, sinB, 0.0, 0.0,
    // -sinB, cosB, 0.0, 0.0,
    // 0.0, 0.0, 1.0, 0.0,
    // 0.0, 0.0, 0.0, 1.0
    // const matrix = [
    //   cosB,
    //   sinB,
    //   0.0,
    //   0.0,
    //   -sinB,
    //   cosB,
    //   0.0,
    //   0.0,
    //   0.0,
    //   0.0,
    //   1.0,
    //   0.0,
    //   0.0,
    //   0.0,
    //   0.0,
    //   1.0
    // ]
    // 四维矩阵-平移
    // 1.0, 0.0, 0.0,0.0,
    // 0.0, 1.0, 0.0,0.0,
    // 0.0, 0.0, 1.0,0.0,
    // x,   y,   z,  1.0
    // x += 0.01
    // if (x > 1) {
    //   x = -1
    // }
    // y += 0.01
    // if (y > 1) {
    //   y = -1
    // }
    // z += 0.01
    // if (z > 1) {
    //   z = -1
    // }
    // const matrix = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, x, y, z, 1.0]
    // 四维矩阵-缩放
    // scalex, 0.0, 0.0,0.0,
    // 0.0, scaley, 0.0,0.0,
    // 0.0, 0.0, scalez,0.0,
    // 0.0, 0.0, 0.0,1.0
    // scalex = Math.sin(angle) + 1
    // scaley = Math.sin(angle) + 1
    // const matrix = [
    //   scalex,
    //   0.0,
    //   0.0,
    //   0.0,
    //   0.0,
    //   scaley,
    //   0.0,
    //   0.0,
    //   0.0,
    //   0.0,
    //   scalez,
    //   0.0,
    //   0.0,
    //   0.0,
    //   0.0,
    //   1.0
    // ]
    // 使用矩阵库
    matrix4.makeRotationZ(angle)
    const matrix = matrix4.elements
    gl.uniformMatrix4fv(u_Matrix, false, matrix)

    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    requestAnimationFrame(ani)
  })()
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
