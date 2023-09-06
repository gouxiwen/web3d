<template>
  <div class="title">图形树-太阳系</div>
  <div ref="divRef" class="canvasWrapper"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PointLight,
  SphereGeometry,
  Group
} from 'three'
import { GUI } from 'dat.gui'
import Stage from './Stage'
import AxesGridHelper from './AxesGridHelper'

const divRef = ref()

const gui = new GUI({ autoPlace: false })
const stage = new Stage()
const { scene, renderer, camera } = stage

function makeAxesGrid(obj, label) {
  const helper = new AxesGridHelper(obj)
  // 控制helper对象里的visible属性
  gui.add(helper, 'visible').name(label)
}

//需要旋转的对象集合
const objects = []
stage.beforeRender = (time = 0) => {
  time *= 0.001
  objects.forEach((obj) => {
    obj.rotation.y = time
    // new AxesGridHelper(obj)
  })
}

// 设置相机的视点位、目标点和上方向，使其变成俯视状态
camera.position.set(0, 20, 0)
camera.up.set(0, 0, -1)
camera.lookAt(0, 0, 0)

// 太阳、地球和月亮都共用一个球体
const radius = 1
const widthSegments = 6
const heightSegments = 6
const sphereGeometry = new SphereGeometry(radius, widthSegments, heightSegments)

// 光源
const color = 0xffffff
const intensity = 3
const light = new PointLight(color, intensity)
scene.add(light)

// 太阳坐标系
const solarSystem = new Group()
scene.add(solarSystem)
objects.push(solarSystem)

// 地球坐标系
const earthSystem = new Group()
earthSystem.position.x = 5
solarSystem.add(earthSystem)
objects.push(earthSystem)

// 月球坐标系
const moonSystem = new Group()
moonSystem.position.x = 2
earthSystem.add(moonSystem)
objects.push(moonSystem)

//  太阳
const sunMaterial = new MeshPhongMaterial({ emissive: 0xffff00 })
const sunMesh = new Mesh(sphereGeometry, sunMaterial)
solarSystem.add(sunMesh)

// 地球
const earthMaterial = new MeshPhongMaterial({
  color: 0x00acec,
  emissive: 0x00acec
})
const earthMesh = new Mesh(sphereGeometry, earthMaterial)
earthMesh.scale.set(0.5, 0.5, 0.5)
earthSystem.add(earthMesh)

// 月球
const moonMaterial = new MeshPhongMaterial({
  color: 0x999999,
  emissive: 0x999999
})
const moonMesh = new Mesh(sphereGeometry, moonMaterial)
moonMesh.scale.set(0.2, 0.2, 0.2)
moonSystem.add(moonMesh)

makeAxesGrid(solarSystem, 'solarSystem')
makeAxesGrid(earthSystem, 'earthSystem')
makeAxesGrid(moonSystem, 'moonSystem')

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
