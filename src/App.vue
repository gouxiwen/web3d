<template>
  <a-layout class="app-root">
    <a-layout-sider class="AppSider">
      <MenuList />
    </a-layout-sider>
    <a-layout>
      <a-layout-content class="AppContainer">
        <RouterView :key="$route.path" />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { RouterView } from 'vue-router'
import MenuList from '@/components/MenuList.vue'
</script>
<style lang="less" scoped>
.AppSider {
  height: 100vh;
  overflow: auto;
}
.AppContainer {
  background-color: #000;
  color: #fff;
}
</style>
