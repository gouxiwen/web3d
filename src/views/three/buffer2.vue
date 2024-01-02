<template>
  <div class="title">自定义-基于顶点索引绘制</div>
  <div ref="divRef" class="canvasWrapper"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Mesh, MeshBasicMaterial, MeshNormalMaterial, BufferGeometry, BufferAttribute } from 'three'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'
import Stage from './Stage'

const divRef = ref()

const stage = new Stage(4, 5, 6)
const { scene, renderer } = stage

// 顶点-位置，法线，uv坐标，颜色一一对应
const vertices = [
  // front
  { pos: [-1, -1, 1], norm: [0, 0, 1], uv: [0, 0] }, // 0
  { pos: [1, -1, 1], norm: [0, 0, 1], uv: [1, 0] }, // 1
  { pos: [-1, 1, 1], norm: [0, 0, 1], uv: [0, 1] }, // 2
  { pos: [1, 1, 1], norm: [0, 0, 1], uv: [1, 1] }, // 3
  // right
  { pos: [1, -1, 1], norm: [1, 0, 0], uv: [0, 0] }, // 4
  { pos: [1, -1, -1], norm: [1, 0, 0], uv: [1, 0] }, // 5
  { pos: [1, 1, 1], norm: [1, 0, 0], uv: [0, 1] }, // 6
  { pos: [1, 1, -1], norm: [1, 0, 0], uv: [1, 1] }, // 7
  // back
  { pos: [1, -1, -1], norm: [0, 0, -1], uv: [0, 0] }, // 8
  { pos: [-1, -1, -1], norm: [0, 0, -1], uv: [1, 0] }, // 9
  { pos: [1, 1, -1], norm: [0, 0, -1], uv: [0, 1] }, // 10
  { pos: [-1, 1, -1], norm: [0, 0, -1], uv: [1, 1] }, // 11
  // left
  { pos: [-1, -1, -1], norm: [-1, 0, 0], uv: [0, 0] }, // 12
  { pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [1, 0] }, // 13
  { pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [0, 1] }, // 14
  { pos: [-1, 1, 1], norm: [-1, 0, 0], uv: [1, 1] }, // 15
  // top
  { pos: [1, 1, -1], norm: [0, 1, 0], uv: [0, 0] }, // 16
  { pos: [-1, 1, -1], norm: [0, 1, 0], uv: [1, 0] }, // 17
  { pos: [1, 1, 1], norm: [0, 1, 0], uv: [0, 1] }, // 18
  { pos: [-1, 1, 1], norm: [0, 1, 0], uv: [1, 1] }, // 19
  // bottom
  { pos: [1, -1, 1], norm: [0, -1, 0], uv: [0, 0] }, // 20
  { pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 0] }, // 21
  { pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 1] }, // 22
  { pos: [-1, -1, -1], norm: [0, -1, 0], uv: [1, 1] } // 23
]
const positions = []
const normals = []
const uvs = []
for (const vertex of vertices) {
  positions.push(...vertex.pos)
  normals.push(...vertex.norm)
  uvs.push(...vertex.uv)
}
// 定义一个基础几何体
const geometry = new BufferGeometry()
// 基于positions、normals 和uvs 建立BufferAttribute 对象。
const positionNumComponents = 3
const normalNumComponents = 3
const uvNumComponents = 2
const positionAttr = new BufferAttribute(new Float32Array(positions), positionNumComponents)
setTimeout(() => {
  // 更新顶点数据
  positionAttr.setXYZ(18, 1, 2, 1)
  positionAttr.needsUpdate = true
}, 1000)
const normalAttr = new BufferAttribute(new Float32Array(normals), normalNumComponents)
const uvAttr = new BufferAttribute(new Float32Array(uvs), uvNumComponents)
// 设置着色器属性
geometry.setAttribute('position', positionAttr)
geometry.setAttribute('normal', normalAttr)
geometry.setAttribute('uv', uvAttr)
// 如果没有定义法线，可以利用以下方法来计算出来
// geometry.computeVertexNormals()
// 设置索引 如果该 attribute 没有设置过，则 renderer 假设每三个连续的位置代表一个三角面片。 默认值是 null。
geometry.setIndex([
  // front
  0, 1, 2, 2, 1, 3,
  // right
  4, 5, 6, 6, 5, 7,
  // back
  8, 9, 10, 10, 9, 11,
  // left
  12, 13, 14, 14, 13, 15,
  // top
  16, 17, 18, 18, 17, 19,
  // bottom
  20, 21, 22, 22, 21, 23
])

{
  const material = new MeshNormalMaterial({
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1
  })
  const mesh = new Mesh(geometry, material)
  scene.add(mesh)
}
{
  const material = new MeshBasicMaterial({
    wireframe: true
  })
  const mesh = new Mesh(geometry, material)
  // 法线辅助线
  const helper = new VertexNormalsHelper(mesh)
  scene.add(mesh, helper)
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
