// 辅助函数
function mulberry32(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussianRandom(rand: () => number, mean: number, std: number): number {
  const u1 = rand();
  const u2 = rand();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * std + mean;
}

function addNoise(
  imageData: ImageData,
  noiseScale: number,
  rand: () => number
): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      const noise = gaussianRandom(rand, 0, 255 * noiseScale);
      data[i + j] = Math.max(0, Math.min(255, data[i + j] + noise));
    }
  }
  return new ImageData(data, imageData.width, imageData.height);
}

function denoise(
  noisyData: ImageData,
  originalData: ImageData,
  strength: number
): ImageData {
  const data = new Uint8ClampedArray(noisyData.data);
  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      data[i + j] = Math.round(
        noisyData.data[i + j] * (1 - strength) +
          originalData.data[i + j] * strength
      );
    }
  }
  return new ImageData(data, noisyData.width, noisyData.height);
}

// Worker 消息处理
self.onmessage = (e) => {
  const { imageData, config } = e.data;
  const { steps, noiseScale, denoisingStrength, seed } = config;
  const rand = mulberry32(seed);

  let currentImage = imageData;
  for (let i = 0; i < steps; i++) {
    const noiseStrength = noiseScale * (1 - i / steps);
    const noisyImage = addNoise(currentImage, noiseStrength, rand);
    const denoiseStrength = denoisingStrength * (i / steps);
    currentImage = denoise(noisyImage, imageData, denoiseStrength);
  }

  self.postMessage(
    { result: currentImage },
    { transfer: [currentImage.data.buffer] }
  );
};
