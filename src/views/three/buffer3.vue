<template>
  <div class="title">自定义-波浪球</div>
  <div ref="divRef" class="canvasWrapper"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Mesh, MeshBasicMaterial, MeshNormalMaterial, BufferGeometry, BufferAttribute } from 'three'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'
import Stage from './Stage'
import WaveBall from './WaveBall'

const divRef = ref()

const stage = new Stage(4, 5, 6)
const { scene, renderer } = stage

const geometry = new WaveBall(48, 48)
geometry.wave()
stage.beforeRender = (time = 0) => {
  geometry.wave(time * 0.002)
}

{
  const material = new MeshNormalMaterial({
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1
  })
  const mesh = new Mesh(geometry, material)
  scene.add(mesh)
}
// {
//   const material = new MeshBasicMaterial({
//     wireframe: true
//   })
//   const mesh = new Mesh(geometry, material)
//   // 法线辅助线
//   const helper = new VertexNormalsHelper(mesh)
//   scene.add(mesh, helper)
// }

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
