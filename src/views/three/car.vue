<template>
  <div class="title">图形树-小汽车</div>
  <div ref="divRef" class="canvasWrapper"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, MeshNormalMaterial } from 'three'
import Stage from './Stage'

const divRef = ref()

const stage = new Stage()
const { scene, renderer } = stage

//  Objects
// 整个汽车 car - group
const car = new Group()

// 车身 body - group
const body = new Group()

const material = new MeshNormalMaterial()
const material2 = new MeshBasicMaterial({ color: '#fff000' })
const bodyCube1 = new Mesh(
  new BoxGeometry(1, 2, 0.5),
  material
)
const bodyCube2 = new Mesh(
  new BoxGeometry(0.5, 0.5, 0.5),
  material2
)
bodyCube2.position.z = 0.5
body.add(bodyCube1)
body.add(bodyCube2)

car.add(body)

// 轮子1 - group
const wheelGroup1 = new Group()
const wheel1 = new Mesh(
  new BoxGeometry(0.1, 0.7, 0.7),
  material
)
wheelGroup1.add(wheel1)
wheelGroup1.position.set(-0.7, 0.6, 0)

// 轮子2 - group
const wheelGroup2 = wheelGroup1.clone()
wheelGroup2.position.x = 0.7
// 轮子3 - group
const wheelGroup3 = wheelGroup1.clone()
wheelGroup3.position.y = -0.6
// 轮子4 - group
const wheelGroup4 = wheelGroup3.clone()
wheelGroup4.position.x = 0.7

car.add(wheelGroup1)
car.add(wheelGroup2)
car.add(wheelGroup3)
car.add(wheelGroup4)

// 轮胎 -group
const cirle = new Group()
const n = 20
const r = 0.5
for (let i = 0; i < n; i++) {
  const geometry = new BoxGeometry(0.1, 0.1, 0.2)
  const mesh = new Mesh(geometry, material)
  mesh.position.x = r * Math.cos(Math.PI * 2 / n * i)
  mesh.position.y = r * Math.sin(Math.PI * 2 / n * i)
  cirle.add(mesh)
}
cirle.rotation.y = -0.5 * Math.PI
wheelGroup1.add(cirle)
wheelGroup2.add(cirle.clone())
wheelGroup3.add(cirle.clone())
wheelGroup4.add(cirle.clone())
scene.add(car)

// 渲染之前
stage.beforeRender = (time = 0) => {
  time *= 0.001
  car.position.y = time % 4 - 2
  wheelGroup1.rotation.x = -time
  wheelGroup2.rotation.x = -time
  wheelGroup3.rotation.x = -time
  wheelGroup4.rotation.x = -time
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
