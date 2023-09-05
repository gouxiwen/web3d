<template>
  <div class="title">三维</div>
  <div ref="divRef" class="canvasWrapper"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Mesh, MeshBasicMaterial, MeshNormalMaterial, SphereGeometry } from 'three'
import Stage from './Stage'

const divRef = ref()

const stage = new Stage()
const { scene, renderer } = stage

const geometry = new SphereGeometry()

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
  scene.add(mesh)
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
