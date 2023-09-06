<template>
  <div class="title">图形树-坦克大战</div>
  <div ref="divRef" class="canvasWrapper"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  BufferGeometry,
  SphereGeometry,
  Group,
  PerspectiveCamera,
  DirectionalLight,
  PlaneGeometry,
  SplineCurve,
  LineBasicMaterial,
  Line,
  CylinderGeometry,
  BoxGeometry,
  Vector2,
  Vector3
} from 'three'
import { GUI } from 'dat.gui'
import Stage from './Stage'
import AxesGridHelper from './AxesGridHelper'

const divRef = ref()

const stage = new Stage()
const { scene, renderer } = stage
// 背景色
renderer.setClearColor(0xaaaaaa)
// 开启投影
renderer.shadowMap.enabled = true

function makeCamera(fov = 40) {
  const aspect = 2
  const zNear = 0.1
  const zFar = 1000
  return new PerspectiveCamera(fov, aspect, zNear, zFar)
}

// 主相机
const camera = makeCamera()
camera.position.set(16, 8, 20)
camera.lookAt(0, 0, 0)
stage.camera = camera

// 建立两道光线
{
  // 平行光1
  const light = new DirectionalLight(0xffffff, 1)
  light.position.set(0, 20, 0)
  scene.add(light)
  light.castShadow = true
  light.shadow.mapSize.width = 2048
  light.shadow.mapSize.height = 2048

  const d = 50
  light.shadow.camera.left = -d
  light.shadow.camera.right = d
  light.shadow.camera.top = d
  light.shadow.camera.bottom = -d
  light.shadow.camera.near = 1
  light.shadow.camera.far = 50
}

{
  // 平行光2
  const light = new DirectionalLight(0xffffff, 1)
  light.position.set(1, 2, 4)
  scene.add(light)
}

// 地面
const groundGeometry = new PlaneGeometry(50, 50)
const groundMaterial = new MeshPhongMaterial({ color: 0xcc8866 })
const groundMesh = new Mesh(groundGeometry, groundMaterial)
groundMesh.rotation.x = Math.PI * -0.5
groundMesh.receiveShadow = true
scene.add(groundMesh)

// 建立坦克Group，在其中放一个随坦克而动的相机。
// 坦克
const tank = new Group()
scene.add(tank)
// 坦克相机
const carRadius = 1
const bodyCenterY = (carRadius * 3) / 2
const tankCameraFov = 75
const tankCamera = makeCamera(tankCameraFov)
tankCamera.position.y = 5
tankCamera.position.z = -10
tankCamera.lookAt(0, bodyCenterY, 0)
tank.add(tankCamera)
// 坦克车身
const bodyGeometry = new SphereGeometry(carRadius)
const bodyMaterial = new MeshPhongMaterial({ color: 0x6688aa })
const bodyMesh = new Mesh(bodyGeometry, bodyMaterial)
bodyMesh.position.y = bodyCenterY
bodyMesh.castShadow = true
tank.add(bodyMesh)
// 两个车轱辘
const wheelRadius = 0.6
const wheelThickness = 0.5
const wheelSegments = 8
const wheelGeometry = new CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, wheelSegments)
const wheelMaterial = new MeshPhongMaterial({ color: 0x888888 })
const cx = carRadius + wheelThickness / 2
const wheelMeshes = [-cx, cx].map((x) => {
  const mesh = new Mesh(wheelGeometry, wheelMaterial)
  mesh.rotation.z = Math.PI * 0.5
  mesh.position.set(x, wheelRadius, 0)
  mesh.castShadow = true
  tank.add(mesh)
  return mesh
})

// 建立炮筒Group，把炮筒模型和炮筒相机放进去，炮筒相机会随炮筒变换。
// 炮筒
const barrel = new Group()
barrel.position.y = bodyCenterY + 0.3
tank.add(barrel)
// 炮筒模型
const barrelSize = 0.3
const barrelLength = 5
const barrelGeometry = new BoxGeometry(barrelSize, barrelSize, barrelLength)
const barrelMesh = new Mesh(barrelGeometry, bodyMaterial)
barrelMesh.position.z = barrelLength / 2
barrelMesh.castShadow = true
barrel.add(barrelMesh)
// 炮管相机
const barrelCamera = makeCamera()
barrelCamera.position.y = 1.4
barrel.add(barrelCamera)

// 建立目标点Group，把目标点模型和目标相机放进去。
// 目标-负责目标的整体高度
const target = new Group()
target.position.z = 2
target.position.y = 4
scene.add(target)
// 浮动节点-负责目标的上下浮动
const targetBob = new Group()
target.add(targetBob)
// 目标模型
const targetGeometry = new SphereGeometry(0.5, 6, 3)
const targetMaterial = new MeshPhongMaterial({
  color: 0x00ff00,
  flatShading: true
})
const targetMesh = new Mesh(targetGeometry, targetMaterial)
targetMesh.castShadow = true
targetBob.add(targetMesh)
// 目标相机
const targetCamera = makeCamera()
targetCamera.position.y = 1
targetCamera.position.z = -2
targetCamera.rotation.y = Math.PI
// 目标相机旋转轴-带动目标相机的旋转
const targetCameraPivot = new Group()
targetBob.add(targetCameraPivot)
targetCameraPivot.add(targetCamera)

// 建立一条路径，之后会让坦克沿此路径移动。
//坦克移动路径
const curve = new SplineCurve([
  new Vector2(-6, 5),
  new Vector2(-6, -4),
  new Vector2(8, 0),
  new Vector2(-6, 12),
  new Vector2(-6, 5)
])
const points = curve.getPoints(50)
const geometry = new BufferGeometry().setFromPoints(points)
const material = new LineBasicMaterial({ color: 0xff0000 })
const splineObject = new Line(geometry, material)
splineObject.rotation.x = Math.PI * 0.5
splineObject.position.y = 0.05
scene.add(splineObject)

// 提前声明好三个向量。
// tankPosition和tankTarget之后会从curve路径中获取。
// targetPosition 是暂存目标对象的世界位的。
// 坦克位置
const tankPosition = new Vector2()
// 坦克朝向
const tankTarget = new Vector2()
// 目标位
const targetPosition = new Vector3()

const gui = new GUI({ autoPlace: false })
const cameras = new Map([
  ['camera', camera],
  ['barrelCamera', barrelCamera],
  ['targetCamera', targetCamera],
  ['tankCamera', tankCamera]
])

const curCamera = { name: 'camera' }
gui.add(curCamera, 'name', [...cameras.keys()]).onChange((key) => {
  const {
    domElement: { clientWidth, clientHeight }
  } = renderer
  const cam = cameras.get(key)
  if (cam) {
    stage.camera = cam
    stage.camera.aspect = clientWidth / clientHeight
    stage.camera.updateProjectionMatrix()
  }
})

// 让坦克、目标对象和相机动起来。
// 渲染之前
stage.beforeRender = (time = 0) => {
  time *= 0.001
  // 坦克移动插值
  const tankTime = time * 0.1
  // 坦克位置
  curve.getPointAt(tankTime % 1, tankPosition)
  // 坦克朝向
  curve.getPointAt((tankTime + 0.01) % 1, tankTarget)
  // 设置坦克位置
  tank.position.set(tankPosition.x, 0, tankPosition.y)
  // 设置坦克朝向
  tank.lookAt(tankTarget.x, 0, tankTarget.y)

  // 车轱辘的滚动
  wheelMeshes.forEach((obj) => {
    obj.rotation.x = time * 3
  })

  // 目标对象的上下浮动
  targetBob.position.y = Math.sin(time * 2) * 2

  // 获取目标点的世界位
  targetMesh.getWorldPosition(targetPosition)
  // 炮筒指向目标点
  barrel.lookAt(targetPosition)

  if (curCamera.name === 'barrelCamera') {
    // 炮筒相机看向目标点
    barrelCamera.lookAt(targetPosition)
  } else if (curCamera.name === 'targetCamera') {
    // 目标相机看向坦克
    tank.getWorldPosition(targetPosition)
    targetCameraPivot.lookAt(targetPosition)
  }
}

onMounted(() => {
  const { value } = divRef
  if (value) {
    value.innerHTML = ''
    value.append(renderer.domElement)
    value.append(gui.domElement)
    stage.animate()
  }
})
</script>

<style lang="less">
.title {
  position: absolute;
}
.canvasWrapper,
canvas {
  height: 100%;
  width: 100%;
}
.dg {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
