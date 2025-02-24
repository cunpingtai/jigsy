import { BaseGradientStrategy } from "../GradientStrategy";
import { ConfigSchema, GradientType, PerlinGradientConfig } from "../types";
import * as fabric from "fabric";
import { PERLIN_GRADIENT_PRESETS } from "../constants";

class Perlin {
  private p: number[] = [];
  private permutation: number[] = [];

  constructor(seed = 123) {
    this.permutation = new Array(256).fill(0).map((_, i) => i);

    // Fisher-Yates shuffle with seed
    const rand = this.mulberry32(seed);
    for (let i = this.permutation.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [this.permutation[i], this.permutation[j]] = [
        this.permutation[j],
        this.permutation[i],
      ];
    }

    // Extend the permutation
    this.p = [...this.permutation, ...this.permutation];
  }

  private mulberry32(a: number) {
    return () => {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const grad2 = 1 + (h & 7);
    return (h & 8 ? -grad2 : grad2) * x + (h & 4 ? -grad2 : grad2) * y;
  }

  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const A = this.p[X] + Y;
    const B = this.p[X + 1] + Y;

    return this.lerp(
      v,
      this.lerp(u, this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y)),
      this.lerp(
        u,
        this.grad(this.p[A + 1], x, y - 1),
        this.grad(this.p[B + 1], x - 1, y - 1)
      )
    );
  }
}

export class PerlinGradientStrategy extends BaseGradientStrategy<PerlinGradientConfig> {
  type: GradientType = "perlin";
  name = "Perlin渐变";
  private noise: Perlin; // Perlin noise 实例
  maxColorStops = 7;
  templates: Record<string, PerlinGradientConfig> = PERLIN_GRADIENT_PRESETS;

  schema: ConfigSchema = {
    properties: {
      scale: {
        type: "number",
        title: "缩放",
        default: 0.02,
        minimum: 0.001,
        maximum: 0.1,
      },
      octaves: {
        type: "number",
        title: "细节层级",
        default: 4,
        minimum: 1,
        maximum: 8,
      },
      persistence: {
        type: "number",
        title: "持续度",
        default: 0.5,
        minimum: 0.1,
        maximum: 1,
      },
      amplitude: {
        type: "number",
        title: "扰动强度",
        default: 0.3,
        minimum: 0,
        maximum: 1,
      },
      seed: {
        type: "number",
        title: "随机种子",
        default: Math.floor(Math.random() * 65536),
        minimum: 0,
        maximum: 65536,
      },
    },
  };

  constructor() {
    super();
    this.noise = new Perlin();
  }

  private octavePerlin(
    x: number,
    y: number,
    octaves: number,
    persistence: number
  ): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise.noise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }

  createGradient(canvas: fabric.Canvas, config: PerlinGradientConfig): void {
    const { width, height } = canvas;

    const worker = new Worker(
      new URL("../workers/perlinWorker.ts", import.meta.url)
    );

    worker.onmessage = (e) => {
      const { result } = e.data;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.putImageData(result, 0, 0);

      fabric.Image.fromURL(tempCanvas.toDataURL()).then((img) => {
        img.scaleToWidth(width);
        img.scaleToHeight(height);
        canvas.add(img);
        canvas.renderAll();
        worker.terminate();
      });
    };

    worker.postMessage({
      width,
      height,
      config: {
        scale: config.scale || 0.02,
        octaves: config.octaves || 4,
        persistence: config.persistence || 0.5,
        amplitude: config.amplitude || 0.3,
        seed: config.seed || Math.floor(Math.random() * 65536),
        colorStops: config.colorStops,
      },
    });
  }
}
