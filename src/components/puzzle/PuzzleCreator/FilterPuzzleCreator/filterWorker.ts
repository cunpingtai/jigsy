// 滤镜 Worker 文件

// 滤镜类型定义
type FilterType =
  | "grayscale"
  | "sepia"
  | "blur"
  | "brightness"
  | "contrast"
  | "hue-rotate"
  | "invert"
  | "saturate"
  | "pixelate"
  | "oil-painting"
  | "watercolor"
  | "comic";

// 接收消息并处理滤镜
self.onmessage = (event) => {
  // 标记当前是否有任务正在执行
  let isProcessing = false;
  // 保存当前任务的ID以便于取消
  let currentTaskId: string | null = null;
  // 如果是取消消息
  if (event.data.type === "cancel") {
    // 标记取消
    isProcessing = false;
    currentTaskId = null;
    console.log("任务已取消");
    return;
  }
  const { imageData, filterType, filterValue, canvasWidth, canvasHeight } =
    event.data;

  // 生成唯一任务ID
  const taskId = Date.now().toString();
  currentTaskId = taskId;
  isProcessing = true;

  try {
    // 复制输入的图像数据
    const data = new Uint8ClampedArray(imageData.data);

    if (filterType === "grayscale") {
      applyGrayscale(imageData.data, filterValue / 100);
    } else if (filterType === "sepia") {
      applySepia(imageData.data, filterValue / 100);
    } else if (filterType === "pixelate") {
      applyPixelate(imageData, canvasWidth, canvasHeight, filterValue);
    } else if (filterType === "oil-painting") {
      applyOilPainting(imageData, canvasWidth, canvasHeight, filterValue);
    } else if (filterType === "watercolor") {
      applyWatercolor(imageData, canvasWidth, canvasHeight, filterValue / 100);
    } else if (filterType === "comic") {
      applyComic(imageData, canvasWidth, canvasHeight, filterValue);
    } else if (filterType === "blur") {
      applyBlur(imageData.data, canvasWidth, canvasHeight, filterValue);
    } else if (filterType === "brightness") {
      applyBrightness(imageData.data, filterValue / 100);
    } else if (filterType === "contrast") {
      applyContrast(imageData.data, filterValue / 100);
    } else if (filterType === "hue-rotate") {
      applyHueRotate(imageData.data, filterValue);
    } else if (filterType === "invert") {
      applyInvert(imageData.data, filterValue / 100);
    } else if (filterType === "saturate") {
      applySaturate(imageData.data, filterValue / 100);
    }

    // 在每个处理步骤中检查任务是否被取消
    if (!isProcessing || currentTaskId !== taskId) {
      console.log("任务已在处理过程中取消");
      return;
    }

    // 返回处理后的图像数据
    (self as unknown as Worker).postMessage(
      {
        imageData: {
          data: data.buffer,
          width: canvasWidth,
          height: canvasHeight,
        },
        filterType: filterType,
      },
      [data.buffer as unknown as any]
    );
  } catch (error) {
    console.error("Worker 处理滤镜时出错:", error);
    // 返回错误信息
    self.postMessage({
      error: "Processing failed",
      filterType: filterType,
    });
  } finally {
    isProcessing = false;
    currentTaskId = null;
  }
};

// 以下是所有滤镜函数的实现
function applyGrayscale(data: Uint8ClampedArray, intensity: number) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const gray = 0.3 * r + 0.59 * g + 0.11 * b;

    data[i] = r * (1 - intensity) + gray * intensity;
    data[i + 1] = g * (1 - intensity) + gray * intensity;
    data[i + 2] = b * (1 - intensity) + gray * intensity;
  }
}

function applySepia(data: Uint8ClampedArray, intensity: number) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const sr = 0.393 * r + 0.769 * g + 0.189 * b;
    const sg = 0.349 * r + 0.686 * g + 0.168 * b;
    const sb = 0.272 * r + 0.534 * g + 0.131 * b;

    data[i] = r * (1 - intensity) + sr * intensity;
    data[i + 1] = g * (1 - intensity) + sg * intensity;
    data[i + 2] = b * (1 - intensity) + sb * intensity;
  }
}

function applyBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
) {
  // 创建临时数组存储原始数据
  const tempData = new Uint8ClampedArray(data.length);
  tempData.set(data);

  // 限制模糊半径，防止性能问题
  const safeRadius = Math.min(radius, 20);

  // 使用高斯模糊算法的简化版本
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      let count = 0;

      // 在有限范围内采样
      const sampleSize = Math.max(1, Math.floor(safeRadius / 2));

      for (let ky = -sampleSize; ky <= sampleSize; ky++) {
        for (let kx = -sampleSize; kx <= sampleSize; kx++) {
          const nx = Math.min(width - 1, Math.max(0, x + kx));
          const ny = Math.min(height - 1, Math.max(0, y + ky));

          const i = (ny * width + nx) * 4;
          r += tempData[i];
          g += tempData[i + 1];
          b += tempData[i + 2];
          a += tempData[i + 3];
          count++;
        }
      }

      // 计算平均值
      const i = (y * width + x) * 4;
      data[i] = r / count;
      data[i + 1] = g / count;
      data[i + 2] = b / count;
      data[i + 3] = a / count;
    }
  }
}

function applyBrightness(data: Uint8ClampedArray, factor: number) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * factor);
    data[i + 1] = Math.min(255, data[i + 1] * factor);
    data[i + 2] = Math.min(255, data[i + 2] * factor);
  }
}

function applyContrast(data: Uint8ClampedArray, factor: number) {
  const factor1 = factor;
  const factor2 = 128 * (1 - factor);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] * factor1 + factor2));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor1 + factor2));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor1 + factor2));
  }
}

function applyHueRotate(data: Uint8ClampedArray, degrees: number) {
  const angle = (degrees * Math.PI) / 180;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);

  for (let i = 0; i < data.length; i += 4) {
    // 转换为HSL
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number = 0,
      s: number = 0;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // 灰色
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    // 旋转色相
    h = (h + degrees / 360) % 1;

    // 转回RGB
    let r1, g1, b1;

    if (s === 0) {
      r1 = g1 = b1 = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r1 = hueToRgb(p, q, h + 1 / 3);
      g1 = hueToRgb(p, q, h);
      b1 = hueToRgb(p, q, h - 1 / 3);
    }

    data[i] = r1 * 255;
    data[i + 1] = g1 * 255;
    data[i + 2] = b1 * 255;
  }

  function hueToRgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
}

function applyInvert(data: Uint8ClampedArray, intensity: number) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i] * (1 - intensity) + (255 - data[i]) * intensity;
    data[i + 1] =
      data[i + 1] * (1 - intensity) + (255 - data[i + 1]) * intensity;
    data[i + 2] =
      data[i + 2] * (1 - intensity) + (255 - data[i + 2]) * intensity;
  }
}

function applySaturate(data: Uint8ClampedArray, factor: number) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // 计算灰度值
    const gray = 0.3 * r + 0.59 * g + 0.11 * b;

    // 应用饱和度
    data[i] = gray * (1 - factor) + r * factor;
    data[i + 1] = gray * (1 - factor) + g * factor;
    data[i + 2] = gray * (1 - factor) + b * factor;
  }
}

function applyPixelate(
  imageData: ImageData,
  width: number,
  height: number,
  pixelSize: number
) {
  const data = imageData.data;
  // 创建一个新的数组来存储结果
  const newData = new Uint8ClampedArray(data.length);

  // 对每个像素块进行处理
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      // 计算像素块的平均颜色
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      let count = 0;

      // 计算像素块内所有像素的平均值
      const blockWidth = Math.min(pixelSize, width - x);
      const blockHeight = Math.min(pixelSize, height - y);

      for (let by = 0; by < blockHeight; by++) {
        for (let bx = 0; bx < blockWidth; bx++) {
          const sx = x + bx;
          const sy = y + by;
          const i = (sy * width + sx) * 4;

          if (i < data.length) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            a += data[i + 3];
            count++;
          }
        }
      }

      // 计算平均颜色
      if (count > 0) {
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        a = Math.floor(a / count);

        // 将平均颜色应用到整个像素块
        for (let by = 0; by < blockHeight; by++) {
          for (let bx = 0; bx < blockWidth; bx++) {
            const sx = x + bx;
            const sy = y + by;
            const i = (sy * width + sx) * 4;

            if (i < newData.length) {
              newData[i] = r;
              newData[i + 1] = g;
              newData[i + 2] = b;
              newData[i + 3] = a;
            }
          }
        }
      }
    }
  }

  // 将结果复制回原始数据
  for (let i = 0; i < data.length; i++) {
    data[i] = newData[i];
  }
}

function applyOilPainting(
  imageData: ImageData,
  width: number,
  height: number,
  intensity: number
) {
  const data = imageData.data;
  const radius = Math.floor(intensity);
  const levels = 8;

  // 创建临时数组存储原始数据
  const tempData = new Uint8ClampedArray(data.length);
  tempData.set(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const intensityCount = new Array(levels).fill(0);
      const redBucket = new Array(levels).fill(0);
      const greenBucket = new Array(levels).fill(0);
      const blueBucket = new Array(levels).fill(0);

      // 分析周围像素
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const i = (ny * width + nx) * 4;
            const r = tempData[i];
            const g = tempData[i + 1];
            const b = tempData[i + 2];

            // 计算亮度并量化
            const intensity = Math.floor((((r + g + b) / 3) * levels) / 255);
            intensityCount[intensity]++;
            redBucket[intensity] += r;
            greenBucket[intensity] += g;
            blueBucket[intensity] += b;
          }
        }
      }

      // 找出最常见的亮度级别
      let maxIndex = 0;
      for (let i = 1; i < levels; i++) {
        if (intensityCount[i] > intensityCount[maxIndex]) {
          maxIndex = i;
        }
      }

      // 设置像素颜色
      const i = (y * width + x) * 4;
      if (intensityCount[maxIndex] > 0) {
        data[i] = Math.round(redBucket[maxIndex] / intensityCount[maxIndex]);
        data[i + 1] = Math.round(
          greenBucket[maxIndex] / intensityCount[maxIndex]
        );
        data[i + 2] = Math.round(
          blueBucket[maxIndex] / intensityCount[maxIndex]
        );
      }
    }
  }
}

function applyWatercolor(
  imageData: ImageData,
  width: number,
  height: number,
  intensity: number
) {
  const data = imageData.data;

  // 创建临时数组存储原始数据
  const tempData = new Uint8ClampedArray(data.length);
  tempData.set(data);

  // 应用模糊效果
  applyBlur(tempData, width, height, 2);

  // 将模糊后的数据复制回原始数据
  for (let i = 0; i < data.length; i++) {
    data[i] = tempData[i];
  }

  // 简化颜色
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] / (10 * intensity)) * (10 * intensity);
    data[i + 1] = Math.round(data[i + 1] / (10 * intensity)) * (10 * intensity);
    data[i + 2] = Math.round(data[i + 2] / (10 * intensity)) * (10 * intensity);
  }

  // 添加纹理
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 15 * intensity;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
}

function applyComic(
  imageData: ImageData,
  width: number,
  height: number,
  intensity: number
) {
  const data = imageData.data;

  // 创建临时数组存储原始数据
  const tempData = new Uint8ClampedArray(data.length);
  tempData.set(data);

  // 增强对比度
  applyContrast(tempData, 1.5);

  // 边缘检测
  const edgeData = new Uint8ClampedArray(data.length);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;

      // 简单的Sobel算子边缘检测
      const i1 = ((y - 1) * width + (x - 1)) * 4;
      const i2 = ((y - 1) * width + x) * 4;
      const i3 = ((y - 1) * width + (x + 1)) * 4;
      const i4 = (y * width + (x - 1)) * 4;
      const i6 = (y * width + (x + 1)) * 4;
      const i7 = ((y + 1) * width + (x - 1)) * 4;
      const i8 = ((y + 1) * width + x) * 4;
      const i9 = ((y + 1) * width + (x + 1)) * 4;

      // 计算灰度值
      const g1 = (tempData[i1] + tempData[i1 + 1] + tempData[i1 + 2]) / 3;
      const g2 = (tempData[i2] + tempData[i2 + 1] + tempData[i2 + 2]) / 3;
      const g3 = (tempData[i3] + tempData[i3 + 1] + tempData[i3 + 2]) / 3;
      const g4 = (tempData[i4] + tempData[i4 + 1] + tempData[i4 + 2]) / 3;
      const g6 = (tempData[i6] + tempData[i6 + 1] + tempData[i6 + 2]) / 3;
      const g7 = (tempData[i7] + tempData[i7 + 1] + tempData[i7 + 2]) / 3;
      const g8 = (tempData[i8] + tempData[i8 + 1] + tempData[i8 + 2]) / 3;
      const g9 = (tempData[i9] + tempData[i9 + 1] + tempData[i9 + 2]) / 3;

      // Sobel算子
      const gx = -g1 - 2 * g4 - g7 + g3 + 2 * g6 + g9;
      const gy = -g1 - 2 * g2 - g3 + g7 + 2 * g8 + g9;

      const edge = Math.sqrt(gx * gx + gy * gy);

      // 应用边缘检测后的效果
      const edgeIntensity = Math.min(255, Math.max(0, edge * intensity));

      // 将边缘检测后的效果应用到原始数据
      const edgeIndex = Math.floor((edgeIntensity / 255) * 255);
      data[i] = edgeIndex;
      data[i + 1] = edgeIndex;
      data[i + 2] = edgeIndex;
    }
  }
}
