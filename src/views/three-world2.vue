<template>
  <div>三维世界-透视相机</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, imgPromise } from '../utils/helper'
import {
  Matrix4,
  Vector3,
  Vector2,
  Spherical,
  Object3D,
  PerspectiveCamera
} from 'https://unpkg.com/three/build/three.module.js'
import Poly from '../utils/Poly-texture'

// 投影矩阵：
// 将一个物体投影到已知左右上下远近的裁剪空间的矩阵
// 透视相机：
// 透视投影矩阵*视图矩阵
// 对应到threejs就是OrthographicCamera和lookAt

onMounted(() => {
  // canvas 画布
  const canvas = document.getElementById('canvas')
  canvas.width = document.querySelector('.container').clientWidth
  canvas.height = document.querySelector('.container').clientHeight
  // webgl画笔
  const gl = canvas.getContext('webgl')
  gl.clearColor(0, 0, 0, 1)
  // 顶点着色器
  const vsSource = `
    attribute vec4 a_Position;
    uniform mat4 u_PvMatrix;
    uniform mat4 u_ModelMatrix;
    void main(){
      gl_Position = u_PvMatrix*u_ModelMatrix*a_Position;
    }
  `
  // 片元着色器
  const fsSource = `
    precision mediump float;
    uniform vec4 u_Color;
    void main(){
      gl_FragColor=u_Color;
    }
  `
  // 初始化着色器
  initShaders(gl, vsSource, fsSource)
  const [fov, aspect, near, far] = [45, canvas.width / canvas.height, 1, 20]
  const camera = new PerspectiveCamera(fov, aspect, near, far)
  const eye = new Vector3(0, 0.5, 1)
  const target = new Vector3(0, 0, -2.5)
  // camera.position.set(1, 1, 3)
  camera.position.copy(eye)
  camera.lookAt(target) // 可以得到视图矩阵
  camera.updateWorldMatrix(true) // 方法更新相机的世界坐标系,主要是考虑到了相机存在父级的情况
  const pvMatrix = new Matrix4()
  pvMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse) //借助threejs的透视相机得到投影矩阵和视图矩阵，计算出混合矩阵，应用到顶点着色器就可以得到threejs透视相机的效果
  // 前面是两个黄色三角形，后面是两个红色三角形。
  const triangle1 = crtTriangle([1, 0, 0, 1], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -0.5, 0, -3, 1])
  const triangle2 = crtTriangle([1, 0, 0, 1], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0.5, 0, -3, 1])
  const triangle3 = crtTriangle([1, 1, 0, 1], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -0.5, 0, -2, 1])
  const triangle4 = crtTriangle([1, 1, 0, 1], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0.5, 0, -2, 1])

  function crtTriangle(color, modelMatrix) {
    return new Poly({
      gl,
      source: [0, 0.3, 0, -0.3, -0.3, 0, 0.3, -0.3, 0],
      type: 'TRIANGLES',
      attributes: {
        a_Position: {
          size: 3,
          index: 0
        }
      },
      uniforms: {
        u_Color: {
          type: 'uniform4fv',
          value: color
        },
        u_PvMatrix: {
          type: 'uniformMatrix4fv',
          value: pvMatrix.elements
        },
        u_ModelMatrix: {
          type: 'uniformMatrix4fv',
          value: modelMatrix
        }
      }
    })
  }

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT)

    triangle1.init()
    triangle1.draw()

    triangle2.init()
    triangle2.draw()

    triangle3.init()
    triangle3.draw()

    triangle4.init()
    triangle4.draw()
  }

  // 控制
  const mouseButtons = new Map([
    [2, 'pan'],
    [0, 'rotate']
  ])
  let state = 'none'
  const rotateDir = 'xy' // 控制可以在哪个方向旋转
  const zoomScale = 0.95
  //2PI
  const pi2 = Math.PI * 2
  //鼠标拖拽的起始位和结束位，无论是左键按下还是右键按下
  const [dragStart, dragEnd] = [new Vector2(), new Vector2()]
  const panOffset = new Vector3()
  const screenSpacePanning = true // 鼠标在屏幕上垂直拖拽时，是基于相机本地坐标系的y方向还是z方向移动相机

  //相机视点相对于目标的球坐标
  const spherical = new Spherical().setFromVector3(camera.position.clone().sub(target))
  canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault()
  })
  canvas.addEventListener('pointerdown', ({ clientX, clientY, button }) => {
    dragStart.set(clientX, clientY)
    state = mouseButtons.get(button)
  })
  canvas.addEventListener('pointermove', ({ clientX, clientY }) => {
    //指针拖拽的结束位(像素单位)
    dragEnd.set(clientX, clientY)
    switch (state) {
      case 'pan':
        //基于拖拽距离(像素单位)移动相机
        pan(dragEnd.clone().sub(dragStart))
        break
      case 'rotate':
        // 基于球坐标系的相机旋转
        rotate(dragEnd.clone().sub(dragStart))
        break
    }
    //重置拖拽起始位
    dragStart.copy(dragEnd)
  })
  canvas.addEventListener('wheel', handleMouseWheel)

  canvas.addEventListener('pointerup', (event) => {
    state = 'none'
  })
  function handleMouseWheel({ deltaY }) {
    if (deltaY < 0) {
      dolly(1 / zoomScale)
    } else if (deltaY > 0) {
      dolly(zoomScale)
    }
    update()
  }
  function dolly(dollyScale) {
    spherical.radius *= dollyScale
  }

  function pan(delta) {
    const { matrix, position, up } = camera
    const { clientWidth, clientHeight } = canvas

    //视线长度：相机视点到目标点的距离
    const sightLen = position.clone().sub(target).length()
    //视椎体垂直夹角的一半(弧度)
    const halfFov = (fov * Math.PI) / 360
    //目标平面的高度
    const targetHeight = sightLen * Math.tan(halfFov) * 2
    //目标平面与画布的高度比
    const ratio = targetHeight / clientHeight
    //画布位移量转目标平面位移量
    const distanceLeft = delta.x * ratio
    const distanceUp = delta.y * ratio
    //相机平移方向
    //鼠标水平运动时，按照相机本地坐标的x轴平移相机
    const mx = new Vector3().setFromMatrixColumn(matrix, 0)
    //鼠标水平运动时，按照相机本地坐标的y轴，或者-z轴平移相机
    const myOrz = new Vector3()
    if (screenSpacePanning) {
      //y轴，透视相机中默认
      myOrz.setFromMatrixColumn(matrix, 1)
    } else {
      //-z轴，透视相机中默认
      myOrz.crossVectors(up, mx)
    }

    //目标平面位移量转世界坐标
    const vx = mx.clone().multiplyScalar(-distanceLeft)
    const vy = myOrz.clone().multiplyScalar(distanceUp)
    panOffset.copy(vx.add(vy))
    //更新
    update()
  }
  function rotate({ x, y }) {
    const { clientHeight } = canvas
    const deltaT = (pi2 * x) / clientHeight // yes, height
    const deltaP = (pi2 * y) / clientHeight
    if (rotateDir.includes('x')) {
      spherical.theta -= deltaT
    }
    if (rotateDir.includes('y')) {
      const phi = spherical.phi - deltaP
      // 球坐标里的极角不能等于0或180度，0.00000001 ~ Math.PI* 0.99999999
      spherical.phi = Math.min(Math.PI * 0.99999999, Math.max(0.00000001, phi))
    }
    update()
  }
  function update() {
    target.add(panOffset)
    camera.position.add(panOffset)
    //基于旋转量旋转相机
    const rotateOffset = new Vector3().setFromSpherical(spherical)
    camera.position.copy(target.clone().add(rotateOffset))

    camera.lookAt(target)
    camera.updateWorldMatrix(true)
    pvMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    //重置旋转量和平移量
    spherical.setFromVector3(camera.position.clone().sub(target))
    panOffset.set(0, 0, 0)
    render()
  }
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
