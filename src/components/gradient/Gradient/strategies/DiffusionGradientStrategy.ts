import { DIFFUSION_GRADIENT_PRESETS } from "../constants";
import { BaseGradientStrategy } from "../GradientStrategy";
import {
  ConfigSchema,
  DiffusionGradientConfig,
  GradientConfig,
  GradientType,
} from "../types";
import * as fabric from "fabric";

export class DiffusionGradientStrategy extends BaseGradientStrategy<DiffusionGradientConfig> {
  type: GradientType = "diffusion";
  name = "diffusion";
  maxColorStops = 7;
  templates: Record<string, DiffusionGradientConfig> =
    DIFFUSION_GRADIENT_PRESETS;

  schema: ConfigSchema = {
    properties: {
      steps: {
        type: "number",
        title: "扩散步数",
        default: 20,
        minimum: 10,
        maximum: 50,
      },
      noiseScale: {
        type: "number",
        title: "噪声强度",
        default: 0.5,
        minimum: 0,
        maximum: 1,
      },
      denoisingStrength: {
        type: "number",
        title: "去噪强度",
        default: 0.7,
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

  private mulberry32(a: number) {
    return () => {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  private gaussianRandom(
    rand: () => number,
    mean: number,
    std: number
  ): number {
    const u1 = rand();
    const u2 = rand();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * std + mean;
  }

  private addNoise(
    imageData: ImageData,
    noiseScale: number,
    rand: () => number
  ): ImageData {
    const data = new Uint8ClampedArray(imageData.data);

    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        const noise = this.gaussianRandom(rand, 0, 255 * noiseScale);
        data[i + j] = Math.max(0, Math.min(255, data[i + j] + noise));
      }
    }

    return new ImageData(data, imageData.width, imageData.height);
  }

  private denoise(
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

  private createBaseGradient(
    width: number,
    height: number,
    colorStops: GradientConfig["colorStops"]
  ): ImageData {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext("2d")!;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    colorStops.forEach((stop) => {
      gradient.addColorStop(stop.offset, stop.color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return ctx.getImageData(0, 0, width, height);
  }

  createGradient(canvas: fabric.Canvas, config: DiffusionGradientConfig): void {
    const { width, height } = canvas;
    const steps = config.steps || 20;
    const noiseScale = config.noiseScale || 0.5;
    const denoisingStrength = config.denoisingStrength || 0.7;
    const seed = config.seed || Math.floor(Math.random() * 65536);

    // 创建基础渐变
    const baseGradient = this.createBaseGradient(
      width,
      height,
      config.colorStops
    );

    // 创建 Worker
    const worker = new Worker(
      new URL("../workers/diffusionWorker.ts", import.meta.url)
    );

    worker.onmessage = (e) => {
      const { result } = e.data;

      // 将结果转换为 fabric.Image
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

    // 发送数据到 Worker
    worker.postMessage(
      {
        imageData: baseGradient,
        config: { steps, noiseScale, denoisingStrength, seed },
      },
      [baseGradient.data.buffer]
    );
  }
}
