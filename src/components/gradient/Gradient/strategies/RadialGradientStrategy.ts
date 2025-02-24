import { RADIAL_GRADIENT_PRESETS } from "../constants";
import { BaseGradientStrategy } from "../GradientStrategy";
import { ConfigSchema, GradientType, RadialGradientConfig } from "../types";
import * as fabric from "fabric";

export class RadialGradientStrategy extends BaseGradientStrategy<RadialGradientConfig> {
  type: GradientType = "radial";
  name = "径向渐变";
  maxColorStops = 7;
  templates: Record<string, RadialGradientConfig> = RADIAL_GRADIENT_PRESETS;

  schema: ConfigSchema = {
    properties: {
      centerX: {
        type: "number",
        title: "中心点X",
        default: 0.5,
        minimum: 0,
        maximum: 1,
      },
      centerY: {
        type: "number",
        title: "中心点Y",
        default: 0.5,
        minimum: 0,
        maximum: 1,
      },
      radius: {
        type: "number",
        title: "半径",
        default: 0.5,
        minimum: 0,
        maximum: 1,
      },
      aspectRatio: {
        type: "number",
        title: "椭圆比例",
        default: 1,
        minimum: 0.1,
        maximum: 10,
      },
      interpolation: {
        type: "enum",
        title: "插值方式",
        default: "linear",
        enum: ["linear", "exponential", "logarithmic", "gamma"],
        enumNames: ["线性", "指数", "对数", "伽马"],
      },
      interpolationFactor: {
        type: "number",
        title: "插值因子",
        default: 1,
        minimum: 0.1,
        maximum: 5,
      },
      gamma: {
        type: "number",
        title: "伽马值",
        default: 2.2,
        minimum: 1,
        maximum: 3,
      },
    },
  };

  createGradient(canvas: fabric.Canvas, config: RadialGradientConfig): void {
    const { width, height } = canvas;

    const worker = new Worker(
      new URL("../workers/radialWorker.ts", import.meta.url)
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
