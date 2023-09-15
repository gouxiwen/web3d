import { MeshBasicMaterial, MeshStandardMaterial, Mesh, PerspectiveCamera, Raycaster, Scene, Texture, TextureLoader, WebGLRenderer, Vector2, RepeatWrapping, Color } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// GLTF 模型加载器
const gltfLoader = new GLTFLoader();
//射线投射器，可基于鼠标点和相机，在世界坐标系内建立一条射线，用于选中模型
const raycaster = new Raycaster();
//鼠标在裁剪空间中的点位
const pointer = new Vector2();

export default class MachineRoom {
  // 渲染器
  renderer;
  // 场景
  scene;
  // 相机
  camera;
  // 相机轨道控制器
  controls;
  // 存放模型文件的目录
  modelPath;
  // 纹理集合
  maps = new Map();
  // 机柜集合
  cabinets = [];
  // 鼠标划入的机柜
  curCabinet;
  //鼠标划入机柜事件，参数为机柜对象
  onMouseOverCabinet = (cabinet) => { };
  //鼠标在机柜上移动的事件，参数为鼠标在canvas画布上的坐标位
  onMouseMoveCabinet = (x, y) => { };
  //鼠标划出机柜的事件
  onMouseOutCabinet = () => { };

  // 初始化场景
  constructor(canvas, modelPath = "https://ycyy-cdn.oss-cn-beijing.aliyuncs.com/") {
    this.renderer = new WebGLRenderer({ canvas });
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);
    this.camera.position.set(0, 10, 15);
    this.camera.lookAt(0, 0, 0);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.modelPath = modelPath;
    this.crtTexture("cabinet-hover.jpg");
  }

  // 加载GLTF模型
  loadGLTF(modelName) {
    gltfLoader.load(this.modelPath + modelName, ({ scene: { children } }) => {
      children.forEach((obj) => {
        const { map, color } = obj.material;
        this.changeMat(obj, map, color);
        if (obj.name.includes("cabinet")) {
          this.cabinets.push(obj);
        }
      });
      this.scene.add(...children);
    });
  }

  // 修改材质
  changeMat(obj, map, color) {
    if (map) {
      obj.material = new MeshBasicMaterial({
        map: this.crtTexture(map.name),
      });
    } else {
      obj.material = new MeshBasicMaterial({ color });
    }
  }

  // 建立纹理对象
  crtTexture(imgName) {
    let curTexture = this.maps.get(imgName);
    if (!curTexture) {
      curTexture = new TextureLoader().load(this.modelPath + imgName);
      curTexture.flipY = false;
      curTexture.wrapS = 1000;
      curTexture.wrapT = 1000;
      this.maps.set(imgName, curTexture);
    }
    return curTexture;
  }

  // 选择机柜
  selectCabinet(x, y) {
    const { cabinets, renderer, camera, maps, curCabinet } = this;
    const { width, height } = renderer.domElement;
    // 鼠标的canvas坐标转裁剪坐标
    pointer.set(((x) / width) * 2 - 1, -((y) / height) * 2 + 1);
    // 基于鼠标点的裁剪坐标位和相机设置射线投射器
    raycaster.setFromCamera(pointer, camera);
    // 选择机柜
    const intersect = raycaster.intersectObjects(cabinets)[0];
    let intersectObj = intersect ? (intersect.object) : null;
    // 若之前已有机柜被选择，且不等于当前所选择的机柜，取消之前选择的机柜的高亮
    if (curCabinet && curCabinet !== intersectObj) {
      const material = curCabinet.material;
      material.setValues({
        map: maps.get("cabinet.jpg"),
      });
    }
    /* 
    若当前所选对象不为空：
      触发鼠标在机柜上移动的事件。
      若当前所选对象不等于上一次所选对象：
        更新curCabinet。
        将模型高亮。
        触发鼠标划入机柜事件。
    否则若上一次所选对象存在：
      置空curCabinet。
      触发鼠标划出机柜事件。
    */
    if (intersectObj) {
      this.onMouseMoveCabinet(x, y);
      if (intersectObj !== curCabinet) {
        this.curCabinet = intersectObj;
        const material = intersectObj.material;
        material.setValues({
          map: maps.get("cabinet-hover.jpg"),
        });
        this.onMouseOverCabinet(intersectObj);
      }
    } else if (curCabinet) {
      this.curCabinet = null;
      this.onMouseOutCabinet();
    }
  }

  // 连续渲染
  animate() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => {
      this.animate();
    });
  }
}