<template>
  <div class="title">实战-机房</div>
  <div ref="divRef" class="canvasWrapper" @mousemove="mouseMove">
    <canvas id="canvas" ref="canvasRef"></canvas>
    <div
      id="plane"
      :style="{
        left: state.planePos.left + 'px',
        top: state.planePos.top + 'px',
        display: state.planeDisplay
      }"
    >
      <p>机柜名称：{{ state.curCabinet.name }}</p>
      <p>机柜温度：{{ state.curCabinet.temperature }}°</p>
      <p>使用情况：{{ state.curCabinet.count }}/{{ state.curCabinet.capacity }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MachineRoom from './MachineRoom'
import { getCabinetByName } from './server/Cabinet'

let room
const canvasRef = ref()
const state = ref({
  //信息面板的位置
  planePos: {
    left: 0,
    top: 0
  },
  // 信息面板的可见性
  planeDisplay: 'none',
  // 当前机柜的详细信息
  curCabinet: {
    // 名称
    name: 'Loading……',
    // 温度
    temperature: 0,
    // 容量
    capacity: 0,
    // 服务器数量
    count: 0
  }
})

// 鼠标移动事件
const mouseMove = ({ clientX, clientY }) => {
  room.selectCabinet(clientX - canvasRef.value?.getBoundingClientRect().left, clientY)
}

onMounted(() => {
  const { value: canvas } = canvasRef
  if (!canvas) {
    return
  }
  canvas.width = canvas.getBoundingClientRect().width
  canvas.height = canvas.getBoundingClientRect().height
  room = new MachineRoom(canvas, '/machineRoomSource/')
  room.loadGLTF('machineRoom.gltf')
  room.animate()
  //当鼠标划入机柜，显示信息面板
  room.onMouseOverCabinet = ({ name }) => {
    state.value.planeDisplay = 'block'
    //基于cabinet.name 获取机柜数据
    getCabinetByName(name).then(({ temperature, capacity, count }) => {
      state.value.curCabinet = { name, temperature, capacity, count }
    })
  }
  //当鼠标在机柜上移动，让信息面板随鼠标移动
  room.onMouseMoveCabinet = (left, top) => {
    state.value.planePos = { left, top }
  }
  //当鼠标划出机柜，隐藏信息面板
  room.onMouseOutCabinet = () => {
    state.value.planeDisplay = 'none'
  }
})
</script>

<style lang="less">
.title {
  position: absolute;
}
.canvasWrapper,
canvas {
  height: 100%;
  width: 100%;
}
#plane {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 0 18px;
  // transform: translate(12px, -100%);
  display: none;
}
</style>
