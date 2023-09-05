<template>
  <div>glsl语言实战-金属色</div>
  <div class="container">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { initShaders, imgPromise } from '../../utils/helper'
import Poly from '../../utils/Poly-texture'

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
    void main(){
      gl_Position = a_Position;
    }
  `
  // 片元着色器
  const fsSource = `
    precision mediump float;
    uniform vec2 u_CanvasSize;
    vec2 center=u_CanvasSize/2.0;
    float diagLen=length(center);
    float pi2=radians(360.0);
    float omega=4.0;
    float a=0.5;

    //渐变
    float gradient(float ang){
      return a*sin(omega*ang)+0.5; ;
    }

    //水平拉丝
    float wire(vec2 v){
      vec2 a= vec2(0.0,1.0);
      float n= dot(v,a);
      return fract(tan(n)*10000.0);
    }

    //杂色
    float noise(vec2 v){
      vec2 a= vec2(0.1234,0.5678);
      float n= dot(v,a);
      return fract(tan(n)*10000.0);
    }

    //获取弧度
    float getAngle(vec2 v){
      float ang=atan(v.y,v.x);
      if(ang<0.0){
          ang+=pi2;
      }
      return ang;
    }

    void main(){
      vec2 p=gl_FragCoord.xy-center;
      //极径
      float len=length(p);
      //极角
      float ang=getAngle(p);
      
      float x=u_CanvasSize.x*ang/pi2;
      float y=(len/diagLen)*u_CanvasSize.y;

      //渐变
      float f1 = gradient(ang);
      f1=0.65*f1+0.5;

      //拉丝
      float f2 = wire(vec2(int(x),int(y)));
      f2=clamp(f2,0.75,0.8);

      //杂色
      float f3 = noise(gl_FragCoord.xy);
      f3*=0.07;

      //复合亮度
      float f=f1*f2+f3;

      float ratio1=smoothstep(-1.0,1.0,sin(ang));
      float r=150.0;
      float expand1=r+4.0;
      if(len>r&&len<expand1){
          f*=ratio1+0.3;
      }

      gl_FragColor = vec4(vec3(f), 1);

    }
  `
  // 初始化着色器
  initShaders(gl, vsSource, fsSource)
  const source = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1])
  const rect = new Poly({
    gl,
    source,
    type: 'TRIANGLE_STRIP',
    attributes: {
      a_Position: {
        size: 2,
        index: 0
      }
    },
    uniforms: {
      u_CanvasSize: {
        type: 'uniform2fv',
        value: [canvas.width, canvas.height]
      }
    }
  })

  gl.clear(gl.COLOR_BUFFER_BIT)
  rect.draw()
  // let ang = 1
  // !(function ani() {
  //   ang++
  //   rect.uniforms.u_Ang.value = ang
  //   rect.updateUniform()
  //   gl.clear(gl.COLOR_BUFFER_BIT)
  //   rect.draw()
  //   requestAnimationFrame(ani)
  // })()
})
</script>
<style scoped>
.container {
  height: calc(100vh - 18px);
}
</style>
