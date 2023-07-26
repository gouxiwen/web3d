<template>
  <div>变换</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
import { initShaders, ScaleLinear } from '../utils/helper'

// 路径G顶点数据
const pathData = [
  0, 0, 0, 600, 600, 600, 600, 200, 200, 200, 200, 400, 300, 400, 300, 300, 500, 300, 500, 500, 100,
  500, 100, 100, 600, 100, 600, 0
]

onMounted(() => {
  // canvas 画布
  const canvas = document.getElementById('canvas')
  canvas.width = document.querySelector('.container').clientWidth
  canvas.height = document.querySelector('.container').clientHeight
  // 由路径顶点坐标分析可知，路径的宽高都是600，是一个正方形，所以将路径画到画布的一个正方形中
  //宽高比
  const ratio = canvas.width / canvas.height
  //正方形高度
  const rectH = 1.0
  //正方形宽度
  const rectW = rectH / ratio
  //正方形宽高的一半
  const [halfRectW, halfRectH] = [rectW / 2, rectH / 2]
  //两个极点
  const minX = -halfRectW
  const minY = -halfRectH
  const maxX = halfRectW
  const maxY = halfRectH
  //建立比例尺
  const scaleX = ScaleLinear(0, minX, 600, maxX)
  const scaleY = ScaleLinear(0, maxY, 600, minY)
  // 将路径G中的像素数据解析为webgl数据
  const glData = []
  for (let i = 0; i < pathData.length; i += 2) {
    glData.push(scaleX(pathData[i]), scaleY(pathData[i + 1]))
  }

  // webgl画笔
  const gl = canvas.getContext('webgl')
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 顶点着色器
  // 用attribute定义顶点变量
  // 用uniform定义转换变量
  // ----------------平移
  // const vsSource = `
  //   attribute vec4 a_Position;
  //   uniform vec4 u_Translation;
  //   void main(){
  //       gl_Position = a_Position+u_Translation;
  //   }
  // `
  // ----------------z轴旋转
  // const vsSource = `
  //   attribute vec4 a_Position;
  //   uniform float u_SinB;
  //   uniform float u_CosB;
  //   void main(){
  //       gl_Position.x=a_Position.x*u_CosB-a_Position.y*u_SinB;
  //       gl_Position.y=a_Position.y*u_CosB+a_Position.x*u_SinB;
  //       gl_Position.z=a_Position.z;
  //       gl_Position.w=1.0;
  //   }
  // `
  // ----------------缩放
  const vsSource = `
    attribute vec4 a_Position;
    uniform float u_Scale;
    void main(){
        gl_Position=vec4(vec3(a_Position)*u_Scale,1.0);
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

  // ----------------平移
  // const u_Translation = gl.getUniformLocation(gl.program, 'u_Translation')
  // gl.uniform4f(u_Translation, 0, 0.5, 0, 0)
  // // 动画
  // let y = 0
  // !(function ani() {
  //   y += 0.02
  //   if (y > 1) {
  //     y = -1
  //   }
  //   gl.uniform4f(u_Translation, 0, y, 0, 0)
  //   gl.clear(gl.COLOR_BUFFER_BIT)
  //   gl.drawArrays(gl.TRIANGLES, 0, 3)
  //   requestAnimationFrame(ani)
  // })()

  // ----------------旋转
  // const u_SinB = gl.getUniformLocation(gl.program, 'u_SinB')
  // const u_CosB = gl.getUniformLocation(gl.program, 'u_CosB')
  // let angle = 0.3
  // gl.uniform1f(u_SinB, Math.sin(angle))
  // gl.uniform1f(u_CosB, Math.cos(angle))
  // !(function ani() {
  //   angle += 0.01
  //   gl.uniform1f(u_SinB, Math.sin(angle))
  //   gl.uniform1f(u_CosB, Math.cos(angle))
  //   gl.clear(gl.COLOR_BUFFER_BIT)
  //   gl.drawArrays(gl.TRIANGLES, 0, 3)
  //   requestAnimationFrame(ani)
  // })()
  // ----------------缩放
  const u_Scale = gl.getUniformLocation(gl.program, 'u_Scale')
  gl.uniform1f(u_Scale, 1.0)
  let angle = 0
  !(function ani() {
    angle += 0.05
    const scale = Math.sin(angle) + 1
    gl.uniform1f(u_Scale, scale)
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
