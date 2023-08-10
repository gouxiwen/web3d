<template>
  <div>三维世界-别墅室内布局</div>
  <div class="container">
    <canvas id="canvas"></canvas>
    <div class="model-button">
      <button :class="{ active: model === 'manual' }" @click="handlemanual">手动</button>
      <button :class="{ active: model === 'auto' }" @click="handleauto">自动</button>
    </div>
    <div class="floor-button" v-show="model === 'manual'">
      <button
        v-for="f in [5, 4, 3, 2, 1, 0]"
        :key="f"
        @click="
          () => {
            setFloor(f)
          }
        "
      >
        {{ f >= 2 ? f - 1 : f - 2 }}F
      </button>
    </div>
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
  Ray
} from 'https://unpkg.com/three/build/three.module.js'
import OrbitControls from '../utils/OrbitControls.js'
import { Geo, Mat, Obj3D, Scene } from '../utils/my-three-plus'
import Compose from '../utils/Compose.js'
import Track from '../utils/Track.js'
import f1b from '../assets/images/-1.png'
import f2b from '../assets/images/-2.png'
import f1 from '../assets/images/1.png'
import f2 from '../assets/images/2.png'
import f3 from '../assets/images/3.png'
import f4 from '../assets/images/4.png'

const model = ref('auto')

// 顶点着色器
const vsSource = `
    attribute vec4 a_Position;
    attribute vec2 a_Pin;
    uniform mat4 u_PvMatrix;
    uniform mat4 u_ModelMatrix;
    varying vec2 v_Pin;
    void main(){
      gl_Position = u_PvMatrix*u_ModelMatrix*a_Position;
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
// 层高
const fh = 0.5
// 当前楼层
let curFloor = 0
let gl, dist, target, camera, scene, orbit, timer
const promises = [f2b, f1b, f1, f2, f3, f4].map((ele) => {
  const image = new Image()
  image.src = ele
  return imgPromise(image)
})

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

    //视点相对于目标点的位置
    dist = new Vector3(-0.5, 2.8, 1.5)
    // 目标点
    target = new Vector3(0, 2, 0.6)
    //视点
    const eye = target.clone().add(dist)
    const [fov, aspect, near, far] = [45, canvas.width / canvas.height, 1, 20]
    // 透视相机
    camera = new PerspectiveCamera(fov, aspect, near, far)
    camera.position.copy(eye)
    // 轨道控制器
    orbit = new OrbitControls({ camera, target, dom: canvas })

    // 场景
    scene = new Scene({ gl })
    // 注册程序对象
    scene.registerProgram('img', {
      program: createProgram(gl, vsSource, fsSource),
      attributeNames: ['a_Position', 'a_Pin'],
      uniformNames: ['u_PvMatrix', 'u_ModelMatrix', 'u_Sampler']
    })
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

    Promise.all(promises).then((imgs) => {
      imgs.forEach((img, ind) => scene.add(crtObj(img, ind)))
      setFloor(curFloor)
      render()
      timer = setInterval(changeFloor, 2000)
    })
  }
}

function handlemanual() {
  model.value = 'manual'
  timer && clearInterval(timer)
}
function handleauto() {
  model.value = 'auto'
  timer = setInterval(changeFloor, 2000)
}

function crtObj(image, ind) {
  const y = fh * ind
  const modelMatrix = new Matrix4()
  modelMatrix.elements[13] = y
  const mat = new Mat({
    program: 'img',
    data: {
      u_PvMatrix: {
        value: orbit.getPvMatrix().elements,
        type: 'uniformMatrix4fv'
      },
      u_ModelMatrix: {
        value: modelMatrix.elements,
        type: 'uniformMatrix4fv'
      }
    },
    maps: {
      u_Sampler: {
        image,
        format: gl.RGBA
      }
    },
    mode: 'TRIANGLE_STRIP'
  })
  const geo = new Geo({
    data: {
      a_Position: {
        array: new Float32Array([-0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0, -0.5]),
        size: 3
      },
      a_Pin: {
        array: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
        size: 2
      }
    }
  })
  return new Obj3D({ geo, mat })
}

//建立合成对象
const compose = new Compose()
// 补间数据
const [z1, z2] = [0, 0.65]
const [s1, s2] = [0.8, 2]
// 所有楼层所对应的补间数据
const floorData = Array.from({ length: promises.length }, () => {
  return { z: z1, s: s1 }
})
// 相机的补间数据
const cameraData = { y: 0 }
// 楼层运动方向
let dir = 1

function changeFloor() {
  if (curFloor > promises.length - 2) {
    dir = -1
  } else if (curFloor < 1) {
    dir = 1
  }
  setFloor(curFloor + dir)
}

function setFloor(n) {
  updateFloor(curFloor, z1, s1)
  curFloor = n
  updateFloor(curFloor, z2, s2)
}

function updateFloor(n, z, s) {
  const floor2 = floorData[n]
  const floor1 = { ...floor2 }
  Object.assign(floor2, { z, s })
  const cameraData1 = { ...cameraData }
  cameraData.y = fh * n
  crtTrack(floor1, floor2)
  crtTrack(cameraData1, cameraData)
}

function crtTrack(obj1, obj2) {
  compose.deleteByTarget(obj2)
  const track = new Track(obj2)
  track.start = new Date()
  track.keyMap = new Map([
    [
      'y',
      [
        [0, obj1.y],
        [300, obj2.y]
      ]
    ],
    [
      'z',
      [
        [200, obj1.z],
        [500, obj2.z]
      ]
    ],
    [
      's',
      [
        [200, obj1.s],
        [500, obj2.s]
      ]
    ]
  ])
  compose.add(track)
}

function updateModelMatrix() {
  floorData.forEach(({ z, s }, n) => {
    const { value } = [...scene.children][n].mat.data.u_ModelMatrix
    value[14] = z
    value[0] = s
    value[5] = s
    value[10] = s
  })
}

function updateOrbit() {
  const { y } = cameraData
  target.y = y
  camera.position.y = dist.y + y
  orbit.updatePos()
  scene.setUniform('u_PvMatrix', {
    value: orbit.getPvMatrix().elements
  })
}

function render() {
  compose.update(new Date())
  updateModelMatrix()
  updateOrbit()
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
  position: relative;
  .model-button {
    position: absolute;
    top: 10px;
    right: 10px;
    button {
      margin: 5px;
      &.active {
        background: rgb(23, 194, 108);
        color: white;
      }
    }
  }
  .floor-button {
    position: absolute;
    top: 60px;
    right: 10px;
    button {
      display: block;
      width: 50px;
      margin: 10px;
    }
  }
}
</style>
