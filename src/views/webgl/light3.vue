<template>
  <div>光-纹理映射-VR</div>
  <div class="container">
    <canvas id="canvas"></canvas>
    <div class="wrapper">
      <div id="playBtn">开启VR之旅</div>
    </div>
    <div id="mark">标记点</div>
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
import Geography from '../../utils/Geography.js'
import Earth from '../../utils/Earth.js'
import Gyro from '../../utils/Gyro.js'
import roomImg0 from '../../assets/images/room0.jpg'
import roomImg1 from '../../assets/images/room1.jpg'
import roomImg2 from '../../assets/images/room2.jpg'
import roomImg3 from '../../assets/images/room3.jpg'

const imgArr = [roomImg0, roomImg1, roomImg2, roomImg3]

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
let gl,
  earth,
  target,
  camera,
  scene,
  orbit,
  endPos,
  endFov,
  pvMatrix,
  mark,
  markWp = null
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
    earth = new Earth(0.5, 64, 32)

    // 目标点
    target = new Vector3()
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

    //投影视图矩阵
    pvMatrix = orbit.getPvMatrix()
    // 标记
    mark = document.querySelector('#mark')

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

    //图片序号
    let level = 0
    //加载图片
    loadImg()
    function loadImg() {
      const image = new Image()
      image.src = imgArr[level]
      image.onload = function () {
        if (level === 0) {
          firstRender(image)
        } else {
          //更新贴图
          matEarth.setMap('u_Sampler', { image })
        }
        if (level < 3) {
          level++
          loadImg()
        }
      }
    }
    // 第一次渲染
    function firstRender(image) {
      btn.innerHTML = '开启VR之旅'
      matEarth.maps.u_Sampler = {
        image,
        magFilte: gl.LINEAR,
        minFilter: gl.LINEAR
      }
      scene.add(
        new Obj3D({
          geo: geoEarth,
          mat: matEarth
        })
      )
      render()
    }
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
        endFov = 60
        endPos.copy(eye.clone().applyEuler(euler))
      },
      onClick: () => {
        if (isPC()) {
          endPos.set(0.15, 0, 0.0001)
          endFov = 60
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
    updateMarkCp()
  })
  /* 指针抬起 */
  canvas.addEventListener('pointerup', (event) => {
    orbit.pointerup(event)
  })
  /* 滚轮事件 */
  canvas.addEventListener('wheel', (event) => {
    orbit.wheel(event, 'OrthographicCamera')
    updateMarkCp()
  })
  /* 添加标记点 */
  canvas.addEventListener('dblclick', (event) => {
    addMark(event)
  })
}

// 获取鼠标世界位
function worldPos({ clientX, clientY }) {
  const [hw, hh] = [canvas.width / 2, canvas.height / 2]
  // 裁剪空间位
  const cp = new Vector3((clientX - hw) / hw, -(clientY - hh) / hh, 0)
  // 鼠标在世界坐标系中的位置
  return cp.applyMatrix4(pvMatrix.clone().invert())
}

function addMark(event) {
  mark.style.display = 'block'
  //鼠标点的世界坐标
  const A = worldPos(event, canvas, pvMatrix)
  //获取标记点的世界坐标
  markWp = getMarkWp(camera.position, A, target, earth.r)
  //设置标记点的canvas坐标位
  setMarkCp(event.clientX, event.clientY)
}

/* 获取射线和球体的交点
  E 射线起点-视点
  A 射线目标点
  O 球心
  r 半径
*/
function getMarkWp(E, A, O, r) {
  const v = A.clone().sub(E).normalize()
  const OE = E.clone().sub(O)
  //b=2v·OE
  const b = v.clone().multiplyScalar(2).dot(OE)
  //c=OE²-r²
  const c = OE.clone().dot(OE) - r * r
  //λ=(-b±sqrt(b²-4c))/2
  const lambda = (-b + Math.sqrt(b * b - 4 * c)) / 2
  //λv+OE
  return v.clone().multiplyScalar(lambda).add(OE)
}

//设置标记点的canvas坐标位
function setMarkCp(x, y) {
  mark.style.left = `${x}px`
  mark.style.top = `${y}px`
}

//更新标记点的位置
function updateMarkCp() {
  if (!markWp) {
    return
  }

  //判断标记点在相机的正面还是背面
  const { position } = camera
  const dot = markWp.clone().sub(position).dot(target.clone().sub(position))
  if (dot > 0) {
    mark.style.display = 'block'
  } else {
    mark.style.display = 'none'
  }

  // 将标记点的世界坐标转裁剪坐标
  const { x, y } = markWp.clone().applyMatrix4(pvMatrix)
  // 将标记点的裁剪坐标转canvas坐标
  setMarkCp(((x + 1) * canvas.width) / 2, ((-y + 1) * canvas.height) / 2)
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
  #mark {
    position: absolute;
    top: 0;
    left: 0;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.6);
    padding: 6px 12px;
    border-radius: 3px;
    user-select: none;
    display: none;
  }
}
</style>
