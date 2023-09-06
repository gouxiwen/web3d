<template>
  <div>光-纹理映射-VR-切换场景(有过渡)利用帧缓存区</div>
  <div class="container">
    <canvas id="canvas"></canvas>
    <div id="marks"></div>
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
import VRFrame from '../../utils/VRFrame.js'
import VRPlane from '../../utils/VRPlane.js'
import Track from '../../utils/Track.js'
import roomImg0 from '../../assets/images/room3.jpg'
import roomImg1 from '../../assets/images/mainBed.jpg'
import roomImg2 from '../../assets/images/secBed.jpg'

const imgArr = [roomImg0, roomImg1, roomImg2]

let gl, target, camera, scene, orbit, pvMatrix, marks, data, curVr, vrNew, vrOld
const init = () => {
  const canvas = document.getElementById('canvas')
  if (canvas) {
    // canvas 画布
    const canvas = document.getElementById('canvas')
    canvas.width = document.querySelector('.container').clientWidth
    canvas.height = document.querySelector('.container').clientHeight
    // webgl画笔
    gl = canvas.getContext('webgl')
    // gl.clearColor(0, 0, 0, 1)
    // gl.enable(gl.BLEND) // 开启透明度
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    // gl.enable(gl.DEPTH_TEST) // 深度测试可以解决物体的遮挡问题，不然后面的物体可能挡住前面的物体。

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
    scene = new VRPlane({ gl })
    // 帧缓冲区对象
    vrNew = new VRFrame({ gl, orbit })
    vrOld = new VRFrame({ gl, orbit })
    scene.mat.setMap('u_SampOld', {
      texture: vrOld.texture
    })

    bindEvent(canvas)

    import('../../data/vr.json').then((dt) => {
      data = dt.default
      curVr = getVrById(1)
      //更新VR
      updateVr()
      // // 渲染
      render()
    })
  }
}

const bindEvent = (canvas) => {
  /* 点击标记点容器 */
  marks.addEventListener('click', ({ target }) => {
    if (target.className !== 'mark') {
      return
    }
    marks.innerHTML = ''
    curVr = getVrById(parseInt(target.getAttribute('data-link')))
    updateVr()
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
  window.addEventListener('pointermove', (event) => {
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

// 是否制作补间动画
let tweenable = false
// 补间数据
let aniDt = { ratio: 0 }
// 时间轨
let track = new Track(aniDt)
track.timeLen = 1000
track.keyMap = new Map([
  [
    'ratio',
    [
      [0, 0],
      [1000, 1]
    ]
  ]
])
track.onEnd = () => {
  tweenable = false
}

//根据id获取VR数据
function getVrById(id) {
  for (let i = 0; i < data.length; i++) {
    if (id === data[i].id) {
      return data[i]
    }
  }
}

//暂存当前的VR图像
let tempImg = null
// 更新VR图像
function updateVr() {
  const image = new Image()
  image.src = imgArr[curVr.imgSrc - 1]
  image.onload = function () {
    //开启补间动画
    tweenable = true
    //时间轨起始时间
    track.start = new Date()

    //若tempImg 不为null
    if (tempImg) {
      // 设置旧VR的图片
      vrOld.mat.setMap('u_Sampler', { image: tempImg })
      vrOld.draw()
      // 把旧VR的纹理对象传入u_SampOld
      scene.mat.setMap('u_SampOld', {
        texture: vrOld.texture
      })
    }
    //暂存当前图片
    tempImg = image
    //设置新VR的图片
    vrNew.mat.setMap('u_Sampler', { image })
    //设置相机视点
    camera.position.set(...curVr.eye)
    orbit.updateCamera()
    orbit.resetSpherical()
    //显示当前VR的标记点
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
  if (tweenable) {
    //更新时间轨的时间
    track.update(new Date())
    // 更新场景对象的插值数据
    scene.mat.setData('u_Ratio', {
      value: aniDt.ratio
    })
  }
  // 更新投影视图矩阵
  orbit.getPvMatrix()

  // 新VR渲染
  vrNew.draw()
  // 更新场景对象的u_SampNew
  scene.mat.setMap('u_SampNew', {
    texture: vrNew.texture
  })
  // 场景渲染
  scene.draw()
  //更新标记点的canvas坐标
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
