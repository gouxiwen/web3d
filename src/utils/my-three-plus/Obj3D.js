const defAttr = () => ({
  geo: null,
  mat: null
})
export default class Obj3D {
  constructor(attr) {
    Object.assign(this, defAttr(), attr)
  }
  init(gl) {
    this.geo.init(gl)
    this.mat.init(gl)
  }
  update(gl, attributes, uniforms) {
    this.geo.update(gl, attributes)
    this.mat.update(gl, uniforms)
  }
}
