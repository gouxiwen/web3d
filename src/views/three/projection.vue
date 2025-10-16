<template>
  <div class="root">
    <canvas id="canvas" ref="canvasRef"></canvas>
    <a-button class="btn" @click="handleExportProjection">导出投影坐标</a-button>
    <div class="map-img">
      <img :src="projectionData.img2d" class="img" />
      <div
        v-for="(point, index) in projectionData.mapPoint"
        :key="index"
        class="point"
        :style="{ left: point.px + 'px', top: point.py + 'px' }"
      >
        <div class="dot"></div>
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
const planGroup = new THREE.Group()
const pointGroup = new THREE.Group()
const scale = 100
// 将平面坐标转换为三维坐标，此处地图及其中的点需相同的转换方法才能保证渲染处理位置正确
// 由于mockData中的像素数很大，放在three.js中会超出渲染范围，因此需要缩小因子scale，保证在渲染范围之内，缩小因子和相机的fov值及相机的位子共同影响渲染效果
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
  planGroup.add(plane)

  mockData.mapPoint.forEach((item) => {
    const { pixelX: x, pixelY: y } = item
    const geometry = new THREE.BoxGeometry(10 / scale, 10 / scale, 10 / scale)
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff })
    const cube = new THREE.Mesh(geometry, material)
    cube.position.set(...transformCood(x, y), 0)
    pointGroup.add(cube)
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
    item.vector3d = new THREE.Vector3(...transformCood(x, y), 0)
  })
  //   planGroup.rotation.x = -Math.PI / 4 // 自身旋转不影响导出的二维坐标
  planGroup.add(pointGroup)
  scene.add(planGroup)
  // 相机的fov值及相机的位子共同影响渲染效果，这里要保证plan的宽度正好等于渲染容器的宽度，才能保证导出的二维坐标比例正确
  camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000)
  camera.position.set(0, -5, 5)
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
  const { clientWidth, clientHeight } = renderer.domElement
  projectionData.value.mapPoint = mockData.mapPoint.map((item) => {
    const vector2d = item.vector3d.clone().project(camera) //通过世界坐标获取转标准设备坐标，3D转2D
    const w = clientWidth / 2
    const h = clientHeight / 2
    const x = Math.round(vector2d.x * w + w) //标准设备坐标转屏幕(投影)坐标
    const y = Math.round(-vector2d.y * h + h)
    return { ...item, px: x, py: y }
  })

  //   截图
  // three.js 出于性能方面的考虑，默认将preserveDrawingBuffer选项（是否保留缓（存）直到手动清除或被覆盖）设置为false，说明打开这个选项会造成较大的性能开销。
  // 既然three.js会一直清除缓存，那我在截图前，让它重新画一次不就行了？
  renderer.render(scene, camera) //关键代码
  projectionData.value.img2d = renderer.domElement.toDataURL('image/png')
}
onMounted(() => {
  const { value: canvas } = canvasRef
  if (!canvas) {
    return
  }
  initThree(canvas)
  setTimeout(handleExportProjection, 0)
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
  //   点位定位容器尺寸必需和three.js渲染容器尺寸一致，否则导出的二维坐标比例会不正确
  .map-img {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    transform: scale(0.3) translate(-116%, -116%);
    display: flex;
    align-items: center;
    overflow: hidden;
    .img {
      border: 1px solid #fff;
      width: 100%;
    }
    .point {
      position: absolute;
      transform: translate(-50%, -50%);
      font-size: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #000;
      .dot {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: red;
      }
    }
  }
}
</style>
