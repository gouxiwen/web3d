<template>
  <div>用鼠标点击可以添加星星且有闪烁效果</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, getMousePosInWebgl } from '../../utils/helper'
import Compose from '../../utils/Compose'
import Track from '../../utils/Track'
onMounted(() => {
  // canvas 画布
  const canvas = document.getElementById('canvas')
  canvas.width = document.querySelector('.container').clientWidth
  canvas.height = document.querySelector('.container').clientHeight
  // webgl画笔
  const gl = canvas.getContext('webgl')
  gl.clearColor(0, 0, 0, 0)
  // 顶点着色器
  // 用attribute定义顶点变量
  const vsSource = `
    attribute vec4 a_Position;
    attribute float a_PointSize;
    void main(){
        gl_Position = a_Position;
        gl_PointSize = a_PointSize;
  }`
  // 片元着色器
  // precision mediump float;定义浮点数精度
  // 用uniform定义片元变量
  // distance内置计算距离函数
  // discard丢弃
  const fsSource = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
        if(dist < 0.5) {
            gl_FragColor = u_FragColor;
        } else {
            discard;
        }
    }
  `
  // 初始化着色器
  initShaders(gl, vsSource, fsSource)
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize')
  const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')
  const compose = new Compose()
  const stars = []
  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    stars.forEach(({ x, y, s, a }) => {
      gl.vertexAttrib2f(a_Position, x, y)
      gl.vertexAttrib1f(a_PointSize, s)
      gl.uniform4fv(u_FragColor, new Float32Array([0.87, 0.92, 1, a]))
      gl.drawArrays(gl.POINTS, 0, 1)
    })
  }

  function ani() {
    compose.update(new Date())
    render()
    requestAnimationFrame(ani)
  }
  canvas.addEventListener('click', function (event) {
    const { x, y } = getMousePosInWebgl(event, canvas)
    const a = 1
    const s = Math.random() * 5 + 2
    const obj = { x, y, s, a }
    stars.push(obj)

    const track = new Track(obj)
    track.start = new Date()
    track.keyMap = new Map([
      [
        'a',
        [
          [500, a],
          [1000, 0],
          [1500, a]
        ]
      ]
    ])
    track.timeLen = 2000
    track.loop = true
    compose.add(track)
    ani()
  })
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
  background: url('../../assets/images/sky.jpg');
  background-size: cover;
  background-position: right bottom;
}
</style>
