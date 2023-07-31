<template>
  <div>glsl语言实战-杂色</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, imgPromise } from '../utils/helper'
import Poly from '../utils/Poly-texture'

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
    void main(){
      gl_Position = a_Position;
    }
  `
  // 片元着色器
  const fsSource = `
    precision mediump float;
    uniform float u_Ang;
    float s=sin(u_Ang);
    float c=cos(u_Ang);
    mat2 m=mat2(
      c,s,
      -s,c
    );
    float rand(vec2 fragCoord){
      // vec2 a= m*vec2(0.1234,0.5678);
      // vec2 a= vec2(0,0.111); // 水平拉丝效果
      vec2 a= vec2(0.111,0); // 竖直拉丝效果
      // vec2 a= vec2(0.111,0.111); // 对角拉丝效果
      float n= dot(fragCoord,a);
      // return fract(tan(n)*10000.0);// 乘以10000然后取小数，结果更随机
      return fract(tan(n));
    }
    void main(){
      float f = rand(gl_FragCoord.xy);
      gl_FragColor = vec4(f, f, f, 1);
    }
  `
  // 初始化着色器
  initShaders(gl, vsSource, fsSource)
  const source = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1])
  const rect = new Poly({
    gl,
    source,
    type: 'TRIANGLE_STRIP',
    attributes: {
      a_Position: {
        size: 2,
        index: 0
      }
    },
    uniforms: {
      u_Ang: {
        type: 'uniform1f',
        value: 0
      }
    }
  })

  gl.clear(gl.COLOR_BUFFER_BIT)
  rect.draw()
  // let ang = 1
  // !(function ani() {
  //   ang++
  //   rect.uniforms.u_Ang.value = ang
  //   rect.updateUniform()
  //   gl.clear(gl.COLOR_BUFFER_BIT)
  //   rect.draw()
  //   requestAnimationFrame(ani)
  // })()
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
