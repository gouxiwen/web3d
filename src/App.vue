<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Base</RouterLink>
      <RouterLink to="/sky">Sky</RouterLink>
      <RouterLink to="/triangle">Triangle</RouterLink>
      <RouterLink to="/async-draw-base">异步绘制-基础</RouterLink>
      <RouterLink to="/async-draw-1">异步绘制-应用1</RouterLink>
      <RouterLink to="/async-draw-2">异步绘制-应用2</RouterLink>
      <RouterLink to="/async-draw-3">异步绘制-应用3</RouterLink>
      <RouterLink to="/async-draw-4">异步绘制-应用4</RouterLink>
      <RouterLink to="/transform">变换</RouterLink>
      <RouterLink to="/matrix-transform">矩阵变换</RouterLink>
      <RouterLink to="/matrix-multiply-transform">复合变换</RouterLink>
      <RouterLink to="/matrix-views">视图矩阵</RouterLink>
      <RouterLink to="/matrix-views-wave">视图矩阵-波浪</RouterLink>
      <RouterLink to="/color-multiply">颜色-多点异色</RouterLink>
      <RouterLink to="/color-wave">颜色-波浪异色</RouterLink>
      <RouterLink to="/texture">纹理</RouterLink>
      <RouterLink to="/texture-multiply">多面纹理</RouterLink>
      <RouterLink to="/texture-module">纹理-模块化实现</RouterLink>
      <RouterLink to="/texture-mix">纹理-图层混合</RouterLink>
      <RouterLink to="/texture-video">纹理-视频贴图</RouterLink>
      <RouterLink to="/glsl-1">glsl语言实战-渐变</RouterLink>
      <RouterLink to="/glsl-2">glsl语言实战-杂色</RouterLink>
      <RouterLink to="/glsl-3">glsl语言实战-金属色</RouterLink>
      <RouterLink to="/three-world1">三维世界-正交相机</RouterLink>
      <RouterLink to="/three-world2">三维世界-透视相机</RouterLink>
      <RouterLink to="/three-world3">三维世界-顶点索引</RouterLink>
      <RouterLink to="/multiply-shader">多着色器</RouterLink>
      <RouterLink to="/my-three-test">封装webgl框架</RouterLink>
      <RouterLink to="/three-world4">三维世界-鼠标选择立方体</RouterLink>
      <RouterLink to="/three-world5">三维世界-别墅室内布局</RouterLink>
      <RouterLink to="/light1">光-反射</RouterLink>
      <RouterLink to="/light2">光-纹理映射</RouterLink>
      <RouterLink to="/light3">光-纹理映射-VR</RouterLink>
      <RouterLink to="/light4">光-纹理映射-VR+陀螺仪</RouterLink>
      <RouterLink to="/light5">光-纹理映射-VR-切换场景</RouterLink>
      <RouterLink to="/light6">光-纹理映射-VR-切换场景(过渡)</RouterLink>
    </nav>
  </header>
  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>
