<template>
  <div>封装异步绘图方法并应用，多条线段</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, getMousePosInWebgl } from '../utils/helper'
import Poly from '../utils/Poly'
import Sky from '../utils/Sky'
import Compose from '../utils/Compose'
import Track from '../utils/Track'

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
  // varying变量可以传递给片元着色器
  const vsSource = `
      attribute vec4 a_Attr;
      varying float v_Alpha;
      void main(){
          gl_Position=vec4(a_Attr.x,a_Attr.y,0.0,1.0);
          gl_PointSize=a_Attr.z;
          v_Alpha=a_Attr.w;
      }
  `
  // 片元着色器
  // 通过v_Alpha接收来自顶点着色器的透明度，然后设置片元的颜色。
  const fsSource = `
      precision mediump float;
      varying float v_Alpha;
      void main(){
          float dist=distance(gl_PointCoord,vec2(0.5,0.5));
          if(dist<0.5){
            gl_FragColor=vec4(0.87,0.91,1.0,v_Alpha);
          }else{
            discard;
          }
      }
  `
  // 初始化着色器
  initShaders(gl, vsSource, fsSource)

  //夜空，管理多个多边形
  const sky = new Sky(gl)
  // 组合，管理多个track
  const compose = new Compose()
  //当前正在绘制的多边形
  let poly = null
  //鼠标划上的点
  let point = null

  //取消右击提示
  canvas.oncontextmenu = function () {
    return false
  }
  // 鼠标点击事件
  canvas.addEventListener('mousedown', (event) => {
    if (event.button === 2) {
      //右击删除顶点
      poly && popVertice()
    } else {
      const { x, y } = getMousePosInWebgl(event, canvas)
      if (poly) {
        //连续添加顶点
        addVertice(x, y)
      } else {
        //建立多边形
        crtPoly(x, y)
      }
    }
  })
  //鼠标移动
  canvas.addEventListener('mousemove', (event) => {
    const { x, y } = getMousePosInWebgl(event, canvas)
    point = hoverPoint(x, y)
    if (point) {
      canvas.style.cursor = 'pointer'
    } else {
      canvas.style.cursor = 'default'
    }
    if (poly) {
      const obj = poly.geoData[poly.geoData.length - 1]
      obj.x = x
      obj.y = y
    }
  })

  //删除最后一个顶点
  function popVertice() {
    poly.geoData.pop()
    compose.children.pop()
    poly = null
  }
  //创建多边形
  function crtPoly(x, y) {
    let o1 = point ? point : { x, y, pointSize: random(), alpha: 1 }
    const o2 = { x, y, pointSize: random(), alpha: 1 }
    poly = new Poly({
      size: 4,
      attrName: 'a_Attr',
      geoData: [o1, o2],
      types: ['POINTS', 'LINE_STRIP']
    })
    sky.add(poly)
    crtTrack(o1)
    crtTrack(o2)
  }

  function random() {
    return Math.random() * 8.0 + 3.0
  }
  function crtTrack(obj) {
    const { pointSize } = obj
    const track = new Track(obj)
    track.start = new Date()
    track.timeLen = 2000
    track.loop = true
    track.keyMap = new Map([
      [
        'pointSize',
        [
          [500, pointSize],
          [1000, 0],
          [1500, pointSize]
        ]
      ],
      [
        'alpha',
        [
          [500, 1],
          [1000, 0],
          [1500, 1]
        ]
      ]
    ])
    compose.add(track)
  }
  function addVertice(x, y) {
    const { geoData } = poly
    if (point) {
      geoData[geoData.length - 1] = point
    }
    let obj = { x, y, pointSize: random(), alpha: 1 }
    geoData.push(obj)
    crtTrack(obj)
  }
  function hoverPoint(mx, my) {
    for (let { geoData } of sky.children) {
      for (let obj of geoData) {
        if (poly && obj === poly.geoData[poly.geoData.length - 1]) {
          continue
        }
        const delta = {
          x: mx - obj.x,
          y: my - obj.y
        }
        const { x, y } = glToCssPos(delta, canvas)
        const dist = x * x + y * y
        if (dist < 100) {
          return obj
        }
      }
    }
    return null
  }
  function glToCssPos({ x, y }, { width, height }) {
    const [halfWidth, halfHeight] = [width / 2, height / 2]
    return {
      x: x * halfWidth,
      y: -y * halfHeight
    }
  }

  function ani() {
    compose.update(new Date())
    sky.updateVertices(['x', 'y', 'pointSize', 'alpha'])
    render()
    requestAnimationFrame(ani)
  }
  ani()

  // 渲染方法
  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    sky.draw()
  }
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
