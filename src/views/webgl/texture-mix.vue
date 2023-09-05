<template>
  <div>纹理-图层混合</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, imgPromise } from '../../utils/helper'
import Track from '../../utils/Track'
import Poly from '../../utils/Poly-texture'
// import img from '../assets/images/sky.jpg' // 非二次幂图像
import dress from '../assets/images/dress.jpg'
import maskDress from '../assets/images/mask-dress.jpg'
import p0 from '../assets/images/pattern0.jpg'
import p1 from '../assets/images/pattern1.jpg'
import p2 from '../assets/images/pattern2.jpg'
import p3 from '../assets/images/pattern3.jpg'
import p4 from '../assets/images/pattern4.jpg'

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
    attribute vec2 a_Pin;
    varying vec2 v_Pin;
    void main(){
      gl_Position = a_Position;
      v_Pin=a_Pin;
    } 
  `
  // 片元着色器
  const fsSource = `
    precision mediump float;
    uniform sampler2D u_Sampler;
    uniform sampler2D u_Pattern1;
    uniform sampler2D u_Pattern2;
    uniform sampler2D u_Mask;
    uniform float u_Ratio;
    varying vec2 v_Pin;
    void main(){
      vec4 o=texture2D(u_Sampler,v_Pin);
      vec4 p1=texture2D(u_Pattern1,v_Pin);
      vec4 p2=texture2D(u_Pattern2,v_Pin);
      vec4 m=texture2D(u_Mask,v_Pin);
      vec4 p3=vec4(1,1,1,1);
      if(m.x>0.5){
        p3=mix(p1,p2,u_Ratio);
      }
      gl_FragColor=p3*o;
    }
  `
  // 初始化着色器
  initShaders(gl, vsSource, fsSource)
  //数据源
  const source = new Float32Array([
    -0.4, 0.8, 0, 1, -0.4, -0.8, 0, 0, 0.4, 0.8, 1, 1, 0.4, -0.8, 1, 0
  ])
  let n = 0
  let len = 5
  const obj = { ratio: 0 }
  let track = null

  const rect = new Poly({
    gl,
    source,
    type: 'TRIANGLE_STRIP',
    uniforms: {
      u_Ratio: {
        type: 'uniform1f',
        value: obj.ratio
      }
    },
    attributes: {
      a_Position: {
        size: 2,
        index: 0
      },
      a_Pin: {
        size: 2,
        index: 2
      }
    }
  })
  const originImg = new Image()
  originImg.src = dress

  const mask = new Image()
  mask.src = maskDress

  Promise.all([imgPromise(originImg), imgPromise(mask)]).then(() => {
    rect.maps = {
      u_Sampler: { image: originImg },
      u_Mask: { image: mask }
    }
    loadImg()
  })

  function loadImg() {
    n++
    const i1 = n % len
    const i2 = (n + 1) % len

    const imgMap = {
      0: p0,
      1: p1,
      2: p2,
      3: p3,
      4: p4
    }
    const pattern1 = new Image()
    pattern1.src = imgMap[i1]

    const pattern2 = new Image()
    pattern2.src = imgMap[i2]

    Promise.all([imgPromise(pattern1), imgPromise(pattern2)]).then(() => {
      changeImg(pattern1, pattern2)
      ani()
    })
  }

  // 加载纹理图案
  function changeImg(...imgs) {
    obj.ratio = 0
    rect.maps.u_Pattern1 = { image: imgs[0] }
    rect.maps.u_Pattern2 = { image: imgs[1] }
    rect.updateMaps()
    track = new Track(obj)
    track.start = new Date()
    track.timeLen = 1500
    track.onEnd = loadImg
    track.keyMap = new Map([
      [
        'ratio',
        [
          [0, 0],
          [700, 1]
        ]
      ]
    ])
  }
  /* 动画 */
  function ani() {
    track.update(new Date())
    rect.uniforms.u_Ratio.value = obj.ratio
    rect.updateUniform()
    render()
    requestAnimationFrame(ani)
  }

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    rect.draw()
  }
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
