import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class Stage {
    // 渲染器
    renderer;
    // 场景
    scene;
    // 相机
    camera;
    // 轨道控制器
    controls;
    // 渲染之前
    beforeRender = (time = 0) => { };

    // 初始化场景
    constructor(x = 2, y = 3, z = 4) {
        this.scene = new Scene();
        this.renderer = new WebGLRenderer({ antialias: true });
        const { clientWidth, clientHeight } = this.renderer.domElement;
        this.renderer.setSize(clientWidth * devicePixelRatio, clientHeight * devicePixelRatio, false);
        this.camera = new PerspectiveCamera(45, clientWidth / clientHeight, 0.1, 1000);
        this.camera.position.set(x, y, z);
        this.camera.lookAt(0, 0, 0);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    // 响应式布局
    responsive() {
        const { renderer, camera } = this;
        if (this.resizeRendererToDisplaySize(renderer)) {
            const { clientWidth, clientHeight } = renderer.domElement;
            camera.aspect = clientWidth / clientHeight;
            camera.updateProjectionMatrix();
        }
    }

    // 重置渲染尺寸
    resizeRendererToDisplaySize(renderer) {
        const { width, height, clientWidth, clientHeight } = renderer.domElement;
        const [w, h] = [clientWidth * devicePixelRatio, clientHeight * devicePixelRatio];
        const needResize = width !== w || height !== h;
        if (needResize) {
            renderer.setSize(w, h, false);
        }
        return needResize;
    }

    // 连续渲染
    animate(time = 0) {
        this.responsive();
        this.beforeRender(time);
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame((time) => {
            this.animate(time);
        });
    }
}