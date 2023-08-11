export default class Track {
  constructor(target) {
    this.target = target
    this.parent = null
    this.start = 0
    this.timeLen = 5
    this.loop = false
    this.keyMap = new Map()
    this.onEnd = () => {}
    this.prevTime = 0
  }
  update(t) {
    const { keyMap, timeLen, target, loop, start, prevTime } = this
    let time = t - start // 时间间隔
    // 超过最大阈值执行自定义回调
    if (timeLen >= prevTime && timeLen < time) {
      this.onEnd()
    }
    this.prevTime = time
    if (loop) {
      // time的值会在0~timelen之间循环
      time = time % timeLen
    }
    for (const [key, fms] of keyMap) {
      if (!target[key]) continue
      const last = fms.length - 1
      if (time < fms[0][0]) {
        // 时间间隔小于第一个关键帧
        target[key] = fms[0][1]
      } else if (time > fms[last][0]) {
        // 时间间隔大于最后一个关键帧
        target[key] = fms[last][1]
      } else {
        // 中间状态使用斜率函数计算
        target[key] = getValBetweenFms(time, fms, last)
      }
    }
  }
}

function getValBetweenFms(time, fms, last) {
  for (let i = 0; i < last; i++) {
    const fm1 = fms[i]
    const fm2 = fms[i + 1]
    if (time >= fm1[0] && time <= fm2[0]) {
      const delta = {
        x: fm2[0] - fm1[0],
        y: fm2[1] - fm1[1]
      }
      const k = delta.y / delta.x
      const b = fm1[1] - fm1[0] * k
      // 根据两个关键帧算出斜率和偏移，带入时间算出当前位置
      return k * time + b
    }
  }
}
