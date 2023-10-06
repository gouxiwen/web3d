<template>
  <div class="title">图形树-小汽车2</div>
  <div ref="divRef" class="canvasWrapper"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshNormalMaterial, PlaneGeometry, TorusGeometry } from 'three'
import Stage from './Stage'

const divRef = ref()

const stage = new Stage(4, 2, 5)
const { scene, renderer, camera } = stage
camera.fov = 75

// 公共材质
const m = new MeshNormalMaterial()
// 轴长
const len = 2
//  Objects
// 整个汽车 car - group
const car = new Group()
// 前面两个轮子 frontWheels - group
const frontWheels = new Group()

// 轮子1 wheel1 - group
const wheel1 = new Group()
// 轮圈
const radius = 0.5
const tube = 0.1
const wheelG = new TorusGeometry(radius, tube)
const wheelMesh = new Mesh(wheelG, m)
// 轮毂
const n = 10
for (let index = 0; index < n; index++) {
  const g = new CylinderGeometry(0.02, 0.02, radius * 2)
  const mesh = new Mesh(g, m)
  mesh.rotation.z = Math.PI * 2 / n * index
  wheel1.add(mesh)
}
wheel1.add(wheelMesh)
wheel1.position.z = -len / 2
// 车轴1
const cylinderG1 = new CylinderGeometry(0.05, 0.05, len)
const cylinder = new Mesh(cylinderG1, m)
cylinder.rotation.x = Math.PI / 2

// 轮子2
const wheel2 = wheel1.clone()
wheel2.position.z = len / 2
frontWheels.add(wheel1, wheel2, cylinder)
frontWheels.rotation.y = Math.PI / 2
frontWheels.position.y = -1
car.add(frontWheels)

// 后面两个轮子
const backWheels = frontWheels.clone()
backWheels.position.y = 1

car.add(backWheels)

// 车身 body - group
const body = new Group()
const cubeG = new BoxGeometry(1.6, 3, 0.5)
const cube = new Mesh(cubeG, m)
body.add(cube)

// 车顶
const roofG = new CylinderGeometry(0.9, 0.9, 1.6, 3, 1, false, -Math.PI / 2, Math.PI)
const roof = new Mesh(roofG, m)
roof.rotation.z = -Math.PI / 2
body.add(roof)

car.add(body)

scene.add(car)

// 地面
const planeG = new PlaneGeometry(8, 8)
const plane = new Mesh(planeG, new MeshBasicMaterial({ color: 0xccccccc }))
car.rotation.x = -Math.PI / 2
car.position.y = radius + tube
plane.rotation.x = -Math.PI / 2
scene.add(plane)

// 渲染之前
stage.beforeRender = (time = 0) => {
  time *= 0.001
  frontWheels.rotation.z = Math.PI / 2 * time
  backWheels.rotation.z = Math.PI / 2 * time
  car.position.z = time % 4 - 1
}
onMounted(() => {
  const { value } = divRef
  if (value) {
    value.innerHTML = ''
    value.append(renderer.domElement)
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
</style>
