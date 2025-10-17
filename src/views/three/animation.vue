<template>
  <div class="root">
    <canvas id="canvas" ref="canvasRef"></canvas>
    <div class="animations">
      <a-button
        class="btn"
        type="primary"
        v-for="ani in animations"
        @click="() => fadeToAction(ani.name)"
        >{{ ani.name }}</a-button
      >
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as THREE from '../../../lib/three155'
import { GLTFLoader } from '../../../lib/three155/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from '../../../lib/three155/examples/jsm/controls/OrbitControls'
import { GUI } from '../../../lib/three155/examples/jsm/libs/lil-gui.module.min.js'

const gui = new GUI()
// gltf
const loader = new GLTFLoader()

const canvasRef = ref(null)
const animations = ref([])
let camera,
  scene,
  renderer,
  controls,
  clock,
  mixer,
  actions = {}
const initThree = (canvas) => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000)
  camera.position.set(0, 5, 10)
  camera.lookAt(0, 5, 0)
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  const { clientWidth, clientHeight } = renderer.domElement
  renderer.setSize(clientWidth * devicePixelRatio, clientHeight * devicePixelRatio, false)
  renderer.shadowMap.enabled = true
  renderer.setClearColor(0xbfd1e5)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.update()
  clock = new THREE.Clock()
  createLight()
  initGround()
  loadModel()

  animate()
}

// 创建光源
const createLight = () => {
  // lights
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3)
  hemiLight.position.set(0, 20, 0)
  scene.add(hemiLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 3)
  dirLight.position.set(0, 20, 10)
  dirLight.castShadow = true // default false 阴影
  scene.add(dirLight)

  // 灯光
  //   const pointLight = new THREE.PointLight(0xffffff, 200, 100)
  //   pointLight.position.set(0, 8, 1)
  //   pointLight.castShadow = true // default false 阴影
  //   scene.add(pointLight)
}
const initGround = () => {
  const groundGeo = new THREE.PlaneGeometry(10, 10)
  const groundMat = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = Math.PI * -0.5
  ground.receiveShadow = true
  scene.add(ground)

  const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000)
  grid.material.opacity = 0.2
  grid.material.transparent = true
  scene.add(grid)
}
// 加载模型
const loadModel = () => {
  loader.load(
    '/demo/RobotExpressive.glb',
    function (gltf) {
      console.log(gltf)
      const model = gltf.scene
      model.traverse(function (object) {
        if (object.isMesh) {
          object.castShadow = true
        }
      })
      const skeleton = new THREE.SkeletonHelper(model)
      skeleton.visible = true
      scene.add(skeleton)

      scene.add(model)
      animations.value = gltf.animations
      initAnimation(model, gltf.animations)
    },
    undefined,
    function (error) {
      console.error(error)
    }
  )
}

const initAnimation = (model, animations) => {
  const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing']
  const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp']
  mixer = new THREE.AnimationMixer(model)
  for (let index = 0; index < animations.length; index++) {
    const clip = animations[index]
    const action = mixer.clipAction(clip)
    actions[clip.name] = action
    if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
      // 只执行一次
      action.clampWhenFinished = true
      action.loop = THREE.LoopOnce
    }
  }

  // 表情
  const face = model.getObjectByName('Head_4')
  const expressions = Object.keys(face.morphTargetDictionary)
  const expressionFolder = gui.addFolder('Expressions')

  for (let i = 0; i < expressions.length; i++) {
    // morphTargetInfluences mesh属性，一个包含有权重（值一般在0-1范围内）的数组，指定应用了多少变形。
    // morphAttributes geometry属性，存储BufferAttribute的Hashmap，存储了几何体 morph targets 的细节信息。。
    expressionFolder.add(face.morphTargetInfluences, i, 0, 1, 0.01).name(expressions[i])
  }
  expressionFolder.open()
}

// 切换动作
let activeAction, previousAction
const fadeToAction = (name, duration = 0.2) => {
  previousAction = activeAction
  activeAction = actions[name]

  if (previousAction && previousAction !== activeAction) {
    previousAction.fadeOut(duration)
  }

  activeAction
    .reset()
    .setEffectiveTimeScale(1) // 时间(time)的比例因子. 值为0时会使动画暂停。值为负数时动画会反向执行。默认值是1。
    .setEffectiveWeight(1) // 动作的影响程度 (取值范围[0, 1]). 0 (无影响)到1（完全影响）之间的值可以用来混合多个动作。默认值是1
    .fadeIn(duration)
    .play()
}

const animate = () => {
  const dt = clock.getDelta()
  if (mixer) mixer.update(dt)

  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  controls.update()
}
onMounted(() => {
  const { value: canvas } = canvasRef
  if (!canvas) {
    return
  }
  initThree(canvas)
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
  .animations {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    .btn {
      margin: 5px;
    }
  }
}
</style>
