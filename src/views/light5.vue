<template>
  <div>光-纹理映射-VR-切换场景</div>
  <div class="container">
    <canvas id="canvas"></canvas>
    <div id="marks"></div>
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
} from 'three'
import OrbitControls from '../utils/OrbitControls.js'
import { Geo, Mat, Obj3D, Scene } from '../utils/my-three-plus'
import Geography from '../utils/Geography.js'
import Earth from '../utils/Earth.js'
import Gyro from '../utils/Gyro.js'
import roomImg0 from '../assets/images/room3.jpg'
import roomImg1 from '../assets/images/mainBed.jpg'
import roomImg2 from '../assets/images/secBed.jpg'

const imgArr = [roomImg0, roomImg1, roomImg2]

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

let gl, earth, target, camera, scene, orbit, pvMatrix, marks, data, curVr, mat
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
    const [fov, aspect, near, far] = [60, canvas.width / canvas.height, 0.1, 5]
    camera = new PerspectiveCamera(fov, aspect, near, far)
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
    marks = document.querySelector('#marks')

    // 场景
    scene = new Scene({ gl })
    //注册程序对象
    scene.registerProgram('map', {
      program: createProgram(gl, vsSource, fsSource),
      attributeNames: ['a_Position', 'a_Pin'],
      uniformNames: ['u_PvMatrix', 'u_ModelMatrix', 'u_Sampler']
    })

    //球体
    mat = new Mat({
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
      },
      maps: {
        u_Sampler: {
          magFilter: gl.LINEAR,
          minFilter: gl.LINEAR
        }
      }
    })
    const geo = new Geo({
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
    scene.add(new Obj3D({ geo, mat }))

    bindEvent(canvas)

    import('../data/vr.json').then((dt) => {
      data = dt.default
      curVr = getVrById(1)
      //更新VR
      updateVr()
      // 渲染
      render()
    })
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
  window.addEventListener('pointermove', (event) => {
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

  marks.addEventListener('click', ({ target }) => {
    if (target.className !== 'mark') {
      return
    }
    marks.innerHTML = ''
    curVr = getVrById(parseInt(target.getAttribute('data-link')))
    updateVr()
  })
}

//根据id获取VR数据
function getVrById(id) {
  for (let i = 0; i < data.length; i++) {
    if (id === data[i].id) {
      return data[i]
    }
  }
}

//根据数据更新VR
function updateVr() {
  const image = new Image()
  image.src = imgArr[curVr.imgSrc - 1]
  image.onload = function () {
    //更新图片
    mat.setMap('u_Sampler', { image })
    //更新相机视点
    camera.position.set(...curVr.eye)
    orbit.updateCamera()
    orbit.resetSpherical()
    //显示标记点
    showMark()
  }
}

//显示标记点
function showMark() {
  curVr.marks.forEach((ele) => {
    const div = document.createElement('div')
    div.className = 'mark'
    div.innerText = ele.name
    div.setAttribute('data-link', ele.link)
    marks.append(div)
  })
}

//更新标记点的canvas坐标位
function updateMarkCp() {
  if (!marks.children.length) {
    return
  }
  const { position } = camera
  const EO = target.clone().sub(position)
  curVr.marks.forEach((ele, ind) => {
    const markWp = new Vector3(...ele.pos)
    const mark = marks.children[ind]
    const dot = markWp.clone().sub(position).dot(EO)
    mark.style.display = dot > 0 ? 'block' : 'none'
    const { x, y } = markWp.clone().applyMatrix4(pvMatrix)
    mark.style.left = `${((x + 1) * canvas.width) / 2}px`
    mark.style.top = `${((-y + 1) * canvas.height) / 2}px`
  })
}

// 连续渲染
function render() {
  // tween()
  orbit.getPvMatrix()
  scene.draw()
  updateMarkCp()
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
  :deep(.mark) {
    position: absolute;
    transform: translate(-50%, -50%);
    top: 0;
    left: 0;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.6);
    padding: 6px 12px;
    border-radius: 3px;
    user-select: none;
    cursor: pointer;
  }
}
</style>
