<template>
  <div class="root">
    <canvas id="canvas" ref="canvasRef"></canvas>
    <a-button class="btn" @click="handleExportProjection">导出投影坐标</a-button>
    <div class="map-img">
      <img :src="mockData.enhanceMapUrl" class="img" />
      <div
        v-for="(point, index) in projectionData.mapPoint"
        :key="index"
        class="point"
        :style="{ left: point.px + 'px', top: point.py + 'px' }"
      >
        {{ point.pointName }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
// import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'

const mockData = {
  id: '1976849763649003521',
  thirdMapId: '9a7cba247f264dca875d204cadf8015e',
  mapName: '中科重德展厅',
  enhanceMapUrl:
    'http://amway-robot-dev.ehzcloud.com/oss/amway/map-image/9a7cba247f264dca875d204cadf8015e.png',
  mapPoint: [
    {
      pointId: 12180,
      pointName: '前台',
      deptName: '华制',
      pointType: 0,
      x: -10.588668,
      y: 2.222496,
      z: 3.0114977,
      pixelX: 118,
      pixelY: 261
    },
    {
      pointId: 12202,
      pointName: '洗手间',
      deptName: '日用品理化检测室',
      pointType: 0,
      x: 22.445477,
      y: -5.4875393,
      z: -1.726795,
      pixelX: 778,
      pixelY: 415
    },
    {
      pointId: 12203,
      pointName: '技术办公室',
      deptName: null,
      pointType: 0,
      x: 7.928299,
      y: 1.2615356,
      z: -0.2592703000000001,
      pixelX: 488,
      pixelY: 280
    },
    {
      pointId: 12204,
      pointName: '王宁产品',
      deptName: null,
      pointType: 0,
      x: 1.8057022,
      y: 4.565214,
      z: 1.4475167,
      pixelX: 366,
      pixelY: 214
    },
    {
      pointId: 12808,
      pointName: '刘云飞',
      deptName: null,
      pointType: 0,
      x: -4.952917,
      y: 9.657799,
      z: -1.6332881,
      pixelX: 230,
      pixelY: 112
    },
    {
      pointId: 12809,
      pointName: '李涛',
      deptName: null,
      pointType: 0,
      x: -6.342745,
      y: 9.76642,
      z: -1.8142271,
      pixelX: 203,
      pixelY: 110
    },
    {
      pointId: 12810,
      pointName: '梁单越',
      deptName: null,
      pointType: 0,
      x: -6.342745,
      y: 9.76642,
      z: -1.8189054,
      pixelX: 203,
      pixelY: 110
    },
    {
      pointId: 12940,
      pointName: '具身机器人展区',
      deptName: '销售',
      pointType: 0,
      x: -11.406189,
      y: 9.070314,
      z: -0.12240183,
      pixelX: 101,
      pixelY: 124
    },
    {
      pointId: 12946,
      pointName: '大屏展示中心',
      deptName: '销售2',
      pointType: 0,
      x: -5.775443,
      y: 3.9206772,
      z: -0.14997907,
      pixelX: 214,
      pixelY: 227
    },
    {
      pointId: 12962,
      pointName: '自动送货点',
      deptName: null,
      pointType: 0,
      x: -4.4771166,
      y: 6.612438,
      z: 1.3879231,
      pixelX: 240,
      pixelY: 173
    },
    {
      pointId: 13277,
      pointName: '后台展示',
      deptName: null,
      pointType: 0,
      x: -7.1372223,
      y: 3.865551,
      z: 3.1257043,
      pixelX: 187,
      pixelY: 228
    }
  ],
  floor: 1,
  width: 995,
  height: 570
}
const canvasRef = ref(null)
let camera, scene, renderer, controls
const scale = 100
const transformCood = (x, y) => {
  return [(x - mockData.width / 2) / scale, -(y - mockData.height / 2) / scale]
}
const initThree = (canvas) => {
  scene = new THREE.Scene()
  const planeWidth = mockData.width / scale
  const planeHeight = mockData.height / scale
  const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight)
  const loader = new THREE.TextureLoader()
  const texture = loader.load(mockData.enhanceMapUrl)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide
  })
  const plane = new THREE.Mesh(geometry, material)
  plane.position.set(0, 0, 0)
  scene.add(plane)

  mockData.mapPoint.forEach((item) => {
    const { pixelX: x, pixelY: y } = item
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff })
    const cube = new THREE.Mesh(geometry, material)
    cube.position.set(...transformCood(x, y), 0)
    scene.add(cube)
    // text
    // const loaderFont = new FontLoader()
    // loaderFont.load('/fonts/helvetiker_bold.typeface.json', (font) => {
    //   // 不支持中文，需要自己上传转换https://gero3.github.io/facetype.js/
    //   const textGeo = new TextGeometry('', {
    //     font: font,
    //     size: 50,
    //     height: 5,
    //     curveSegments: 12,
    //     bevelEnabled: true,
    //     bevelThickness: 10,
    //     bevelSize: 8,
    //     bevelSegments: 5
    //   })
    //   textGeo.computeBoundingBox()
    //   const centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x)
    //   const materials = [
    //     new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
    //     new THREE.MeshPhongMaterial({ color: 0xffffff }) // side
    //   ]
    //   const textMesh = new THREE.Mesh(textGeo, materials)
    //   //   textMesh.position.set(...transformCood(x, y), 0)
    //   textMesh.position.x = centerOffset
    //   scene.add(textMesh)
    // })

    // plan中的世界坐标
    item.vector = new THREE.Vector3(...transformCood(x, y), 0)
  })
  camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000)
  camera.position.set(1, -5, 10)
  camera.lookAt(0, 0, 0)
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  const { clientWidth, clientHeight } = renderer.domElement
  renderer.setSize(clientWidth * devicePixelRatio, clientHeight * devicePixelRatio, false)
  renderer.shadowMap.enabled = true
  renderer.setClearColor(0xbfd1e5)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.update()
  animate()
}

const animate = () => {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  controls.update()
}

const projectionData = ref({ ...mockData })
const handleExportProjection = () => {
  projectionData.value.mapPoint = mockData.mapPoint.map((item) => {
    const vector = item.vector.clone().project(camera) //通过世界坐标获取转标准设备坐标
    const w = mockData.width / 2
    const h = mockData.height / 2
    const x = Math.round(vector.x * w + w) //标准设备坐标转屏幕(投影)坐标
    const y = Math.round(-vector.y * h + h)
    return { ...item, px: x, py: y }
  })
  console.log(projectionData)
}
onMounted(() => {
  const { value: canvas } = canvasRef
  if (!canvas) {
    return
  }
  initThree(canvas)
  handleExportProjection()
})
</script>

<style lang="less" scoped>
.root {
  width: 100%;
  height: 100vh;
  position: relative;
  canvas {
    width: 100%;
    height: 100%;
  }
  .btn {
    position: absolute;
    top: 20px;
    right: 20px;
  }
  .map-img {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 995px;
    height: 570px;
    transform: scale(0.5) translate(-50%, -50%);
    .img {
      width: 100%;
      height: 100%;
    }
    .point {
      position: absolute;
      width: 30px;
      height: 30px;
      background-color: red;
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>
