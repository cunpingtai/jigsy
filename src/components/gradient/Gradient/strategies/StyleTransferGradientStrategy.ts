import { STYLE_TRANSFER_PRESETS } from "../constants";
import { BaseGradientStrategy } from "../GradientStrategy";
import {
  ConfigSchema,
  GradientConfig,
  GradientType,
  StyleTransferGradientConfig,
} from "../types";
import * as fabric from "fabric";

export class StyleTransferGradientStrategy extends BaseGradientStrategy<StyleTransferGradientConfig> {
  type: GradientType = "styleTransfer";
  name = "styleTransfer";
  maxColorStops = 5;
  templates: Record<string, StyleTransferGradientConfig> =
    STYLE_TRANSFER_PRESETS;
  // 预设的艺术风格
  private stylePresets = {
    watercolor: {
      noiseFrequency: 0.02,
      brushStrokes: true,
      colorBlend: 0.7,
    },
    oilPainting: {
      noiseFrequency: 0.05,
      brushStrokes: true,
      colorBlend: 0.9,
    },
    modern: {
      noiseFrequency: 0.08,
      brushStrokes: false,
      colorBlend: 0.5,
    },
  };

  schema: ConfigSchema = {
    properties: {
      stylePreset: {
        type: "enum",
        title: "艺术风格",
        default: "watercolor",
        enum: ["watercolor", "oilPainting", "modern"],
        enumNames: ["水彩", "油画", "现代"],
      },
      styleStrength: {
        type: "number",
        title: "风格强度",
        default: 0.7,
        minimum: 0,
        maximum: 1,
      },
      textureScale: {
        type: "number",
        title: "纹理比例",
        default: 1,
        minimum: 0.1,
        maximum: 2,
      },
    },
  };

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

  createGradient(
    canvas: fabric.Canvas,
    config: StyleTransferGradientConfig
  ): void {
    const { width, height } = canvas;
    const worker = new Worker(
      new URL("../workers/styleTransferWorker.ts", import.meta.url)
    );

    const baseGradient = this.createBaseGradient(
      width,
      height,
      config.colorStops
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

    worker.postMessage(
      {
        imageData: baseGradient,
        config: {
          ...config,
          stylePresetConfig:
            this.stylePresets[
              config.stylePreset as keyof typeof this.stylePresets
            ],
        },
      },
      { transfer: [baseGradient.data.buffer] }
    );
  }
}
