import { BaseGradientStrategy } from "../GradientStrategy";
import { ConfigSchema, GradientType, LinearGradientConfig } from "../types";
import * as fabric from "fabric";
import chroma from "chroma-js";
import { LINEAR_GRADIENT_PRESETS } from "../constants";

export class LinearGradientStrategy extends BaseGradientStrategy<LinearGradientConfig> {
  type: GradientType = "linear";
  name = "线性渐变";
  maxColorStops = 7;
  templates: Record<string, LinearGradientConfig> = LINEAR_GRADIENT_PRESETS;

  schema: ConfigSchema = {
    properties: {
      angle: {
        type: "number",
        title: "角度",
        default: 45,
        minimum: 0,
        maximum: 360,
      },
      algorithm: {
        type: "enum",
        title: "插值算法",
        default: "bezier",
        enum: [
          "rgb",
          "hsl",
          "lab",
          "bezier",
          "gamma",
          "random",
          "vibrant",
          "pastel",
          "harmonious",
          "complementary",
        ],
        enumNames: [
          "RGB线性",
          "HSL平滑",
          "LAB感知",
          "贝塞尔",
          "Gamma校正",
          "随机",
          "鲜艳",
          "柔和",
          "和谐",
          "互补",
        ],
      },
      steps: {
        type: "number",
        title: "插值步数",
        default: 16,
        minimum: 2,
        maximum: 32,
      },
      gamma: {
        type: "number",
        title: "Gamma值",
        default: 2.2,
        minimum: 1,
        maximum: 3,
      },
      seed: {
        type: "number",
        title: "随机种子",
        default: Math.floor(Math.random() * 65536),
        minimum: 0,
        maximum: 65536,
      },
      variation: {
        type: "enum",
        title: "变化模式",
        default: "center",
        enum: ["center", "corner", "random", "spiral", "wave"],
        enumNames: ["中心扩散", "角点扩散", "随机扩散", "螺旋渐变", "波浪渐变"],
      },
      intensity: {
        type: "number",
        title: "变化强度",
        default: 0.5,
        minimum: 0,
        maximum: 1,
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

  private getGradientCoords(
    width: number,
    height: number,
    angle: number,
    variation: string,
    intensity: number,
    seed: number
  ): { x1: number; y1: number; x2: number; y2: number } {
    const rand = this.mulberry32(seed);
    const rad = (angle * Math.PI) / 180;
    const centerX = width / 2;
    const centerY = height / 2;
    const diagonal = Math.sqrt(width * width + height * height);

    // 基础变化量
    const baseVariation = diagonal * intensity * 0.2;

    // 随机偏移函数
    const randomOffset = () => (rand() - 0.5) * 2 * baseVariation;

    switch (variation) {
      case "corner": {
        // 从角点开始的渐变
        const corner = Math.floor(rand() * 4);
        const x1 = corner % 2 === 0 ? 0 : width;
        const y1 = corner < 2 ? 0 : height;
        const x2 = width - x1;
        const y2 = height - y1;
        return { x1, y1, x2, y2 };
      }

      case "random": {
        // 完全随机的起点和终点
        return {
          x1: rand() * width,
          y1: rand() * height,
          x2: rand() * width,
          y2: rand() * height,
        };
      }

      case "spiral": {
        // 螺旋形渐变
        const spiralAngle = rad + rand() * Math.PI * 2;
        const radius = diagonal * 0.5 * intensity;
        return {
          x1: centerX,
          y1: centerY,
          x2: centerX + Math.cos(spiralAngle) * radius,
          y2: centerY + Math.sin(spiralAngle) * radius,
        };
      }

      case "wave": {
        // 波浪形渐变
        const waveAmplitude = height * intensity * 0.2;
        const waveFrequency = 2 + rand() * 4;
        const phase = rand() * Math.PI * 2;

        return {
          x1: centerX - Math.cos(rad) * width * 0.5,
          y1:
            centerY -
            Math.sin(rad) * height * 0.5 +
            Math.sin(phase) * waveAmplitude,
          x2: centerX + Math.cos(rad) * width * 0.5,
          y2:
            centerY +
            Math.sin(rad) * height * 0.5 +
            Math.sin(phase + waveFrequency) * waveAmplitude,
        };
      }

      default: {
        // 中心扩散带随机偏移
        return {
          x1: centerX - Math.cos(rad) * width * 0.5 + randomOffset(),
          y1: centerY - Math.sin(rad) * height * 0.5 + randomOffset(),
          x2: centerX + Math.cos(rad) * width * 0.5 + randomOffset(),
          y2: centerY + Math.sin(rad) * height * 0.5 + randomOffset(),
        };
      }
    }
  }

  createGradient(canvas: fabric.Canvas, config: LinearGradientConfig): void {
    const { width, height } = canvas;
    const angle = config.angle || 45;
    const variation = config.variation || "center";
    const intensity = config.intensity || 0.5;
    const seed = config.seed || Math.floor(Math.random() * 65536);

    const coords = this.getGradientCoords(
      width,
      height,
      angle,
      variation,
      intensity,
      seed
    );

    const gradient = new fabric.Gradient({
      type: "linear",
      coords,
      colorStops: this.processColorStops(config),
    });

    const rect = new fabric.Rect({
      width,
      height,
      fill: gradient,
    });

    canvas.add(rect);
    canvas.renderAll();
  }

  private processColorStops(config: LinearGradientConfig) {
    const { colorStops = [], algorithm = "rgb", seed = 12345 } = config;
    const rand = this.mulberry32(seed);

    if (colorStops.length < 2) {
      return [
        { offset: 0, color: "#000000" },
        { offset: 1, color: "#ffffff" },
      ];
    }

    const sortedStops = [...colorStops].sort((a, b) => a.offset - b.offset);

    switch (algorithm) {
      case "hsl": {
        return sortedStops.map((stop) => ({
          offset: stop.offset,
          color: chroma(stop.color).hex(), // 转换为hex
        }));
      }

      case "lab": {
        return sortedStops.map((stop) => ({
          offset: stop.offset,
          color: chroma(stop.color).hex(), // 转换为hex
        }));
      }

      case "bezier": {
        // 贝塞尔插值，生成更平滑的过渡
        const bezierColors = chroma
          .bezier(sortedStops.map((stop) => stop.color))
          .scale()
          .colors(10);

        return bezierColors.map((color, index) => ({
          offset: index / (bezierColors.length - 1),
          color,
        }));
      }

      case "random": {
        // 添加随机微扰
        return sortedStops.map((stop) => {
          const color = chroma(stop.color);
          const hsl = color.hsl();

          // 轻微调整色相和饱和度
          hsl[0] += (rand() - 0.5) * 10; // ±5° 色相变化
          hsl[1] += (rand() - 0.5) * 0.1; // ±5% 饱和度变化

          return {
            offset: stop.offset,
            color: chroma.hsl(...hsl).hex(),
          };
        });
      }

      case "complementary": {
        // 在主色基础上添加补色
        const enhancedStops = [];
        for (let i = 0; i < sortedStops.length - 1; i++) {
          const current = sortedStops[i];
          const next = sortedStops[i + 1];

          enhancedStops.push(current);

          // 在两个停止点之间添加补色
          if (next.offset - current.offset > 0.2) {
            const middleOffset = (current.offset + next.offset) / 2;
            const complementary = chroma(current.color)
              .set("hsl.h", (chroma(current.color).get("hsl.h") + 180) % 360)
              .saturate(0.5);

            enhancedStops.push({
              offset: middleOffset,
              color: complementary.hex(),
            });
          }
        }
        enhancedStops.push(sortedStops[sortedStops.length - 1]);
        return enhancedStops;
      }

      case "harmonious": {
        // 创建和谐的颜色变化
        return sortedStops.map((stop, index) => {
          const color = chroma(stop.color);
          const hsl = color.hsl();

          // 根据位置调整色相，创造和谐感
          const hueShift = (index / (sortedStops.length - 1)) * 30; // 30° 色相范围
          hsl[0] = (hsl[0] + hueShift) % 360;

          return {
            offset: stop.offset,
            color: chroma.hsl(...hsl).hex(),
          };
        });
      }

      case "vibrant": {
        // 增加色彩的鲜艳度
        return sortedStops.map((stop) => ({
          offset: stop.offset,
          color: chroma(stop.color)
            .saturate(1.2) // 增加饱和度
            .brighten(0.1) // 轻微提高亮度
            .hex(),
        }));
      }

      case "pastel": {
        // 创建柔和的粉彩效果
        return sortedStops.map((stop) => ({
          offset: stop.offset,
          color: chroma(stop.color)
            .desaturate(1.5) // 降低饱和度
            .brighten(0.8) // 提高亮度
            .hex(),
        }));
      }

      default: {
        return sortedStops.map((stop) => ({
          offset: stop.offset,
          color: chroma(stop.color).hex(), // 确保所有颜色都是hex格式
        }));
      }
    }
  }
}
