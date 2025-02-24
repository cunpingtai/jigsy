import { FractalNoiseGradientConfig } from "../types";
import {
  createNoise2D,
  createNoise3D,
  NoiseFunction2D,
  NoiseFunction3D,
} from "simplex-noise";
import chroma from "chroma-js";

class FractalNoiseGenerator {
  private noise2D: NoiseFunction2D;
  private noise3D: NoiseFunction3D;
  private config: FractalNoiseGradientConfig;

  constructor(config: FractalNoiseGradientConfig) {
    this.config = config;
    const seed = config.seed || Math.random();
    this.noise2D = createNoise2D(() => seed);
    this.noise3D = createNoise3D(() => seed);
  }

  private simplexNoise(x: number, y: number): number {
    return this.noise2D(x, y);
  }

  private fractalNoise(x: number, y: number): number {
    let amplitude = 1;
    let frequency = 1;
    let noiseValue = 0;
    let maxValue = 0;

    for (let i = 0; i < this.config.octaves; i++) {
      const sampleX = x * frequency * this.config.scale;
      const sampleY = y * frequency * this.config.scale;

      if (this.config.turbulence) {
        noiseValue += Math.abs(this.noise2D(sampleX, sampleY)) * amplitude;
      } else {
        noiseValue += this.noise2D(sampleX, sampleY) * amplitude;
      }

      maxValue += amplitude;
      amplitude *= this.config.persistence;
      frequency *= 2;
    }

    return noiseValue / maxValue;
  }

  private ridgedNoise(x: number, y: number): number {
    let amplitude = 1;
    let frequency = 1;
    let noiseValue = 0;
    let maxValue = 0;

    for (let i = 0; i < this.config.octaves; i++) {
      const sampleX = x * frequency * this.config.scale;
      const sampleY = y * frequency * this.config.scale;

      let noise = this.noise2D(sampleX, sampleY);
      noise = this.config.ridgeOffset - Math.abs(noise);
      noise = noise * noise;

      noiseValue += noise * amplitude;
      maxValue += amplitude;

      amplitude *= this.config.persistence;
      frequency *= 2;
    }

    return noiseValue / maxValue;
  }

  private domainWarp(x: number, y: number): [number, number] {
    if (!this.config.domainWarp) return [x, y];

    const warpScale = this.config.scale * 2;
    const warpStrength = this.config.warpStrength * 100;

    const warpX = this.noise3D(x * warpScale, y * warpScale, 0) * warpStrength;
    const warpY = this.noise3D(x * warpScale, y * warpScale, 1) * warpStrength;

    return [x + warpX, y + warpY];
  }

  getNoise(x: number, y: number): number {
    const [warpedX, warpedY] = this.domainWarp(x, y);

    switch (this.config.noiseType) {
      case "simplex":
        return this.simplexNoise(warpedX, warpedY);
      case "fractal":
        return this.fractalNoise(warpedX, warpedY);
      case "hybrid":
        const simplex = this.simplexNoise(warpedX, warpedY);
        const fractal = this.fractalNoise(warpedX, warpedY);
        const ridge = this.ridgedNoise(warpedX, warpedY);
        return (simplex + fractal + ridge) / 3;
      default:
        return this.fractalNoise(warpedX, warpedY);
    }
  }
}

self.onmessage = (e: {
  data: { width: number; height: number; config: FractalNoiseGradientConfig };
}) => {
  const { width, height, config } = e.data;

  const noiseGen = new FractalNoiseGenerator(config);
  const imageData = new ImageData(width, height);

  const colorScale = chroma
    .scale(config.colorStops.map((stop) => stop.color))
    .mode("lab")
    .domain(config.colorStops.map((stop) => stop.offset));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const noiseValue = (noiseGen.getNoise(x, y) + 1) * 0.5;
      const color = chroma(colorScale(noiseValue).hex());
      const [r, g, b] = color.rgb();

      const i = (y * width + x) * 4;
      imageData.data[i] = r;
      imageData.data[i + 1] = g;
      imageData.data[i + 2] = b;
      imageData.data[i + 3] = 255;
    }
  }

  self.postMessage(
    { result: imageData },
    { transfer: [imageData.data.buffer] }
  );
};
