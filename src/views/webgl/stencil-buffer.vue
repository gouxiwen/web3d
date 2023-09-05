<template>
  <div>模板缓冲区</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, getMousePosInWebgl } from '../../utils/helper'

onMounted(() => {
  // canvas 画布
  const canvas = document.getElementById('canvas')
  canvas.width = document.querySelector('.container').clientWidth
  canvas.height = document.querySelector('.container').clientHeight

  // 顶点着色器
  // 用attribute定义顶点变量
  const vsSource = `
  attribute vec4 a_Position;
  void main(){
        //点位
        gl_Position=vec4(vec3(a_Position),1);
        //尺寸
        gl_PointSize=a_Position.w;
  }
  `
  // 片元着色器
  const fsSource = `
  precision mediump float;
  void main(){
        float dist=distance(gl_PointCoord,vec2(0.5,0.5));
        if(dist<0.5){
          gl_FragColor=vec4(0,0.7,0.9,1);
        }else{
          discard;
        }
  }
  `
  //三维画笔--要打开模板测试
  const gl = canvas.getContext('webgl', { stencil: true })
  gl.enable(gl.STENCIL_TEST)
  gl.enable(gl.DEPTH_TEST)

  //初始化着色器
  initShaders(gl, vsSource, fsSource)

  // 定义背景色，默认为(0,0,0,0)
  gl.clearColor(1, 0.95, 0.9, 1.0)
  // 定义模板缓冲区的背景值，默认为0，这不是颜色，就是一个模板参考值
  gl.clearStencil(0)
  gl.clearDepth(1)
  // 用定义好的背景色理缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  //获取attribute 变量
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  //缓冲对象
  const vertexBuffer = gl.createBuffer()
  //绑定缓冲对象
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  //修改attribute 变量
  gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, 0, 0)
  //赋能-批处理
  gl.enableVertexAttribArray(a_Position)
  //清空缓冲区
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  /* 初始模板 */
  gl.stencilFunc(gl.ALWAYS, 1, 0xff)
  gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE)
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0.5, 200]), gl.STATIC_DRAW)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  gl.colorMask(false, false, false, false)
  gl.drawArrays(gl.POINTS, 0, 1)
  gl.colorMask(true, true, true, true)

  /* 模板2 */
  gl.stencilFunc(gl.ALWAYS, 1, 0xff)
  gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT)
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      //0.2<0.5通过深度测试
      0, -0.2, 0.2, 200,
      //0.8>0.5不通过深度测试
      0, 0.05, 0.8, 100
    ]),
    gl.STATIC_DRAW
  )
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  gl.colorMask(false, false, false, false)
  gl.drawArrays(gl.POINTS, 0, 2)
  gl.colorMask(true, true, true, true)

  // 绘图
  gl.disable(gl.DEPTH_TEST)
  gl.stencilFunc(gl.EQUAL, 1, 0xff)
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0.05, 0.8, 100]), gl.STATIC_DRAW)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.drawArrays(gl.POINTS, 0, 1)
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
  background: url('../assets/images/sky.jpg');
  background-size: cover;
  background-position: right bottom;
}
</style>
