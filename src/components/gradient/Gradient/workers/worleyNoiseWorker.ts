import { WorleyNoiseGradientConfig } from "../types";
import chroma from "chroma-js";

interface Point {
  x: number;
  y: number;
}

class WorleyNoiseGenerator {
  private points: Point[] = [];
  private config: WorleyNoiseGradientConfig;
  private width: number;
  private height: number;

  constructor(
    width: number,
    height: number,
    config: WorleyNoiseGradientConfig
  ) {
    this.width = width;
    this.height = height;
    this.config = config;
    this.generatePoints();
  }

  private mulberry32(a: number) {
    return () => {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  private generatePoints() {
    const rand = this.mulberry32(this.config.seed);
    const { cellCount, jitter } = this.config;

    // 生成网格化的基础点
    const gridSize = Math.sqrt(cellCount);
    const cellWidth = this.width / gridSize;
    const cellHeight = this.height / gridSize;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        // 添加扰动
        const jitterX = (rand() - 0.5) * cellWidth * 2 * jitter;
        const jitterY = (rand() - 0.5) * cellHeight * 2 * jitter;

        this.points.push({
          x: (x + 0.5) * cellWidth + jitterX,
          y: (y + 0.5) * cellHeight + jitterY,
        });
      }
    }
  }

  private calculateDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const dx = x1 - x2;
    const dy = y1 - y2;

    switch (this.config.distanceFunction) {
      case "manhattan":
        return Math.abs(dx) + Math.abs(dy);
      case "chebyshev":
        return Math.max(Math.abs(dx), Math.abs(dy));
      default: // euclidean
        return Math.sqrt(dx * dx + dy * dy);
    }
  }

  private getDistances(x: number, y: number): number[] {
    const distances = this.points.map((point) =>
      this.calculateDistance(x, y, point.x, point.y)
    );
    return distances.sort((a, b) => a - b);
  }

  private smoothStep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  getNoise(x: number, y: number): number {
    // 应用扭曲
    const distortion = this.config.distortionAmount;
    if (distortion > 0) {
      const angle = Math.sin(x * 0.1) * Math.cos(y * 0.1) * Math.PI * 2;
      const amount = distortion * 20;
      x += Math.cos(angle) * amount;
      y += Math.sin(angle) * amount;
    }

    // 应用缩放
    x *= this.config.scale;
    y *= this.config.scale;

    const distances = this.getDistances(x, y);
    let value: number;

    switch (this.config.combineFunction) {
      case "f2":
        value = distances[1];
        break;
      case "f2minusf1":
        value = distances[1] - distances[0];
        break;
      case "f1plusf2":
        value = (distances[0] + distances[1]) * 0.5;
        break;
      default: // f1
        value = distances[0];
    }

    // 归一化和平滑处理
    const maxPossibleDist = Math.sqrt(
      this.width * this.width + this.height * this.height
    );
    value = value / maxPossibleDist;

    if (this.config.edgeSmoothing > 0) {
      value = this.smoothStep(0, 1, value);
    }

    return value;
  }
}

self.onmessage = (e: {
  data: { width: number; height: number; config: WorleyNoiseGradientConfig };
}) => {
  const { width, height, config } = e.data;

  const noiseGen = new WorleyNoiseGenerator(width, height, config);
  const imageData = new ImageData(width, height);

  const colorScale = chroma
    .scale(config.colorStops.map((stop) => stop.color))
    .mode("lab")
    .domain(config.colorStops.map((stop) => stop.offset));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const noiseValue = noiseGen.getNoise(x, y);
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
