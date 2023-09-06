import { AxesHelper, GridHelper, LineBasicMaterial, Object3D } from "three"

export default class AxesGridHelper {
    grid
    axes
    _visible = true
    constructor(obj, size = 2) {
        const axes = new AxesHelper()
        const axesMat = axes.material
        axesMat.depthTest = false
        obj.add(axes)

        const grid = new GridHelper(size)
        const gridMat = grid.material
        gridMat.depthTest = false
        obj.add(grid)

        this.grid = grid
        this.axes = axes
        this.visible = this._visible
    }
    get visible() {
        return this._visible
    }
    set visible(v) {
        this._visible = v
        this.grid.visible = v
        this.axes.visible = v
    }
}