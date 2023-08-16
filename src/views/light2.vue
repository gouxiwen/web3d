<template>
  <div>光-纹理映射</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, imgPromise, createProgram } from '../utils/helper'
import {
  Matrix4,
  Vector3,
  Vector2,
  Spherical,
  Object3D,
  PerspectiveCamera,
  Ray,
  SphereGeometry
} from 'https://unpkg.com/three/build/three.module.js'
import OrbitControls from '../utils/OrbitControls.js'
import { Geo, Mat, Obj3D, Scene } from '../utils/my-three-plus'
import Geography from '../utils/Geography.js'
import Earth from '../utils/Earth.js'
import Rect from '../utils/Rect.js'
import earthImg from '../assets/images/earth.jpg'
import markImg from '../assets/images/mark.png'

// 顶点着色器
const vsSource = `
  attribute vec4 a_Position;
  attribute vec2 a_Pin;
  uniform mat4 u_PvMatrix;
  uniform mat4 u_ModelMatrix;
  varying vec2 v_Pin;
  void main(){
    gl_Position=u_PvMatrix*u_ModelMatrix*a_Position;
    v_Pin=a_Pin;
  }
  `
// 片元着色器
const fsSource = `
  precision mediump float;
  uniform sampler2D u_Sampler;
  varying vec2 v_Pin;
  void main(){
    gl_FragColor=texture2D(u_Sampler,v_Pin);
  }
  `

let gl, camera, scene, orbit
const init = () => {
  const canvas = document.getElementById('canvas')
  if (canvas) {
    // canvas 画布
    const canvas = document.getElementById('canvas')
    canvas.width = document.querySelector('.container').clientWidth
    canvas.height = document.querySelector('.container').clientHeight
    // webgl画笔
    gl = canvas.getContext('webgl')
    gl.clearColor(0, 0, 0, 1)
    gl.enable(gl.BLEND) // 开启透明度
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.enable(gl.DEPTH_TEST) // 深度测试可以解决物体的遮挡问题，不然后面的物体可能挡住前面的物体。

    // 球体
    const earth = new Earth(0.5, 64, 32)

    // 矩形面-标记点
    const rect = new Rect(0.02, 0.02, 0.5, 0)

    // 目标点
    const target = new Vector3()
    const rad = Math.PI / 180
    const geography = new Geography(earth.r, 116.404 * rad, 39.915 * rad)
    const modelMatrix = new Matrix4().setPosition(geography.position)
    //视点
    // const eye = new Vector3(2, 0, 0)
    // 让相机的视点直视标记点。
    const eye = geography.clone().setR(earth.r + 1).position
    const [fov, aspect, near, far] = [45, canvas.width / canvas.height, 0.1, 5]
    // 透视相机
    camera = new PerspectiveCamera(fov, aspect, near, far)
    camera.position.copy(eye)
    // 轨道控制器
    orbit = new OrbitControls({ camera, target, dom: canvas })

    // 场景
    scene = new Scene({ gl })
    //注册程序对象
    scene.registerProgram('map', {
      program: createProgram(gl, vsSource, fsSource),
      attributeNames: ['a_Position', 'a_Pin'],
      uniformNames: ['u_PvMatrix', 'u_ModelMatrix', 'u_Sampler']
    })

    //地球
    const matEarth = new Mat({
      program: 'map',
      data: {
        u_PvMatrix: {
          value: orbit.getPvMatrix().elements,
          type: 'uniformMatrix4fv'
        },
        u_ModelMatrix: {
          value: new Matrix4().elements,
          type: 'uniformMatrix4fv'
        }
      }
    })
    const geoEarth = new Geo({
      data: {
        a_Position: {
          array: earth.vertices,
          size: 3
        },
        a_Pin: {
          array: earth.uv,
          size: 2
        }
      },
      index: {
        array: earth.indexes
      }
    })

    // 标记点
    const matMark = new Mat({
      program: 'map',
      data: {
        u_PvMatrix: {
          value: orbit.getPvMatrix().elements,
          type: 'uniformMatrix4fv'
        },
        u_ModelMatrix: {
          value: modelMatrix.elements,
          type: 'uniformMatrix4fv'
        }
      }
    })
    const geoMark = new Geo({
      data: {
        a_Position: {
          array: rect.vertices,
          size: 3
        },
        a_Pin: {
          array: rect.uv,
          size: 2
        }
      },
      index: {
        array: rect.indexes
      }
    })

    //加载图片
    const promises = [earthImg, markImg].map((ele) => {
      const image = new Image()
      image.src = ele
      return imgPromise(image)
    })
    Promise.all(promises).then((imgs) => {
      matEarth.maps.u_Sampler = { image: imgs[0] }
      matMark.maps.u_Sampler = {
        image: imgs[1],
        format: gl.RGBA
      }
      scene.add(
        new Obj3D({
          geo: geoEarth,
          mat: matEarth
        })
      )
      scene.add(
        new Obj3D({
          geo: geoMark,
          mat: matMark
        })
      )
      render()
    })

    bindEvent(canvas)
  }
}

const bindEvent = (canvas) => {
  /* 取消右击菜单的显示 */
  canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault()
  })
  /* 指针按下时，设置拖拽起始位，获取轨道控制器状态。 */
  canvas.addEventListener('pointerdown', (event) => {
    orbit.pointerdown(event)
  })
  /* 指针移动时，若控制器处于平移状态，平移相机；若控制器处于旋转状态，旋转相机。 */
  canvas.addEventListener('pointermove', (event) => {
    orbit.pointermove(event)
  })
  /* 指针抬起 */
  canvas.addEventListener('pointerup', (event) => {
    orbit.pointerup(event)
  })
  /* 滚轮事件 */
  canvas.addEventListener('wheel', (event) => {
    orbit.wheel(event)
  })
}

// 连续渲染
function render() {
  orbit.getPvMatrix()
  scene.draw()
  requestAnimationFrame(render)
}

onMounted(() => {
  init()
})
</script>
<style scoped lang="less">
.container {
  height: calc(100vh - 18px);
}
</style>
