<template>
  <div>视图矩阵</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
import { initShaders } from '../../utils/helper'
import { Matrix4, Quaternion, Vector3 } from 'three'
// 相机的定义:
// 视点：相机的位置
// 视线方向：相机所看的方向
// 上方向：相机绕视线转动的方向
// 默认相机的视点就在零点，相机看向-z方向，其上方向就是y轴
// 视图矩阵：
// 相机运动，现实中就是让相机改变视点、视线方向或者上方向
// 然而在程序里相机的这三个特性一般是不会变的，要实现相机运动的效果就要相对地改变场景中物体的位置，这个相对地改变场景中的物体的矩阵，就是视图矩阵
// 转置矩阵：
// 将矩阵的行列互换得到的新矩阵称为转置矩阵
// 逆矩阵：
// 设A是一个n阶矩阵，若存在另一个n阶矩阵B，使得： AB=BA=E ，则称方阵A可逆，并称方阵B是A的逆矩阵
// 正交矩阵：
// 正交矩阵是指其转置等于逆的矩阵
// 坐标系对齐：
// 三维直角坐标系m1，其基向量是：
// x(1,0,0)
// y(0,1,0)
// z(0,0,1)

// 三维直角坐标系m2，其基向量是：
// x(cos30°, sin30°,0)
// y(-sin30°,cos30°,0)
// z(0, 0, 1)
// 求m1中的基向量对齐到m2的行主序矩阵m3？
// m1是单位向量，所以：
// 将m2的基向量x,y,z 中的x 分量写入m3第1行;
// 将m2的基向量x,y,z 中的y 分量写入m3第2行;
// 将m2的基向量x,y,z 中的z 分量写入m3第3行。
// m3=[
//     cos30°,-sin30°,0,0,
//     sin30°,cos30°, 0,0,
//     0,     0,      1,0,
//     0,     0,      0,1,
// ]
// 那么m2中的基向量对齐到m1的行主序矩阵m4应该是m3的转置矩阵
// m4=[
//     cos30°,sin30°,0,0,
//     -sin30°,cos30°,0,0,
//     0,0,1,0,
//     0,0,0,1
// ]
// 计算视图矩阵:
// 求{e;a,b,c}的视图矩阵，设相机坐标为{o;x,y,-z}
// 有了上面m4的求解方法就可以得到求解视图矩阵的方法了
// 1.先求位移矩阵mt
// mt=[
//   1,0,0,-ex,
//   0,1,0,-ey,
//   0,0,1,-ez,
//   0,0,0,1,
// ]
// 2.再求旋转矩阵mr(同m4)
// 先写出把{o;x,y,-z} 对齐到{e;a,b,c} 的行主序旋转矩阵mr1
// mr1=[
//      ax, bx, -cx, 0,
//      ay, by, -cy, 0,
//      az, bz, -cz, 0,
//      0,  0,   0,  1
// ]
// 再得到逆矩阵mr2
// mr2=[
//      ax, ay, az, 0,
//      bx, by, bz, 0,
//     -cx,-cy,-cz, 0,
//      0,  0,   0, 1
// ]
// 视图矩阵 = mt*mr2
// 进而推导出基于视点e、目标点t、上方向u生成视图矩阵的函数。
// function getViewMatrix(e, t, u) {
//   //基向量c，视线
//   const c = new Vector3().subVectors(e, t).normalize()
//   //基向量a，视线和上方向的垂线
//   const a = new Vector3().crossVectors(u, c).normalize()
//   //基向量b，修正上方向
//   const b = new Vector3().crossVectors(c, a).normalize()
//   //正交旋转矩阵
//   const mr = new Matrix4().set(
//     ...a, 0,
//     ...b, 0,
//     -c.x, -c.y, -c.z, 0,
//     0, 0, 0, 1
//   )
//   //位移矩阵
//   const mt = new Matrix4().set(
//     1, 0, 0, -e.x,
//     0, 1, 0, -e.y,
//     0, 0, 1, -e.z,
//     0, 0, 0, 1
//   )
//   return mr.multiply(mt).elements
// }
// 而这也是threejs里lookAt的实现原理

function getViewMatrix(e, t, u) {
  //基向量c，视线
  const c = new Vector3().subVectors(e, t).normalize()
  //基向量a，视线和上方向的垂线
  const a = new Vector3().crossVectors(u, c).normalize()
  //基向量b，修正上方向
  const b = new Vector3().crossVectors(c, a).normalize()
  //正交旋转矩阵
  const mr = new Matrix4().set(...a, 0, ...b, 0, -c.x, -c.y, -c.z, 0, 0, 0, 0, 1)
  //位移矩阵
  const mt = new Matrix4().set(1, 0, 0, -e.x, 0, 1, 0, -e.y, 0, 0, 1, -e.z, 0, 0, 0, 1)
  return mr.multiply(mt).elements
}

onMounted(() => {
  // canvas 画布
  const canvas = document.getElementById('canvas')
  canvas.width = document.querySelector('.container').clientWidth
  canvas.height = document.querySelector('.container').clientHeight

  // webgl画笔
  const gl = canvas.getContext('webgl')
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 顶点着色器
  // 用attribute定义顶点变量
  // 用uniform定义矩阵变量
  // 四维矩阵
  const vsSource = `
    attribute vec4 a_Position;
    //模型矩阵
    uniform mat4 u_ModelMatrix;
    //视图矩阵
    uniform mat4 u_ViewMatrix;
    void main(){
      gl_Position = u_ViewMatrix*u_ModelMatrix*a_Position;
    }
  `
  // 片元着色器
  const fsSource = `
      void main(){
        gl_FragColor=vec4(1.0,1.0,0.0,1.0);
      }
  `
  // 初始化着色器
  initShaders(gl, vsSource, fsSource)
  // 顶点基本坐标
  const verticeLib = [
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
    -1.0, 1.0, -1.0, -1.0, -1.0, -1.0
  ]
  // 线段连接指示点
  const indices = [0, 1, 1, 2, 2, 3, 3, 0, 0, 5, 1, 6, 2, 7, 3, 4, 4, 5, 5, 6, 6, 7, 7, 4]

  const arr = []
  // 将顶点基本坐标按照缩放比例scale分配到连接指示点
  const scale = 20
  indices.forEach((n) => {
    const i = n * 3
    arr.push(verticeLib[i] / scale, verticeLib[i + 1] / scale, verticeLib[i + 2] / scale)
  })
  const vertices = new Float32Array(arr)
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(a_Position)

  const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
  const modelMatrix = new Matrix4()
  const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
  // const viewMatrix = getViewMatrix(
  //   new Vector3(0.1, 0.2, 0.5),
  //   new Vector3(0.0, 0.0, 0),
  //   new Vector3(0, 1, 0)
  // )
  // getViewMatrix方法不完美，会出现一些断开bug
  const viewMatrix = new Matrix4().lookAt(
    new Vector3(0, 0.25, 1),
    new Vector3(0, 0, 0),
    new Vector3(0, 1, 0)
  ).elements
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix)

  let angle = 0
  const minY = -0.5
  const maxY = 0.5
  let y = maxY
  let vy = 0
  const ay = -0.001
  const bounce = 1

  !(function ani() {
    angle += 0.01
    vy += ay
    y += vy
    modelMatrix.makeRotationY(angle)
    modelMatrix.setPosition(0, y, 0)
    if (modelMatrix.elements[13] < minY) {
      y = minY
      vy *= -bounce
    }

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.LINES, 0, indices.length)
    requestAnimationFrame(ani)
  })()
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
