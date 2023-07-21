export default class Sky {
  constructor(gl) {
    this.gl = gl
    this.children = []
  }
  add(obj) {
    obj.gl = this.gl
    this.children.push(obj)
  }
  updateVertices(params) {
    this.children.forEach((ele) => {
      ele.updateVertices(params)
    })
  }
  draw() {
    this.children.forEach((ele) => {
      ele.init() //每个子对象对应一个buffer对象，所以在子对象绘图之前要先初始化。
      ele.draw()
    })
  }
}
