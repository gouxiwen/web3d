<template>
  <div class="title">图形树-小汽车2</div>
  <div ref="divRef" class="canvasWrapper"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { AmbientLight, MeshStandardMaterial, ConeGeometry, CircleGeometry, BoxGeometry, CylinderGeometry, MeshNormalMaterial, DirectionalLight, Group, Mesh, MeshBasicMaterial, SphereGeometry, PlaneGeometry, TorusGeometry, TextureLoader, DoubleSide } from 'three'
import Stage from './Stage'
import img from '../../assets/images/erha.jpg'

const divRef = ref()

const stage = new Stage(1, 1, 3)
const { scene, renderer, camera } = stage
camera.fov = 75
renderer.setClearColor(0x95e4e8)
renderer.shadowMap.enabled = true

// light
// 环境光
scene.add(new AmbientLight(0xffffff, 0.2))
// 平行光
const dLight = new DirectionalLight(0xffffff, 2)
dLight.position.set(0, 1, 1)
scene.add(dLight)

const groundW = 50
const groundH = 10

// 地面 ground - group
const groundGroup = new Group()

// 马路 road - group
const roadGroup = new Group()
const roadPlaneG = new PlaneGeometry(2, groundH)
const roadPlaneM = new MeshStandardMaterial({ color: 0x4c4a4b })
const roadPlane = new Mesh(roadPlaneG, roadPlaneM)

const leftLine = new Mesh(new PlaneGeometry(0.1, groundH))
leftLine.position.z = 0.0001
leftLine.position.x = -0.8

const rightLine = leftLine.clone()
rightLine.position.x = 0.8

// 虚线 dashLine - group
const dashLineGroup = new Group()
let dashNum = 24
for (let i = 0; i < dashNum; i++) {
  const m = new MeshStandardMaterial({ color: 0xffffff })
  const g = new PlaneGeometry(0.1, 0.3)
  const mesh = new Mesh(g, m)
  mesh.position.z = 0.0001
  mesh.position.y = -groundH / 2 + 0.5 * i
  dashLineGroup.add(mesh)
}

// 草坪 grass
const frontGrass = new Mesh(new PlaneGeometry(groundW, groundH / 2), new MeshStandardMaterial({ color: 0x61974b }))
frontGrass.position.z = -0.001
frontGrass.position.y = -groundH / 4

const backGrass = new Mesh(new PlaneGeometry(groundW, groundH / 2), new MeshStandardMaterial({ color: 0xb1d744 }))
backGrass.position.z = -0.001
backGrass.position.y = groundH / 4

roadGroup.add(roadPlane, leftLine, rightLine, dashLineGroup)
groundGroup.add(roadGroup, frontGrass, backGrass)
groundGroup.rotation.x = -0.5 * Math.PI

//树 trees - group
const treesGroup = new Group()
const leftTreeGroup = new Group()
const singTreeGroup = new Group()

const treeTop = new Mesh(
  new ConeGeometry(0.2, 0.2, 5),
  new MeshStandardMaterial({ color: 0x64a525 })
)
const treeMid = new Mesh(
  new ConeGeometry(0.3, 0.3, 5),
  new MeshStandardMaterial({ color: 0x64a525 })
)
const treeBottom = new Mesh(
  new CylinderGeometry(0.05, 0.05, 0.4),
  new MeshStandardMaterial({ color: 0x7a5753 })
)
const treeShadow = new Mesh(
  new CircleGeometry(0.3, 5),
  new MeshBasicMaterial({ color: 0x3f662d })
)
treeTop.position.y = 0.55
treeMid.position.y = 0.4
treeShadow.rotation.x = -0.5 * Math.PI
treeBottom.position.y = 0.2
singTreeGroup.add(treeTop, treeMid, treeBottom, treeShadow)
singTreeGroup.scale.set(0.5, 0.5, 0.5)

const treeNum = 20
for (let i = 0; i < treeNum; i++) {
  const group = singTreeGroup.clone()
  group.position.z = -groundH / 2 + i * 0.5
  group.position.x = -1.2
  leftTreeGroup.add(group)
}

const rightTreeGroup = leftTreeGroup.clone()
rightTreeGroup.position.x = 1.2 * 2

treesGroup.add(leftTreeGroup, rightTreeGroup)

//建筑物 building - group
const buildingGroup = new Group()
const buildingNum = 20
const buildingMaterial = new MeshStandardMaterial({ color: 0x75d1c2 })
for (let i = 0; i < buildingNum; i++) {
  const width = Math.random() + 1
  const height = Math.random() + 1
  const deep = Math.random()
  const buildingGeometry = new BoxGeometry(width, height, deep)
  const mesh = new Mesh(buildingGeometry, buildingMaterial)
  mesh.position.x = -groundW / 2 + i * 2 + (Math.random() - 0.5) * 3
  mesh.position.z = -groundH / 2
  mesh.position.y = height / 2
  buildingGroup.add(mesh)
}

//云朵 cloud - group
const cloudGroup = new Group()
const cloudMaterial = new MeshBasicMaterial(0xffffff)
const cloud1 = new Mesh(new SphereGeometry(0.6), cloudMaterial)
const cloud2 = new Mesh(new SphereGeometry(0.8), cloudMaterial)
const cloud3 = new Mesh(new SphereGeometry(1), cloudMaterial)
const cloud4 = new Mesh(new SphereGeometry(0.7), cloudMaterial)
const cloud5 = new Mesh(new SphereGeometry(0.5), cloudMaterial)
cloud1.position.x = -1.6
cloud1.position.y = -0.05
cloud2.position.x = -1
cloud2.position.y = -0.1
cloud4.position.x = 1
cloud5.position.x = 1.4
cloudGroup.add(cloud1, cloud2, cloud3, cloud4, cloud5)
cloudGroup.position.z = -groundH / 2 - 2
cloudGroup.position.y = 3

// 汽车 car - group
// 车身贴图
const loader = new TextureLoader()
const texture = loader.load(img)
// 公共材质
const m = new MeshBasicMaterial({
  color: 'gray'
})
const m2 = new MeshBasicMaterial({
  color: 0x000000
})
const m1 = new MeshBasicMaterial({
  map: texture,
  side: DoubleSide
})
// 轴长
const len = 1.8
//  Objects
// 整个汽车 car - group
const car = new Group()
// 前面两个轮子 frontWheels - group
const frontWheels = new Group()

// 轮子1 wheel1 - group
const wheel1 = new Group()
// 轮圈
const radius = 0.25
const tube = 0.05
const wheelG = new TorusGeometry(radius, tube)
const wheelMesh = new Mesh(wheelG, m2)
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
const cube = new Mesh(cubeG, m1)
body.add(cube)

// 车顶
const roofG = new CylinderGeometry(0.9, 0.9, 1.6, 3, 1, false, -Math.PI / 2, Math.PI)
const roof = new Mesh(roofG, m1)
roof.rotation.z = -Math.PI / 2
body.add(roof)

car.add(body)
car.rotation.x = -Math.PI / 2
car.position.y = (radius + tube) * 0.2
car.position.z = 2
car.scale.x = 0.2
car.scale.y = 0.2
car.scale.z = 0.2

scene.add(groundGroup, treesGroup, buildingGroup, cloudGroup, car)

// 渲染之前
stage.beforeRender = (time = 0) => {
  time *= 0.001
  dashLineGroup.position.y = -time * 0.2 % 3
  treesGroup.position.z = time * 0.2 % 3
  cloudGroup.position.x = Math.sin(time * 0.1) * 7
  frontWheels.rotation.z = -Math.PI / 2 * time
  backWheels.rotation.z = -Math.PI / 2 * time
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
