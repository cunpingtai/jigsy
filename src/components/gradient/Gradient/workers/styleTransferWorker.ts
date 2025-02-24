import { createNoise2D } from "simplex-noise";

interface StylePresetConfig {
  noiseFrequency: number;
  brushStrokes: boolean;
  colorBlend: number;
}

function createNoiseTexture(
  width: number,
  height: number,
  frequency: number
): Float32Array {
  const noise2D = createNoise2D(() => {
    // 使用 Mulberry32 算法生成均匀分布的随机数
    const seed = Date.now();
    let t = seed + 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  });
  const texture = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x * frequency;
      const ny = y * frequency;
      texture[y * width + x] = (noise2D(nx, ny) + 1) * 0.5;
    }
  }

  return texture;
}

function applyStyle(
  imageData: ImageData,
  texture: Float32Array,
  config: StylePresetConfig,
  strength: number
): ImageData {
  const { width, height } = imageData;
  const result = new Uint8ClampedArray(imageData.data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const t = texture[y * width + x];

      // 应用纹理和颜色混合
      for (let c = 0; c < 3; c++) {
        const original = imageData.data[i + c];
        const textured = original * (1 + (t - 0.5) * strength);

        if (config.brushStrokes) {
          // 模拟笔触效果
          const stroke = Math.sin(t * Math.PI * 2) * strength * 50;
          result[i + c] = Math.max(0, Math.min(255, textured + stroke));
        } else {
          result[i + c] = Math.max(0, Math.min(255, textured));
        }
      }
      result[i + 3] = imageData.data[i + 3]; // 保持原始透明度
    }
  }

  return new ImageData(result, width, height);
}

self.onmessage = (e) => {
  const { imageData, config } = e.data;
  const { stylePresetConfig, styleStrength, textureScale } = config;

  // 创建风格纹理
  const texture = createNoiseTexture(
    imageData.width,
    imageData.height,
    stylePresetConfig.noiseFrequency * textureScale
  );

  // 应用风格迁移
  const result = applyStyle(
    imageData,
    texture,
    stylePresetConfig,
    styleStrength
  );

  self.postMessage({ result }, { transfer: [result.data.buffer] });
};
