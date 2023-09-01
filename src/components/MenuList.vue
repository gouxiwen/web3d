<template>
  <a-menu
    v-model:selectedKeys="selectedKeys"
    v-model:openKeys="openKeys"
    theme="dark"
    mode="inline"
  >
    <MenuItem :routes="routes" prefix="" />
  </a-menu>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { routes } from '@/router/index'
import MenuItem from './MenuItem.vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const selectedKeys = ref([])
const openKeys = ref([])
function setMenuCurrent() {
  const { matched } = route
  openKeys.value = matched.slice(0, matched.length - 1).map((i) => i.path)
  selectedKeys.value = [route.path]
}
onMounted(() => setMenuCurrent())
watch(() => route.path, setMenuCurrent)
</script>
