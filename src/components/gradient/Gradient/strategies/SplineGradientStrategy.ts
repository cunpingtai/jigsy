import { BaseGradientStrategy } from "../GradientStrategy";
import { ConfigSchema, GradientType, SplineGradientConfig } from "../types";
import * as fabric from "fabric";
import { SPLINE_GRADIENT_PRESETS } from "../constants";

export class SplineGradientStrategy extends BaseGradientStrategy<SplineGradientConfig> {
  type: GradientType = "spline";
  name = "样条渐变";
  maxColorStops = 10;
  templates = SPLINE_GRADIENT_PRESETS;

  schema: ConfigSchema = {
    properties: {
      splineType: {
        type: "enum",
        title: "样条类型",
        default: "catmullRom",
        enum: ["bezier", "catmullRom", "bSpline", "hermite"],
        enumNames: ["贝塞尔", "Catmull-Rom", "B样条", "埃尔米特"],
      },
      tension: {
        type: "number",
        title: "张力",
        default: 0.5,
        minimum: 0,
        maximum: 1,
      },
      bias: {
        type: "number",
        title: "偏差",
        default: 0,
        minimum: -1,
        maximum: 1,
      },
      resolution: {
        type: "number",
        title: "分辨率",
        default: 100,
        minimum: 50,
        maximum: 200,
      },
    },
  };

  createGradient(canvas: fabric.Canvas, config: SplineGradientConfig): void {
    const { width, height } = canvas;

    const worker = new Worker(
      new URL("../workers/splineWorker.ts", import.meta.url)
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

    // 如果没有提供控制点，生成默认的控制点
    if (!config.controlPoints || config.controlPoints.length < 2) {
      config.controlPoints = [
        { x: 0, y: 0 },
        { x: 0.3, y: 0.2 },
        { x: 0.7, y: 0.8 },
        { x: 1, y: 1 },
      ];
    }

    worker.postMessage({
      width,
      height,
      config,
    });
  }
}
