// GLSL常用内建函数

// 1. dot 点乘 返回两个向量的模乘上夹角的cos值
// 点乘，也叫数量积或内积。结果是一个向量和它在另一个向量方向上投影的长度的乘积，是一个标量。
// 2. cross 叉乘
// 叉乘，也叫向量积或外积。
// 三维向量的叉乘结果是一个和已有两个向量都垂直的向量。
// 二维向量的叉乘结果是一个实数，可以判断一个点在一个向量的哪一侧，根据右手定则，结果大于零在右侧，小于零在左侧，等于零在一条线上
// 3. texture2D 用于纹理采样
// 4. normalize :对⼀一个向量量规格化
// 5. clamp 将⼀个向量固定在一个最小值和最大值之间， clamp(x, min, max)
// 以下内建函数对矢量标量同样有效
// 6. pow()幂函数
// 7. exp() log() 指数函数 对数函数
// 8. sqrt() 平方根
// 9. max() min()最大值 最小值
// 10. ceil() floor()，取大于实参的最小整数，取小于实参的最大整数
// 11. sin() cos() tan() 三角函数
// 12. asin() acos() atan() 反三角函数
// atan(y,x) 将坐标转化为角度
// 13. sinh() cosh() tanh() 双曲正弦 双曲余弦 双曲正切
// 14. asinh() acosh() atanh() 反双曲正弦 反双曲余弦 反双曲正切
// 15. length() 向量长度
// 16. distance() 两个向量的距离
// 17. matrixCompMult() 矩阵对应元素分别相乘
// 18. transpose() determinant() inverse() 矩阵转置 行列式 逆
// 19. lessThan() greaterThan() equal() 小于 大于 等于(对实参向量对应位置的每个分量做大小比较，生成布尔向量)
export function initShaders(gl, vsSource, fsSource) {
  //创建程序对象
  const program = gl.createProgram()
  //建立着色对象
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)
  //把顶点着色对象装进程序对象中
  gl.attachShader(program, vertexShader)
  //把片元着色对象装进程序对象中
  gl.attachShader(program, fragmentShader)
  //连接webgl上下文对象和程序对象
  gl.linkProgram(program)
  //启动程序对象
  gl.useProgram(program)
  //将程序对象挂到上下文对象上
  gl.program = program
  return true
}

export function createProgram(gl, vsSource, fsSource) {
  //创建程序对象
  const program = gl.createProgram()
  //建立着色对象
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)
  //把顶点着色对象装进程序对象中
  gl.attachShader(program, vertexShader)
  //把片元着色对象装进程序对象中
  gl.attachShader(program, fragmentShader)
  //连接webgl上下文对象和程序对象
  gl.linkProgram(program)
  return program
}

export function loadShader(gl, type, source) {
  //根据着色类型，建立着色器对象
  const shader = gl.createShader(type)
  //将着色器源文件传入着色器对象中
  gl.shaderSource(shader, source)
  //编译着色器对象
  gl.compileShader(shader)
  //返回着色器对象
  return shader
}

export function getMousePosInWebgl(event, canvas) {
  // 获取鼠标位置
  const { clientX, clientY } = event
  const { left, top, width, height } = canvas.getBoundingClientRect()
  const [cssX, cssY] = [clientX - left, clientY - top]
  const [halfWidth, halfHeight] = [width / 2, height / 2]
  const [xBaseCenter, yBaseCenter] = [cssX - halfWidth, cssY - halfHeight]
  const yBaseCenterTop = -yBaseCenter
  return { x: xBaseCenter / halfWidth, y: yBaseCenterTop / halfHeight }
}

//线性比例尺
export function ScaleLinear(ax, ay, bx, by) {
  const delta = {
    x: bx - ax,
    y: by - ay
  }
  const k = delta.y / delta.x
  const b = ay - ax * k
  return function (x) {
    return k * x + b
  }
}

// 正弦函数
export function SinFn(a, Omega, phi) {
  return function (x) {
    return a * Math.sin(Omega * x + phi)
  }
}

// 图片加载完成事件包装成promise
export function imgPromise(img) {
  return new Promise((resolve) => {
    img.onload = function () {
      resolve(img)
    }
  })
}
