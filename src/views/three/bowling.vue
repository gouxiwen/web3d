<template>
  <div class="bowling-game-root">
    <div class="content">
      <div>
        使用刚体库cannon-es，<a href="https://pmndrs.github.io/cannon-es/docs/" target="_blank"
          >api文档</a
        >
      </div>
    </div>
    <div class="btn-wrap">
      <a-button @click="moveLeft">左移</a-button>
      <a-button type="primary" @click="shoot">发射</a-button>
      <a-button @click="moveRitht">右移</a-button>
      <a-button @click="reset">复位</a-button>
    </div>
    <canvas id="canvas" ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Howl, Howler } from 'howler'
import {
  MeshBasicMaterial,
  MeshStandardMaterial,
  Mesh,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Texture,
  TextureLoader,
  WebGLRenderer,
  Vector2,
  Vector3,
  RepeatWrapping,
  BoxGeometry,
  SphereGeometry,
  PlaneGeometry,
  MeshPhongMaterial,
  DoubleSide,
  CylinderGeometry,
  DirectionalLight,
  PointLight,
  PointLightHelper,
  Color,
  AmbientLight,
  SpotLight,
  Object3D,
  Box3,
  Group
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as CANNON from 'cannon-es'
import groundImg from '@/assets/images/ground.jpg'
import wallImg from '@/assets/images/woman.webp'
import bowlingbgImg from '@/assets/images/bowlingbg.webp'
import pinSound from '@/assets/sounds/bowling/pin-1.mp3'

// Draco
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
dracoLoader.setDecoderConfig({ type: 'js' })
// gltf
const loader = new GLTFLoader()
loader.setDRACOLoader(dracoLoader)

let scene,
  renderer,
  camera,
  controls,
  sphere,
  sphereBody,
  pinBody,
  world,
  bowlingBall,
  bowlingPinArray = [],
  pinBodyArray = [],
  originalPositionArray = []
/**
 * 定义项目需要用到的材质
 */
const concreteMaterial = new CANNON.Material('concrete') //创建混凝土材质
const plasticMaterial = new CANNON.Material('plastic') //创建塑料材质
Howler.volume(0.5)
const groundSize = new Vector3(20, 0.2, 20)
let sphereRadius = 0.5 // y等于半径
let spherePosition = new CANNON.Vec3(0, sphereRadius, 3)
let pinBodyHeight = 1
let pinBodyRadius = 0.2
let pinBodyPosition = new CANNON.Vec3(0, pinBodyHeight / 2, -groundSize.z / 10)
const initThree = (canvas) => {
  scene = new Scene()
  camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 10, 13)
  camera.lookAt(0, 5, 0)
  renderer = new WebGLRenderer({ antialias: true, canvas })
  // 根据设备像素比决定渲染的像素，贴图不模糊
  const { clientWidth, clientHeight } = renderer.domElement
  renderer.setSize(clientWidth * devicePixelRatio, clientHeight * devicePixelRatio, false)
  renderer.shadowMap.enabled = true
  renderer.setClearColor(0xbfd1e5)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.update()
  createLight()
  initCannon()
  initGround()
  initWall()
  initSphere()
  initCylinder()
  animate()
}
// 创建光源
const createLight = () => {
  // 环境光
  // const ambientLight = new AmbientLight(0xab193d, 0.1) // 创建环境光
  // scene.add(ambientLight) // 将环境光添加到场景

  // 灯光
  const pointLight = new PointLight(0xffffff, 200, 100)
  pointLight.position.set(0, 10, 1)
  pointLight.castShadow = true // default false 阴影
  scene.add(pointLight)

  // const sphereSize = 1
  // const pointLightHelper = new PointLightHelper(pointLight, sphereSize)
  // scene.add(pointLightHelper)

  // 平行光
  // const light = new DirectionalLight(0xffffff, 2)
  // light.position.set(2, 20, 1)
  // light.castShadow = true // default false 阴影
  // scene.add(light)
}
// 创建地板
const initGround = () => {
  let texture = new TextureLoader().load(groundImg)
  texture.wrapS = texture.wrapT = RepeatWrapping
  // texture.repeat.set(1, 4)
  // let geometry = new BoxGeometry(groundSize.x, groundSize.y, groundSize.z)
  let geometry = new PlaneGeometry(groundSize.x, groundSize.z)
  // 需要添加光
  let material = new MeshPhongMaterial({
    map: texture
  })
  let mesh = new Mesh(geometry, material)
  mesh.rotation.x = -Math.PI / 2
  // mesh.position.y = -0.1
  mesh.receiveShadow = true
  scene.add(mesh)
  // let groundGeom = new BoxGeometry(40, 0.2, 40)
  // let groundMate = new MeshPhongMaterial({
  //   color: 0xdddddd
  // })
  // let ground = new Mesh(groundGeom, groundMate)
  // ground.position.y = -0.1
  // ground.receiveShadow = true
  // scene.add(ground) //step 5 添加地面网格

  /**
   * 创建地板刚体
   */
  const floorBody = new CANNON.Body()
  floorBody.mass = 0 //质量  质量为0时表示该物体是一个固定的物体即不可破坏
  floorBody.addShape(new CANNON.Plane()) //设置刚体的形状为CANNON.Plane 地面形状
  floorBody.material = concreteMaterial //设置材质
  // 由于平面初始化是是竖立着的，所以需要将其旋转至跟现实中的地板一样 横着
  // 在cannon.js中，我们只能使用四元数(Quaternion)来旋转，可以通过setFromAxisAngle(…)方法，第一个参数是旋转轴，第二个参数是角度
  floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
  world.addBody(floorBody)
}
// 创建墙
const initWall = () => {
  let texture = new TextureLoader().load(wallImg)
  texture.wrapS = texture.wrapT = RepeatWrapping
  // texture.repeat.set(1, 4)
  let geometry = new PlaneGeometry(groundSize.x, 10)
  // 需要添加光
  let material = new MeshPhongMaterial({
    map: texture
  })
  let mesh = new Mesh(geometry, material)
  mesh.position.z = -groundSize.x / 2
  mesh.position.y = 5
  mesh.receiveShadow = true
  scene.add(mesh)

  /**
   * 创建地板刚体
   */
  const floorBody = new CANNON.Body()
  floorBody.mass = 0 //质量  质量为0时表示该物体是一个固定的物体即不可破坏
  floorBody.addShape(new CANNON.Plane()) //设置刚体的形状为CANNON.Plane 地面形状
  floorBody.position.z = -groundSize.x / 2
  floorBody.material = concreteMaterial //设置材质
  world.addBody(floorBody)
}
// 创建球体
const initSphere = () => {
  // 圆球体
  // const geometry = new SphereGeometry(0.5, 50, 16)
  // const material = new MeshPhongMaterial({
  //   color: 0xffff00,
  //   specular: 0x7777ff // 高光颜色
  // })
  // sphere = new Mesh(geometry, material)
  // // sphere.position.y = 2
  // sphere.name = 'ball'
  // sphere.castShadow = true //default is false 阴影
  // scene.add(sphere)
  // bowlingBall = sphere
  // creatSphereBody()
  loadModel('/models/bowlingBall/base.glb', (model) => {
    scene.add(model)
    // model.scale.set(0.7, 0.7, 0.7)
    const box = new Box3().setFromObject(model)
    const x = box.max.x - box.min.x
    // const y = box.max.y - box.min.y
    // const z = box.max.z - box.min.z
    sphereRadius = x / 2
    spherePosition = new CANNON.Vec3(0, sphereRadius, groundSize.z / 2 - sphereRadius)
    const material = new MeshPhongMaterial({
      color: 0xffff00,
      specular: 0x7777ff // 高光颜色
    })
    model.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true
        child.material = material
        bowlingBall = child
      }
    })
    creatSphereBody()
  })
}
/**
 *创建球体刚体
 */
const creatSphereBody = () => {
  sphereBody = new CANNON.Body({
    mass: 10, //质量
    position: spherePosition, //位置
    //刚体的形状。 CANNON.Sphere为圆球体  CANNON.Box为立方体 更多形状查看文档：https://pmndrs.github.io/cannon-es/docs/classes/Shape.html
    shape: new CANNON.Sphere(sphereRadius),
    //材质  材质决定了物体(刚体)的弹力和摩擦力，默认为null，无弹力无摩擦。 plastic为塑料材质  concrete为混泥土材质。相关文档地址：https://pmndrs.github.io/cannon-es/docs/classes/Material.html
    material: plasticMaterial
  })
  //添加外力，这有点类似于风力一样，在某个位置向某物吹风
  // 该方法接收两个参数：force：力的大小(Vec3)    relativePoint：相对于质心施加力的点(Vec3)。
  // sphereBody.applyForce(new CANNON.Vec3(100, 0, 0), sphereBody.position)
  const sounds = new Howl({
    src: [pinSound],
    loop: false
  })
  sphereBody.addEventListener('collide', (_event) => {
    sounds.play()
    // if (_event.body.mass === 0) {
    // }
  })
  world.addBody(sphereBody) //向world中添加刚体信息
}
// 创建圆柱
const initCylinder = () => {
  // 圆球体
  // const geometry = new CylinderGeometry(pinBodyRadius, pinBodyRadius, pinBodyHeight, 10)
  // const material = new MeshPhongMaterial({
  //   color: 0xffff00,
  //   specular: 0x7777ff // 高光颜色
  // })
  // sphere = new Mesh(geometry, material)
  // sphere.position.y = pinBodyHeight / 2
  // sphere.castShadow = true //default is false 阴影
  // scene.add(sphere)
  // bowlingPin = sphere
  // creatPinBody()
  loadModel('/models/bowlingPin/base.glb', (model) => {
    // model.scale.set(0.5, 0.5, 0.5)
    const box = new Box3().setFromObject(model)
    const x = box.max.x - box.min.x
    // const y = box.max.y - box.min.y
    const z = box.max.z - box.min.z
    // 这里需要根据模型的初始状态来设置半径和高度，然后设置对应的刚体尺寸和位置
    pinBodyHeight = z
    pinBodyRadius = x / 2
    pinBodyPosition.y = pinBodyHeight / 2
    model.position.y = z / 2 // 由于几何体要旋转一下，所以取z轴的一半

    const material = new MeshPhongMaterial({
      color: 0xffffff,
      specular: 0x7777ff // 高光颜色
    })
    const redMaterial = new MeshPhongMaterial({
      color: 'red'
    })

    model.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true
        child.material = child.name === 'shadeRed' ? redMaterial : material
        // 设置相对位置为0，旋转起来才没有问题
        child.position.set(0, 0, 0)
        child.rotation.x = -Math.PI / 2
      }
    })
    // bowlingPin = model
    // scene.add(bowlingPin)
    // bowlingPin = model
    // creatPinBody()
    generatePin(model)
  })
}
// 批量生成瓶子和对应刚体
const generatePin = (model, widthCount = 5) => {
  const heightCount = widthCount
  for (let i = 0; i < heightCount; i++) {
    pinBodyPosition.z = i - 5
    for (let j = 0; j < widthCount; j++) {
      const newModel = model.clone()
      pinBodyPosition.x = j - widthCount / 2
      originalPositionArray.push(pinBodyPosition.clone())
      bowlingPinArray.push(newModel)
      scene.add(newModel)
      creatPinBody()
    }
    widthCount--
  }
}
/**
 * 创建瓶体刚体
 */
const creatPinBody = () => {
  pinBody = new CANNON.Body({
    mass: 0.2,
    position: pinBodyPosition,
    shape: new CANNON.Cylinder(pinBodyRadius, pinBodyRadius, pinBodyHeight, 10),
    material: plasticMaterial
  })
  pinBodyArray.push(pinBody)
  world.addBody(pinBody)
}
// 加载模型
const loadModel = (glb, callback) => {
  loader.load(
    glb,
    function (gltf) {
      const model = gltf.scene
      // scene.add(model)
      callback(model)
    },
    undefined,
    function (error) {
      console.error(error)
    }
  )
}
// 创建刚体，刚体就相当于现实生活中的物体（实体）一样 例如：桌子、板凳、大树、乒乓球等
const initCannon = () => {
  world = new CANNON.World() //初始化一个CANNON对象
  // 设置CANNON的引力  相当与地球的引力（您可以x轴也可以设置y轴或者z轴 负数则会向下掉，正数则向上）
  world.gravity.set(0, -9.82, 0)

  /**
   * 设置两种材质相交时的效果  相当于设置两种材质碰撞时应该展示什么样的效果 例如：篮球在地板上反弹
   */
  //创建一个接触材质
  const concretePlasticMaterial = new CANNON.ContactMaterial(
    concreteMaterial, //材质1
    plasticMaterial, //材质2
    {
      friction: 0.1, //摩擦力
      restitution: 0.7 //反弹力
    }
  )
  const plasticPlasticMaterial = new CANNON.ContactMaterial(
    plasticMaterial, //材质1
    plasticMaterial, //材质1
    {
      friction: 0.1, //摩擦力
      restitution: 0.7 //反弹力
    }
  )
  //添加接触材质配置
  world.addContactMaterial(concretePlasticMaterial)
  world.addContactMaterial(plasticPlasticMaterial)
}

// 连续渲染
const animate = () => {
  requestAnimationFrame(animate)
  world.fixedStep() //动态更新world
  // world.step(1 / 60) //动态更新world
  // sphere.position.copy(sphereBody.position) //设置threejs中的球体位置
  bowlingBall?.position.copy(sphereBody.position)
  bowlingBall?.quaternion.copy(sphereBody.quaternion)
  for (let index = 0; index < pinBodyArray.length; index++) {
    const pinBody = pinBodyArray[index]
    pinBody && bowlingPinArray[index]?.position.copy(pinBody.position)
    pinBody && bowlingPinArray[index]?.quaternion.copy(pinBody.quaternion)
  }
  controls.update()
  renderer.render(scene, camera)
}

const shoot = () => {
  sphereBody.applyForce(new CANNON.Vec3(0, 1000, 0), spherePosition)
}
const moveLeft = () => {
  sphereBody.position.x -= 0.5
}
const moveRitht = () => {
  sphereBody.position.x += 0.5
}
const reset = () => {
  sphereBody.position.copy(spherePosition)
  for (let index = 0; index < originalPositionArray.length; index++) {
    const position = originalPositionArray[index]
    pinBodyArray[index]?.position.copy(position)
    pinBodyArray[index]?.quaternion.copy(new CANNON.Quaternion())
    pinBodyArray[index]?.sleep()
  }
  sphereBody.sleep()
}
const canvasRef = ref(null)
onMounted(() => {
  const { value: canvas } = canvasRef
  if (!canvas) {
    return
  }
  initThree(canvas)
})
</script>

<style lang="less" scoped>
.bowling-game-root {
  width: 100%;
  height: 100vh;
  position: relative;
  canvas {
    width: 100%;
    height: 100%;
  }
  .content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
  .btn-wrap {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
    bottom: 0;
  }
}
</style>
