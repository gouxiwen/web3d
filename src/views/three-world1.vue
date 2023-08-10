<template>
  <div>三维世界-正交相机</div>
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
  OrthographicCamera
} from 'https://unpkg.com/three/build/three.module.js'
import Poly from '../utils/Poly-texture'
// 坐标系转换：
// 坐标系是一个四维矩阵
// [O2;i2,j2,k2]解析为矩阵为：
// [
//     i2.x,j2.x,k2.x,0,
//     i2.y,j2.y,k2.y,0,
//     i2.z,j2.z,k2.z,0,
//     O2.x,O2.y,O2.z,1
// ]
// 假如：
// 世界坐标系m1
// 二级坐标系m2
// 本地坐标系m3
// m3∈m2∈m1，二级坐标系可以有很多层，应用中对应与threejs中的group
// 则：
// 点P(4,5,6)在本地坐标系的位置是m3*(4,5,6)
// 点P(4,5,6)在二级坐标系的位置是m2*m3*(4,5,6)
// 点P(4,5,6)在世界级坐标系的位置是m1*m2*m3*(4,5,6)
// 本地坐标转世界坐标公式对于平移、旋转、缩放都成立

// 坐标系旋转探索
// 在右手坐标系的逆时针旋转里，绕y轴的逆时针旋转有点特别。
// 绕y轴旋转时：一顶点绕y轴逆时针旋转时，旋转量越大，弧度值越小。
// 而绕其它两个轴旋转时，则与其相反：一顶点绕x轴或z轴逆时针旋转时，旋转量越大，弧度值越大。

// 欧拉旋转：
// 欧拉旋转就是绕单轴多次逆时针旋转。
// const euler = new Euler(angX, angY, angZ)

// 四元数Quaternion：让物体绕任意轴旋转a°

// 投影矩阵：
// 将一个物体投影到已知左右上下远近的裁剪空间的矩阵
// 正交相机：
// 正交投影矩阵*视图矩阵
// 对应到threejs就是OrthographicCamera和lookAt

// 控制
// 平移，缩放，旋转
// 旋转有两种：
// 基于球坐标系的相机旋转轨道--上方向固定是y轴
// 轨迹球旋转--上方向是一个垂直于鼠标拖拽方向和视线的轴

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
    void main(){
      gl_Position = u_PvMatrix*a_Position;
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
  const halfH = 2
  const ratio = canvas.width / canvas.height
  const halfW = halfH * ratio
  const [left, right, top, bottom, near, far] = [-halfW, halfW, halfH, -halfH, 0, 4]
  const camera = new OrthographicCamera(left, right, top, bottom, near, far) // 可以得到正交投影矩阵
  const eye = new Vector3(1, 1, 3)
  const target = new Vector3(0, 0, 0)
  // camera.position.set(1, 1, 3)
  camera.position.copy(eye)
  camera.lookAt(target) // 可以得到视图矩阵
  camera.updateWorldMatrix(true) // 方法更新相机的世界坐标系,主要是考虑到了相机存在父级的情况
  const pvMatrix = new Matrix4()
  pvMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse) //借助threejs的正交相机得到正交投影矩阵和视图矩阵，计算出混合矩阵，应用到顶点着色器就可以得到threejs正交相机的效果
  // 画一前一后两个三角形
  const triangle1 = crtTriangle([1, 0, 0, 1], [0, 0.3, -0.2, -0.3, -0.3, -0.2, 0.3, -0.3, -0.2])
  const triangle2 = crtTriangle([1, 1, 0, 1], [0, 0.3, 0.2, -0.3, -0.3, 0.2, 0.3, -0.3, 0.2])
  render()

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT)

    triangle1.init()
    triangle1.draw()

    triangle2.init()
    triangle2.draw()
  }

  function crtTriangle(color, source) {
    return new Poly({
      gl,
      source: new Float32Array(source),
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
        }
      }
    })
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
    camera.zoom *= dollyScale
    camera.updateProjectionMatrix()
  }

  function pan(delta) {
    //相机近裁剪面尺寸
    const cameraW = camera.right - camera.left
    const cameraH = camera.top - camera.bottom
    //指针拖拽量在画布中的比值
    const ratioX = delta.x / canvas.clientWidth
    const ratioY = delta.y / canvas.clientHeight
    //将像素单位的位移量转换为相机近裁剪面上的位移量
    const distanceLeft = ratioX * cameraW
    const distanceUp = ratioY * cameraH
    //相机本地坐标系里的x轴
    const mx = new Vector3().setFromMatrixColumn(camera.matrix, 0)
    //相机x轴平移量
    const vx = mx.clone().multiplyScalar(-distanceLeft)
    //相机z|y轴平移量
    const vy = new Vector3()
    if (screenSpacePanning) {
      //y向
      vy.setFromMatrixColumn(camera.matrix, 1)
    } else {
      //-z向
      vy.crossVectors(camera.up, mx)
    }
    //相机y向或-z向的平移量
    vy.multiplyScalar(distanceUp)
    //整合平移量
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
