<template>
  <div class="page-root" ref="appRef"></div>
</template>
<script setup>
import * as THREE from 'three'
import MMFT from 'metamaker-for-three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import GUI from 'lil-gui'
import { onMounted, ref } from 'vue'

let renderer
let scene
let camera
let controls
let idol
let gui
// let stats
let lookTarget
let mixer
// let ttsAuth

const canvasRect = {
  width: 0,
  height: 0
}

const params = {
  name: '虚拟人物女性',
  url: '/models/heijing/man.glb',
  自定义模型地址: '',
  pose: 'anim/Talking_BGY_F0',
  poseEmo: '',
  fadeIn: 0,
  fadeOut: 0,
  ttsText: '',
  audioURL: '',
  teethAnimURL: '',
  emoAnimURL: '',
  appKey: '',
  appSecret: '',
  loop: THREE.LoopRepeat,
  boneRatio: 0.65,
  toothDownRatio: 0.65
}
const activeActions = []
const animations = {
  'anim/220515_daiji': 'anim/220515_daiji',
  'anim/Stand_Idel': 'anim/Stand_Idel',
  'anim/Talking_BGY_F0': 'anim/Talking_BGY_F0',
  'anim/anim_220415_F34': 'anim/anim_220415_F34',
  'anim/Anim_220422_F5311': 'anim/Anim_220422_F5311',
  'anim/ABS_Fxiang_shuangren_16_M0': 'anim/ABS_Fxiang_shuangren_16_M0',
  'anim/BaseAnim/Anim_walk_M01': 'anim/BaseAnim/Anim_walk_M01',
  'anim/BaseAnim/Anim_run_F01': 'anim/BaseAnim/Anim_run_F01',
  'anim/Anim_220705_F26': 'anim/Anim_220705_F26',
  'anim/BD_xl0011_01_F0': 'anim/BD_xl0011_01_F0',
  'anim/Anim_220808_F37': 'anim/Anim_220808_F37',
  'anim/Anim_220808_F38': 'anim/Anim_220808_F38'
}
const initThree = async (app) => {
  // 创建renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    logarithmicDepthBuffer: false
  })

  canvasRect.width = window.innerWidth
  canvasRect.height = window.innerHeight
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(canvasRect.width, canvasRect.height)
  renderer.outputEncoding = THREE.sRGBEncoding

  renderer.physicallyCorrectLights = true
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  app.appendChild(renderer.domElement)
  // 创建Scene
  scene = new THREE.Scene()
  // 创建Camera
  camera = new THREE.PerspectiveCamera(23, window.innerWidth / window.innerHeight, 0.1, 10000)
  camera.rotation.set(-0.17, 0, 0)
  camera.position.set(0, 1.2, 3.3)
  lookTarget = new THREE.Vector3(0, 0.5, 0)
  camera.lookAt(lookTarget)
  // 创建Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = true
  controls.enableZoom = true
  controls.target.set(0, 0.5, 0)
  controls.update()
  // 创建Idol
  controls.addEventListener('end', () => {
    MMFT.core.resetPolygonOffset(idol, camera)
  })

  await replaceIdol(params.url)
  MMFT.core.resetPolygonOffset(idol, camera)
  mixer = new THREE.AnimationMixer(idol)
  scene.add(idol)
  addDefaultLights(scene)
  const clock = new THREE.Clock()
  function animate() {
    const delta = clock.getDelta()
    try {
      mixer && mixer.update(delta)
      gui && gui.controllersRecursive().forEach((controller) => controller.updateDisplay())
      // MMFT.ClothPhysics.ClothPhysicManagerInstance.updateClothPhysics();
    } catch (e) {
      console.error(e)
    } finally {
      requestAnimationFrame(animate)
      render()
    }
  }
  function render() {
    renderer.render(scene, camera)
  }
  animate()
  addGui()
  handleChangePose('anim/Talking_BGY_F0') // 设置默认动作
}

/**
 *
 * @param opts
 * @desc
 * 接受模型的地址：
 * 用户通过数字人平台下载的数字人通常为一个zip包。将下载的zip包放到自己的开发服务器或者，OSS云服务器上，
 * 可以直接使用地址进行加载。
 */
async function replaceIdol(opts) {
  if (idol) {
    scene.remove(idol)
    idol.clear()
    idol = null
  }

  idol = await MMFT.core.loadGLTFModel(opts)
  // MMFT.ClothPhysics.ClothPhysicManagerInstance.setClothPhysics(idol);

  idol.traverse((child) => {
    if (child.type == 'Mesh' || child.type == 'SkinnedMesh') {
      // child.material.envMap = envMap;
      const anyTing = child
      anyTing.material.envMapIntensity = 0.3
      anyTing.material.needsUpdate = true
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  MMFT.core.resetPolygonOffset(idol, camera)
  mixer = new THREE.AnimationMixer(idol)
  scene.add(idol)
}

/**
 *
 * @param scene
 * 创建场景的灯光，根据实际需求，创建合适灯光
 */
function addDefaultLights(scene) {
  const dirLight = new THREE.DirectionalLight()
  dirLight.color = new THREE.Color(0xffffff)
  dirLight.intensity = 0.4
  dirLight.position.set(-1.45, 1, 3.57)
  scene.add(dirLight)

  const directionalLight = new THREE.DirectionalLight(0xaaaaaa)
  directionalLight.position.set(-10, 35, 15).normalize()
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048 // default
  directionalLight.shadow.mapSize.height = 2048 // default
  directionalLight.shadow.bias = -0.0001

  directionalLight.shadow.camera.near = 0.1 // default
  directionalLight.shadow.camera.far = 10 // default
  directionalLight.shadow.camera.top = 2
  directionalLight.shadow.camera.right = 2
  directionalLight.shadow.camera.bottom = -2
  directionalLight.shadow.camera.left = -2
  scene.add(directionalLight)
  //scene.add(new THREE.CameraHelper(directionalLight.shadow.camera))
  const ambient = new THREE.AmbientLight(0xaaaaaa)
  scene.add(ambient)
  // const hemiLight = new THREE.HemisphereLight(0xffffff);
  // hemiLight.visible = true;
  // hemiLight.intensity = 0.15;
  // hemiLight.position.set(0, 0, 20);
  //scene.add(hemiLight);

  let spot = new THREE.SpotLight(0xffffff)
  spot.color = new THREE.Color(0xffffff)
  spot.visible = true
  spot.distance = 0
  spot.intensity = 0.28
  spot.penumbra = 0
  spot.decay = 2
  spot.position.set(-1.44, 1.59, 3.57)
  spot.angle = 1
  scene.add(spot)
  scene.add(spot.target)

  spot = new THREE.SpotLight(0xffffff)
  spot.intensity = 0.35
  spot.angle = 1
  spot.penumbra = 0
  spot.distance = 0
  spot.position.set(3.68, 0.15, 7.93)
  scene.add(spot)
  scene.add(spot.target)

  spot = new THREE.SpotLight(0xffffff)
  spot.intensity = 0.9
  spot.distance = 0
  spot.angle = 1
  spot.penumbra = 0
  spot.decay = 2
  spot.position.set(0.39, 1.19, -0.91)
  scene.add(spot)
  scene.add(spot.target)

  const material = new THREE.ShadowMaterial()
  material.opacity = 0.3 //! bug in threejs. can't set in constructor
  material.depthWrite = false
  const geometry = new THREE.PlaneGeometry(3, 3)
  const planeMesh = new THREE.Mesh(geometry, material)
  planeMesh.receiveShadow = true
  //planeMesh.d = false;
  planeMesh.rotation.x = -Math.PI / 2
  scene.add(planeMesh)
  // const hdrUrls = ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']
  // const hdrCubeMap = new THREE.CubeTextureLoader()
  //   .setPath('./textures/windows/')
  //   .load(hdrUrls, function () {
  //     const gen = new THREE.PMREMGenerator(renderer)
  //     const hdrCubeRenderTarget = gen.fromCubemap(hdrCubeMap)
  //     hdrCubeMap.magFilter = THREE.LinearFilter
  //     hdrCubeMap.needsUpdate = true
  //     hdrCubeMap.encoding = THREE.sRGBEncoding
  //     scene.environment = hdrCubeRenderTarget.texture
  //   })
}

/**
 * @desc 添加右侧的编辑窗体
 */
function addGui() {
  gui = new GUI()
  const animateGui = gui.addFolder('Pose Animate')
  animateGui.add(params, 'fadeIn', 0, 10, 0.01)
  animateGui.add(params, 'fadeOut', 0, 10, 0.01)
  animateGui.add(params, 'pose', animations).onChange(handleChangePose)
  animateGui.add(params, 'pose').onChange(handleChangePose)
  animateGui.add(params, 'loop', { LoopOnce: THREE.LoopOnce, LoopRepeat: THREE.LoopRepeat })
}

/**
 * @param value
 * 用于gui直接修改当前播放的动画
 * 通过动画名称加载的的动画资源，并进行播放
 */
async function handleChangePose(value) {
  const animateJSON = await MMFT.core.loadAnimationData(value)
  const clip = MMFT.core.Convert(animateJSON)
  console.warn(`pose clip `, clip)
  const action = mixer.clipAction(clip)
  while (activeActions.length) {
    const action = activeActions.pop()
    if (params.fadeOut) {
      action.fadeOut(params.fadeOut)
    }
    setTimeout(() => {
      action.paused = true
      action.stop()
    }, params.fadeOut * 1000)
  }

  activeActions.push(action)
  if (params.fadeIn) {
    action.fadeIn(params.fadeIn)
  }
  action.loop = params.loop
  action.play()
}

const appRef = ref(null)
onMounted(() => {
  const { value: canvas } = appRef
  if (!canvas) {
    return
  }
  initThree(canvas)
})
</script>
<style scoped lang="less">
.page-root {
}
</style>
