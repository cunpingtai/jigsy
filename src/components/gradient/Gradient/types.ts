import * as fabric from "fabric";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface GradientProps {
  className?: string;
  width?: number;
  height?: number;
}

export type GradientType =
  | "linear"
  | "radial"
  | "perlin"
  | "diffusion"
  | "styleTransfer"
  | "spline"
  | "fractalNoise"
  | "worleyNoise";

export interface ColorStop {
  offset: number;
  color: string;
}

// 基础渐变配置
export interface BaseGradientConfig {
  colorStops: ColorStop[];
}

export interface FractalNoiseGradientConfig {
  type: GradientType;
  colorStops: { offset: number; color: string }[];
  noiseType: "simplex" | "fractal" | "hybrid";
  octaves: number; // 分形层级数
  persistence: number; // 每层振幅衰减
  scale: number; // 噪声缩放
  seed: number; // 随机种子
  ridgeOffset: number; // 山脊偏移（用于分形噪声）
  turbulence: boolean; // 是否使用湍流效果
  domainWarp: boolean; // 是否使用域扭曲
  warpStrength: number; // 域扭曲强度
}

export interface DiffusionGradientConfig extends BaseGradientConfig {
  steps?: number; // 扩散步数
  noiseScale?: number; // 噪声强度
  denoisingStrength?: number; // 去噪强度
  seed?: number; // 随机种子
}

// 线性渐变配置
export interface LinearGradientConfig extends BaseGradientConfig {
  angle?: number;
  algorithm:
    | "rgb"
    | "hsl"
    | "lab"
    | "bezier"
    | "gamma"
    | "random"
    | "vibrant"
    | "pastel"
    | "harmonious"
    | "complementary";
  steps?: number;
  gamma?: number;
  variation?: "center" | "corner" | "random" | "spiral" | "wave";
  intensity?: number;
  seed?: number;
}

// 径向渐变配置
export interface RadialGradientConfig {
  type: GradientType;
  colorStops: { offset: number; color: string }[];
  centerX: number; // 中心点X坐标 (0-1)
  centerY: number; // 中心点Y坐标 (0-1)
  focalX?: number; // 焦点X坐标 (0-1)
  focalY?: number; // 焦点Y坐标 (0-1)
  radius: number; // 半径 (0-1)
  aspectRatio?: number; // 椭圆长宽比
  interpolation: "linear" | "exponential" | "logarithmic" | "gamma";
  interpolationFactor: number; // 插值因子
  gamma?: number; // Gamma值
}

export interface SplineGradientConfig {
  type: GradientType;
  colorStops: { offset: number; color: string }[];
  splineType: "bezier" | "catmullRom" | "bSpline" | "hermite";
  tension: number; // 张力系数 (0-1)
  bias: number; // 偏差系数 (-1 to 1)
  controlPoints: { x: number; y: number }[]; // 控制点
  resolution: number; // 插值分辨率
}

export interface StyleTransferGradientConfig extends BaseGradientConfig {
  stylePreset: string;
  styleStrength: number;
  textureScale: number;
}

// Perlin Noise 渐变效果
export interface PerlinGradientConfig extends BaseGradientConfig {
  scale?: number; // Perlin noise 缩放
  octaves?: number; // 噪声叠加次数
  persistence?: number; // 每个八度的影响程度
  amplitude?: number; // 颜色扰动强度
  seed?: number; // 随机种子
}

export interface WorleyNoiseGradientConfig {
  type: GradientType;
  colorStops: { offset: number; color: string }[];
  cellCount: number; // 细胞数量
  distanceFunction: "euclidean" | "manhattan" | "chebyshev"; // 距离计算方式
  combineFunction: "f1" | "f2" | "f2minusf1" | "f1plusf2"; // 距离组合方式
  jitter: number; // 细胞点扰动程度 (0-1)
  scale: number; // 整体缩放
  seed: number; // 随机种子
  edgeSmoothing: number; // 边缘平滑度 (0-1)
  distortionAmount: number; // 扭曲程度 (0-1)
}

// 联合类型，包含所有可能的渐变配置
export type GradientConfig =
  | LinearGradientConfig
  | RadialGradientConfig
  | PerlinGradientConfig
  | DiffusionGradientConfig
  | StyleTransferGradientConfig
  | FractalNoiseGradientConfig
  | SplineGradientConfig
  | WorleyNoiseGradientConfig;

// 更新 GradientStrategy 接口以支持具体的配置类型
export interface GradientStrategy<T extends GradientConfig = GradientConfig> {
  type: GradientType;
  name: string;
  schema: ConfigSchema;
  createGradient: (canvas: fabric.Canvas, config: T) => void;
}

type ConfigSchemaProperty = {
  type: "number" | "string" | "enum" | "boolean" | "object" | "array";
  title: string;
  default?: any;
  minimum?: number;
  maximum?: number;
  enum?: string[];
  enumNames?: string[];
  properties?: {
    [key: string]: ConfigSchemaProperty;
  };
  items?: {
    type: "number" | "string" | "enum" | "boolean" | "object" | "array";
    properties?: {
      [key: string]: ConfigSchemaProperty;
    };
  };
};

export interface ConfigSchema {
  properties: {
    [key: string]: ConfigSchemaProperty;
  };
}

export interface Point {
  x: number;
  y: number;
  color: string;
  handleIn: {
    x: number;
    y: number;
  };
  handleOut: {
    x: number;
    y: number;
  };
}
