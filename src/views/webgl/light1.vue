<template>
  <div>光-反射</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, imgPromise, createProgram } from '../../utils/helper'
import {
  Matrix4,
  Vector3,
  Vector2,
  Spherical,
  Object3D,
  PerspectiveCamera,
  Ray,
  SphereGeometry
} from 'three'
import OrbitControls from '../../utils/OrbitControls.js'
import { Geo, Mat, Obj3D, Scene } from '../../utils/my-three-plus'

// Blinn-Phone 漫反射的计算公式：
// Ld=kd(I/r²)*max(0,n·l)

// Ld-diffusely reflected light 漫反射
// kd-diffuse coefficient 漫反射系数，即颜色
// I/r²-着色点处的光线强度
// 入射光线l和着色点法线n，都是单位向量，所以n·l就是cos∠<n,l>，可以表示接收光线数量
// max(0,n·l)-着色点接收到的光线数量

// Blinn-Phone 计算镜面反射的公式如下：
// h=(v+l)/|v+l|
// Ls=ks*(I/r²)*pow(max(0,n·h),p)

// h：∠<v,v+l> 的角平分线
// |v+l|：(v+l) 的长度
// Ls：镜面反射 specularly reflected light
// ks：镜面反射系数 specularly coefficient
// max(0,n·h)：cos∠<h,n>
// pow(max(0,n·h),p)：cos∠<h,n>的p次方

// 解释一下cos∠<h,n>的p次方的意义。
// 若只用cos∠<h,n> 来计算高光，会得到较大的高光，而我们平时所见的高光一般都是比较小的。
// 因此，我们可以对cos∠<h,n>做一下幂运算。

// Blinn-Phone 计算环境反射的公式如下：
// La=ka*Ia

// La：环境反射 reflected ambient light
// ka：环境光系数 ambient coefficient
// Ia：环境光强度 ambient intensity

// Blinn-Phong 反射模型:
// 综上，将环境光Ambient、漫反射Diffuse 和高光Specular 加在一起的方法，就叫Blinn-Phong 反射模型，即：
// L=La+Ld+Ls
// L=ka*Ia+kd(I/r²)*max(0,n·l)+ks*(I/r²)*pow(max(0,n·h),p)

// 顶点着色器
const vsSource = `
    attribute vec4 a_Position;
    attribute vec3 a_Normal;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_PvMatrix;
    varying vec3 v_Normal;
    varying vec3 v_Position;
    void main(){
      gl_Position = u_PvMatrix*u_ModelMatrix*a_Position;
      v_Normal=a_Normal;
      v_Position=vec3(a_Position);
    }
  `
// 片元着色器
const fsSource = `
    precision mediump float;
    uniform vec3 u_Kd;
    uniform vec3 u_Ks;
    uniform vec3 u_Ka;
    uniform vec3 u_LightDir;
    uniform vec3 u_Eye;
    varying vec3 v_Normal;
    varying vec3 v_Position;

    void main(){
      //眼睛看向当前着色点的视线
      vec3 eyeDir=normalize(u_Eye-v_Position);
      //视线与光线之和
      vec3 el=eyeDir+u_LightDir;
      //视线与光线的角平分线
      vec3 h=el/length(el);
      //漫反射
      vec3 diffuse=u_Kd*max(0.0,dot(v_Normal,u_LightDir));
      //反射
      vec3 specular=u_Ks*pow(
        max(0.0,dot(v_Normal,h)),
        64.0
      );
      //Blinn-Phong反射
      vec3 l=diffuse+specular+u_Ka;
      gl_FragColor=vec4(l,1.0);
    }
  `

let gl, camera, scene, orbit
const init = () => {
  const canvas = document.getElementById('canvas')
  if (canvas) {
    // canvas 画布
    const canvas = document.getElementById('canvas')
    canvas.width = document.querySelector('.container').clientWidth
    canvas.height = document.querySelector('.container').clientHeight
    // webgl画笔
    gl = canvas.getContext('webgl')
    gl.clearColor(0, 0, 0, 1)
    gl.enable(gl.BLEND) // 开启透明度
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.enable(gl.DEPTH_TEST) // 深度测试可以解决物体的遮挡问题，不然后面的物体可能挡住前面的物体。

    // 目标点
    const target = new Vector3()
    //视点
    const eye = new Vector3(0.5, 1, 1)
    const [fov, aspect, near, far] = [45, canvas.width / canvas.height, 1, 20]
    // 透视相机
    camera = new PerspectiveCamera(fov, aspect, near, far)
    camera.position.copy(eye)
    // 轨道控制器
    orbit = new OrbitControls({ camera, target, dom: canvas })

    // 阳光的光线方向
    const LightDir = new Vector3(0.5, 1, 1).normalize()
    // 漫反射系数-颜色
    const u_Kd = [0.7, 0.7, 0.7]
    // 镜面反射系数-颜色
    const u_Ks = [0.3, 0.3, 0.3]
    // 环境光系数-颜色
    const u_Ka = [0.2, 0.2, 0.2]
    // 球体
    const sphere = new SphereGeometry(0.5, 24, 24)
    // 借助threejs的球体对象拿到顶点、法线、顶点索引
    // 顶点集合
    const { array: vertices } = sphere.getAttribute('position')
    // 法线集合
    const { array: normals } = sphere.getAttribute('normal')
    // 顶点索引集合
    const { array: indexes } = sphere.index
    // 场景
    scene = new Scene({ gl })
    // 注册程序对象
    scene.registerProgram('Blinn-Phong', {
      program: createProgram(gl, vsSource, fsSource),
      attributeNames: ['a_Position', 'a_Normal'],
      uniformNames: ['u_PvMatrix', 'u_ModelMatrix', 'u_Kd', 'u_LightDir', 'u_Ks', 'u_Eye', 'u_Ka']
    })

    const mat = new Mat({
      program: 'Blinn-Phong',
      data: {
        u_PvMatrix: {
          value: orbit.getPvMatrix().elements,
          type: 'uniformMatrix4fv'
        },
        u_ModelMatrix: {
          value: new Matrix4().elements,
          type: 'uniformMatrix4fv'
        },
        u_LightDir: {
          value: Object.values(LightDir),
          type: 'uniform3fv'
        },
        u_Kd: {
          value: u_Kd,
          type: 'uniform3fv'
        },
        u_Ks: {
          value: u_Ks,
          type: 'uniform3fv'
        },
        u_Ka: {
          value: u_Ka,
          type: 'uniform3fv'
        },
        u_Eye: {
          value: Object.values(camera.position),
          type: 'uniform3fv'
        }
      }
    })
    const geo = new Geo({
      data: {
        a_Position: {
          array: vertices,
          size: 3
        },
        a_Normal: {
          array: normals,
          size: 3
        }
      },
      index: {
        array: indexes
      }
    })
    const obj = new Obj3D({ geo, mat })
    scene.add(obj)
    render()

    bindEvent(canvas)
  }
}

const bindEvent = (canvas) => {
  /* 取消右击菜单的显示 */
  canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault()
  })
  /* 指针按下时，设置拖拽起始位，获取轨道控制器状态。 */
  canvas.addEventListener('pointerdown', (event) => {
    orbit.pointerdown(event)
  })
  /* 指针移动时，若控制器处于平移状态，平移相机；若控制器处于旋转状态，旋转相机。 */
  canvas.addEventListener('pointermove', (event) => {
    orbit.pointermove(event)
  })
  /* 指针抬起 */
  canvas.addEventListener('pointerup', (event) => {
    orbit.pointerup(event)
  })
  /* 滚轮事件 */
  canvas.addEventListener('wheel', (event) => {
    orbit.wheel(event)
  })
}

function updateOrbit() {
  scene.setUniform('u_PvMatrix', {
    value: orbit.getPvMatrix().elements
  })
}

function render() {
  updateOrbit()
  orbit.getPvMatrix()
  scene.setUniform('u_Eye', {
    value: Object.values(camera.position)
  })
  scene.draw()
  requestAnimationFrame(render)
}

onMounted(() => {
  init()
})
</script>
<style scoped lang="less">
.container {
  height: calc(100vh - 18px);
}
</style>
