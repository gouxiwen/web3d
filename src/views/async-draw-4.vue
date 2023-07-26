<template>
  <div>由图形生成面</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
import { initShaders, ScaleLinear } from '../utils/helper'
import Poly from '../utils/Poly'
import ShapeGeo from '../utils/ShapeGeo'

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
  const vsSource = `
      attribute vec4 a_Position;
      void main(){
        gl_Position = a_Position;
        gl_PointSize = 10.0;
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
  const path = new Poly({
    gl,
    vertices: glData,
    types: ['POINTS', 'LINE_LOOP']
  })
  path.draw()

  const shapeGeo = new ShapeGeo(glData)
  const face = new Poly({
    gl,
    vertices: shapeGeo.vertices,
    types: ['TRIANGLES']
  })
  face.draw()
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
