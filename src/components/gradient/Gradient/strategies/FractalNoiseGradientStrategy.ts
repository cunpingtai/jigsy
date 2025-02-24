import { BaseGradientStrategy } from "../GradientStrategy";
import {
  ConfigSchema,
  FractalNoiseGradientConfig,
  GradientType,
} from "../types";
import * as fabric from "fabric";
import { FRACTAL_NOISE_PRESETS } from "../constants";

export class FractalNoiseGradientStrategy extends BaseGradientStrategy<FractalNoiseGradientConfig> {
  type: GradientType = "fractalNoise";
  name = "分形噪声渐变";
  maxColorStops = 7;
  templates = FRACTAL_NOISE_PRESETS;

  schema: ConfigSchema = {
    properties: {
      noiseType: {
        type: "string",
        title: "噪声类型",
        default: "hybrid",
        enum: ["simplex", "fractal", "hybrid"],
        enumNames: ["简单噪声", "分形噪声", "混合噪声"],
      },
      octaves: {
        type: "number",
        title: "分形层级",
        default: 6,
        minimum: 1,
        maximum: 8,
      },
      persistence: {
        type: "number",
        title: "持续度",
        default: 0.5,
        minimum: 0,
        maximum: 1,
      },
      scale: {
        type: "number",
        title: "缩放",
        default: 0.005,
        minimum: 0.001,
        maximum: 0.1,
      },
      ridgeOffset: {
        type: "number",
        title: "山脊偏移",
        default: 1,
        minimum: 0,
        maximum: 2,
      },
      turbulence: {
        type: "boolean",
        title: "湍流效果",
        default: false,
      },
      domainWarp: {
        type: "boolean",
        title: "域扭曲",
        default: false,
      },
      warpStrength: {
        type: "number",
        title: "扭曲强度",
        default: 0.5,
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

  createGradient(
    canvas: fabric.Canvas,
    config: FractalNoiseGradientConfig
  ): void {
    const { width, height } = canvas;

    const worker = new Worker(
      new URL("../workers/fractalNoiseWorker.ts", import.meta.url)
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
      config,
    });
  }
}
