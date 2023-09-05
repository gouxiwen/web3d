<template>
  <div>封装webgl框架</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { createProgram } from '../../utils/helper'
import {
  Matrix4,
  Vector3,
  Vector2,
  Spherical,
  Object3D,
  PerspectiveCamera,
  OrthographicCamera
} from 'three'
import OrbitControls from '../../utils/OrbitControls.js'
import { Geo, Mat, Obj3D, Scene } from '../../utils/my-three'
import img from '../assets/images/erha.jpg'

onMounted(() => {
  // canvas 画布
  const canvas = document.getElementById('canvas')
  canvas.width = document.querySelector('.container').clientWidth
  canvas.height = document.querySelector('.container').clientHeight
  // webgl画笔
  const gl = canvas.getContext('webgl')
  gl.clearColor(0, 0, 0, 1)
  // 着纯色
  const solidVsSource = `
    attribute vec4 a_Position;
    void main(){
      gl_Position = a_Position;
    }
  `

  const solidFsSource = `
    precision mediump float;
    uniform float u_Time;
    void main(){
      float r=(sin(u_Time/200.0)+1.0)/2.0;
      gl_FragColor=vec4(r,0.7,0.4,1);
    }
  `
  // 着纹理
  const textureVsSource = `
    attribute vec4 a_Position;
    attribute vec2 a_Pin;
    varying vec2 v_Pin;
    void main(){
      gl_Position = a_Position;
      v_Pin=a_Pin;
    }
  `
  const textureFsSource = `
    precision mediump float;
    uniform sampler2D u_Sampler;
    varying vec2 v_Pin;
    void main(){
      gl_FragColor=texture2D(u_Sampler,v_Pin);
    }
  `
  gl.enable(gl.DEPTH_TEST) // 深度测试可以解决物体的遮挡问题，不然后面的物体可能挡住前面的物体。
  const halfH = 1
  const ratio = canvas.width / canvas.height
  const halfW = halfH * ratio
  const [left, right, top, bottom, near, far] = [-halfW, halfW, halfH, -halfH, 1, 8]
  const eye = new Vector3(0, 0, 2)
  const target = new Vector3(0, 0, 0)
  const camera = new OrthographicCamera(left, right, top, bottom, near, far)
  camera.position.copy(eye)
  camera.lookAt(target)
  camera.updateMatrixWorld()

  const scene = new Scene({ gl })

  // 建立纯色三角形
  const program = createProgram(gl, solidVsSource, solidFsSource)
  const mat = new Mat({
    program,
    data: {
      u_Time: {
        value: 0,
        type: 'uniform1f'
      },
      u_PvMatrix: {
        value: new Matrix4().elements,
        type: 'uniformMatrix4fv'
      },
      u_ModelMatrix: {
        value: new Matrix4().elements,
        type: 'uniformMatrix4fv'
      }
    }
  })
  const geo = new Geo({
    data: {
      a_Position: {
        array: new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, -0.5]),
        size: 2
      }
    }
  })
  const obj = new Obj3D({ geo, mat })
  scene.add(obj)

  // 建立纹理三角形
  const image = new Image()
  image.src = img
  image.onload = function () {
    const program = createProgram(gl, textureVsSource, textureFsSource)
    const mat = new Mat({
      program,
      data: {
        u_PvMatrix: {
          value: new Matrix4().elements,
          type: 'uniformMatrix4fv'
        },
        u_ModelMatrix: {
          value: new Matrix4().elements,
          type: 'uniformMatrix4fv'
        }
      },
      maps: {
        u_Sampler: {
          image
        }
      }
    })
    const geo = new Geo({
      data: {
        a_Position: {
          array: new Float32Array([0.5, 0.5, -0.5, 0.5, 0.5, -0.5]),
          size: 2
        },
        a_Pin: {
          array: new Float32Array([1, 1, 0, 1, 1, 0]),
          size: 2
        }
      }
    })
    const obj = new Obj3D({ geo, mat })
    scene.add(obj)

    /* 统一设置uniform变量 */
    scene.setUniform('u_PvMatrix', {
      value: camera.projectionMatrix.clone().multiply(camera.matrixWorldInverse).elements
    })
  }

  render()
  function render(time = 0) {
    scene.children[0].mat.setData('u_Time', { value: time })
    scene.draw()
    requestAnimationFrame(render)
  }
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
