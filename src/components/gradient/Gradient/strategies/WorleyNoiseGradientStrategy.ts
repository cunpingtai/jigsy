import { BaseGradientStrategy } from "../GradientStrategy";
import {
  ConfigSchema,
  GradientType,
  WorleyNoiseGradientConfig,
} from "../types";
import * as fabric from "fabric";
import { WORLEY_NOISE_PRESETS } from "../constants";

export class WorleyNoiseGradientStrategy extends BaseGradientStrategy<WorleyNoiseGradientConfig> {
  type: GradientType = "worleyNoise";
  name = "细胞噪声渐变";
  maxColorStops = 8;
  templates = WORLEY_NOISE_PRESETS;

  schema: ConfigSchema = {
    properties: {
      cellCount: {
        type: "number",
        title: "细胞数量",
        default: 20,
        minimum: 5,
        maximum: 50,
      },
      distanceFunction: {
        type: "enum",
        title: "距离函数",
        default: "euclidean",
        enum: ["euclidean", "manhattan", "chebyshev"],
        enumNames: ["欧几里得", "曼哈顿", "切比雪夫"],
      },
      combineFunction: {
        type: "enum",
        title: "组合函数",
        default: "f1",
        enum: ["f1", "f2", "f2minusf1", "f1plusf2"],
        enumNames: ["最近距离", "次近距离", "距离差值", "距离和值"],
      },
      jitter: {
        type: "number",
        title: "扰动程度",
        default: 0.5,
        minimum: 0,
        maximum: 1,
      },
      scale: {
        type: "number",
        title: "缩放",
        default: 1,
        minimum: 0.1,
        maximum: 5,
      },
      edgeSmoothing: {
        type: "number",
        title: "边缘平滑",
        default: 0.3,
        minimum: 0,
        maximum: 1,
      },
      distortionAmount: {
        type: "number",
        title: "扭曲程度",
        default: 0.2,
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
    config: WorleyNoiseGradientConfig
  ): void {
    const { width, height } = canvas;

    const worker = new Worker(
      new URL("../workers/worleyNoiseWorker.ts", import.meta.url)
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
