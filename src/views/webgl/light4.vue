<template>
  <div>光-纹理映射-VR+陀螺仪</div>
  <div class="container">
    <canvas id="canvas"></canvas>
    <div class="wrapper">
      <div id="playBtn">开启VR之旅</div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, imgPromise, createProgram } from '../../utils/helper'
import {
  Matrix4,
  Vector3,
  Vector2,
  Spherical,
  Object3D,
  PerspectiveCamera,
  Ray,
  SphereGeometry
} from 'three'
import OrbitControls from '../../utils/OrbitControls.js'
import { Geo, Mat, Obj3D, Scene } from '../../utils/my-three-plus'
import Box from '../../utils/Box.js'
import Gyro from '../../utils/Gyro.js'
import magicImg from '../../assets/images/magic.jpg'

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
const isPC = () =>
  !navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
  )
let gl, camera, scene, orbit, endPos, endFov
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

    // 立方体
    const box = new Box(1, 1, 1)

    // 目标点
    const target = new Vector3()
    //视点-根据陀螺仪做欧拉旋转
    const eye = new Vector3(0.15, 0, 0.0001)
    // 透视相机
    const [fov, aspect, near, far] = [130, canvas.width / canvas.height, 0.01, 2]
    camera = new PerspectiveCamera(fov, aspect, near, far)
    // 上帝视角
    camera.position.set(0, 0.42, 0)
    endPos = camera.position.clone()
    endFov = fov
    // 轨道控制器
    orbit = new OrbitControls({
      camera,
      target,
      dom: canvas,
      enablePan: false,
      maxZoom: 15,
      minZoom: 0.4
    })

    // 场景
    scene = new Scene({ gl })
    //注册程序对象
    scene.registerProgram('map', {
      program: createProgram(gl, vsSource, fsSource),
      attributeNames: ['a_Position', 'a_Pin'],
      uniformNames: ['u_PvMatrix', 'u_ModelMatrix', 'u_Sampler']
    })

    //立方体
    const matBox = new Mat({
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
    const geoBox = new Geo({
      data: {
        a_Position: {
          array: box.vertices,
          size: 3
        },
        a_Pin: {
          array: box.uv,
          size: 2
        }
      },
      index: {
        array: box.indexes
      }
    })

    //加载图片
    const promises = [magicImg].map((ele) => {
      const image = new Image()
      image.src = ele
      return imgPromise(image)
    })
    Promise.all(promises).then((imgs) => {
      matBox.maps.u_Sampler = { image: imgs[0], magFilte: gl.LINEAR, minFilter: gl.LINEAR }
      scene.add(
        new Obj3D({
          geo: geoBox,
          mat: matBox
        })
      )
      render()
    })
    // 遮罩
    const wrapper = document.querySelector('.wrapper')
    // 按钮
    const btn = document.querySelector('#playBtn')
    // 陀螺仪
    const gyro = new Gyro({
      btn,
      noDevice: () => {
        btn.innerHTML = '您的设备里没有陀螺仪！'
      },
      reject: () => {
        btn.innerHTML = '请允许使用陀螺仪🌹'
      },
      error: () => {
        btn.innerHTML = '请求失败！'
      },
      init: () => {
        wrapper.style.display = 'none'
      },
      change: (euler) => {
        camera.position.copy(eye.clone().applyEuler(euler))
        orbit.updateCamera()
        orbit.resetSpherical()
        endFov = 100
        endPos.copy(eye.clone().applyEuler(euler))
      },
      onClick: () => {
        if (isPC()) {
          endPos.set(0.15, 0, 0.0001)
          endFov = 100
        }
      }
    })
    gyro.start()

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
    orbit.wheel(event, 'OrthographicCamera')
  })
}

function tween(ratio = 0.05) {
  //若当前设备为PC,缓动结束后就不再缓动，之后的变换交给轨道控制器
  if (isPC() && camera.fov < endFov + 1) {
    return
  }

  camera.position.lerp(endPos, ratio)
  camera.fov += (endFov - camera.fov) * ratio
  camera.updateProjectionMatrix()
  orbit.updateCamera()
  orbit.resetSpherical()
}

// 连续渲染
function render() {
  tween()
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
  .wrapper {
    display: flex;
    position: absolute;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    top: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 10;
  }
  #playBtn {
    padding: 24px 24px;
    border-radius: 24px;
    background-color: #00acec;
    text-align: center;
    color: #fff;
    cursor: pointer;
    font-size: 24px;
    font-weight: bold;
    border: 6px solid rgba(255, 255, 255, 0.7);
    box-shadow: 0 9px 9px rgba(0, 0, 0, 0.7);
  }
}
</style>
