import {
  DiffusionGradientConfig,
  LinearGradientConfig,
  PerlinGradientConfig,
  RadialGradientConfig,
  StyleTransferGradientConfig,
  SplineGradientConfig,
  FractalNoiseGradientConfig,
  WorleyNoiseGradientConfig,
} from "./types";

export const LINEAR_GRADIENT_PRESETS: Record<string, LinearGradientConfig> = {
  default: {
    colorStops: [
      { offset: 0, color: "#000" },
      { offset: 1, color: "#fff" },
    ],
    algorithm: "lab",
    angle: 45,
    steps: 24,
    variation: "center",
    intensity: 0.5,
    seed: Math.random() * 65536,
  },
  // 1. 日落渐变 - 基于自然色彩学
  // 使用暖色调模拟日落效果，遵循黄金时刻的自然光线变化
  sunset: {
    colorStops: [
      { offset: 0, color: "#FF512F" }, // 深橙
      { offset: 0.5, color: "#F09819" }, // 金黄
      { offset: 1, color: "#FFE9D2" }, // 淡米色
    ],
    algorithm: "lab", // 使用LAB确保色彩过渡自然
    angle: 45,
    steps: 24,
  },

  // 2. 海洋深度 - 基于色彩深度理论
  // 运用蓝色的单色渐变，模拟水的深度变化
  ocean: {
    colorStops: [
      { offset: 0, color: "#1A2980" }, // 深海蓝
      { offset: 0.6, color: "#26D0CE" }, // 浅海蓝
      { offset: 1, color: "#FFFFFF" }, // 白色浪花
    ],
    algorithm: "hsl", // HSL适合单色系渐变
    angle: 180,
    steps: 20,
  },

  // 3. 极光 - 基于自然现象色彩研究
  // 模拟北极光的梦幻效果
  aurora: {
    colorStops: [
      { offset: 0, color: "#009FFF" }, // 天蓝
      { offset: 0.5, color: "#00FF87" }, // 荧光绿
      { offset: 1, color: "#1A2980" }, // 深蓝
    ],
    algorithm: "bezier", // 贝塞尔曲线创造流动感
    angle: 315,
    steps: 28,
  },

  // 4. 薰衣草田 - 基于自然和谐色彩
  // 紫色系过渡，体现柔和与宁静
  lavender: {
    colorStops: [
      { offset: 0, color: "#8E2DE2" }, // 深紫
      { offset: 0.5, color: "#B06AB3" }, // 淡紫
      { offset: 1, color: "#E6E6FA" }, // 薰衣草白
    ],
    algorithm: "lab",
    angle: 135,
    steps: 20,
  },

  // 5. 霓虹都市 - 基于现代设计趋势
  // 赛博朋克风格的高饱和度配色
  neon: {
    colorStops: [
      { offset: 0, color: "#FF0080" }, // 霓虹粉
      { offset: 0.5, color: "#7A00FF" }, // 紫色
      { offset: 1, color: "#00FFEA" }, // 青色
    ],
    algorithm: "rgb", // RGB适合鲜艳的霓虹效果
    angle: 60,
    steps: 24,
    gamma: 1.8,
  },

  // 6. 森林晨露 - 基于自然色彩和谐
  // 绿色系渐变，体现生机与活力
  forest: {
    colorStops: [
      { offset: 0, color: "#134E5E" }, // 深森林绿
      { offset: 0.5, color: "#71B280" }, // 苔藓绿
      { offset: 1, color: "#DAE2DF" }, // 晨露白
    ],
    algorithm: "hsl",
    angle: 150,
    steps: 22,
  },

  // 7. 沙漠黄昏 - 基于地理环境色彩研究
  // 暖色调渐变，体现干燥与温暖
  desert: {
    colorStops: [
      { offset: 0, color: "#B79891" }, // 沙褐色
      { offset: 0.7, color: "#94716B" }, // 暗红
      { offset: 1, color: "#603813" }, // 深棕
    ],
    algorithm: "lab",
    angle: 165,
    steps: 20,
  },

  // 8. 莫兰迪色系 - 基于色彩艺术理论
  // 低饱和度的优雅过渡
  morandi: {
    colorStops: [
      { offset: 0, color: "#A6988C" }, // 莫兰迪灰褐
      { offset: 0.5, color: "#9A8B82" }, // 莫兰迪粉褐
      { offset: 1, color: "#8E7F76" }, // 莫兰迪深褐
    ],
    algorithm: "lab", // LAB确保柔和过渡
    angle: 90,
    steps: 16,
  },

  // 9. 极简黑白 - 基于明度对比理论
  // 经典黑白渐变，突出层次感
  minimal: {
    colorStops: [
      { offset: 0, color: "#2C3E50" }, // 深灰蓝
      { offset: 1, color: "#BDC3C7" }, // 浅灰
    ],
    algorithm: "gamma", // Gamma校正确保灰度过渡自然
    angle: 45,
    steps: 20,
    gamma: 2.2,
  },

  // 10. 彩虹糖 - 基于色彩心理学
  // 明快活泼的多色渐变
  candy: {
    colorStops: [
      { offset: 0, color: "#FF61D2" }, // 糖果粉
      { offset: 0.4, color: "#FE9090" }, // 蜜桃色
      { offset: 0.8, color: "#FFC796" }, // 奶油黄
      { offset: 1, color: "#FFEDAD" }, // 淡黄
    ],
    algorithm: "bezier", // 贝塞尔确保色彩过渡平滑
    angle: 120,
    steps: 28,
  },

  // 1. 梦幻极光 - 使用 bezier 算法
  auroraGlow: {
    colorStops: [
      { offset: 0, color: "#2E3192" }, // 深蓝
      { offset: 0.3, color: "#1BFFFF" }, // 青色
      { offset: 0.6, color: "#D4FF00" }, // 荧光绿
      { offset: 1, color: "#FA00FF" }, // 粉紫
    ],
    algorithm: "bezier",
    angle: 35,
    steps: 32,
    variation: "wave",
    intensity: 0.6,
    seed: Math.random() * 65536,
  },

  // 2. 赛博朋克 - 使用 random 算法
  cyberpunk: {
    colorStops: [
      { offset: 0, color: "#FF003C" }, // 霓虹红
      { offset: 0.5, color: "#FF00FF" }, // 霓虹紫
      { offset: 1, color: "#00FFFF" }, // 霓虹青
    ],
    algorithm: "random",
    angle: 60,
    steps: 24,
    variation: "spiral",
    intensity: 0.8,
    seed: Math.random() * 65536,
  },

  // 3. 静谧深海 - 使用 lab 算法
  deepOcean: {
    colorStops: [
      { offset: 0, color: "#000046" }, // 深海蓝
      { offset: 0.4, color: "#1CB5E0" }, // 海水蓝
      { offset: 1, color: "#000046" }, // 深海蓝
    ],
    algorithm: "lab",
    angle: 180,
    steps: 28,
    variation: "wave",
    intensity: 0.4,
    seed: Math.random() * 65536,
  },

  // 4. 和谐花园 - 使用 harmonious 算法
  harmonicGarden: {
    colorStops: [
      { offset: 0, color: "#00A86B" }, // 翡翠绿
      { offset: 0.5, color: "#7BB661" }, // 嫩叶绿
      { offset: 1, color: "#FFE5B4" }, // 杏仁黄
    ],
    algorithm: "harmonious",
    angle: 145,
    steps: 24,
    variation: "center",
    intensity: 0.5,
    seed: Math.random() * 65536,
  },

  // 5. 粉彩云霞 - 使用 pastel 算法
  pastelSkies: {
    colorStops: [
      { offset: 0, color: "#FFB3BA" }, // 粉红
      { offset: 0.5, color: "#BAFFC9" }, // 薄荷
      { offset: 1, color: "#BAE1FF" }, // 天蓝
    ],
    algorithm: "pastel",
    angle: 70,
    steps: 20,
    variation: "random",
    intensity: 0.3,
    seed: Math.random() * 65536,
  },

  // 6. 活力晨光 - 使用 vibrant 算法
  vibrantDawn: {
    colorStops: [
      { offset: 0, color: "#FF8C42" }, // 橙色
      { offset: 0.5, color: "#FFB3BA" }, // 粉红
      { offset: 1, color: "#FFF275" }, // 黄色
    ],
    algorithm: "vibrant",
    angle: 45,
    steps: 24,
    variation: "corner",
    intensity: 0.7,
    seed: Math.random() * 65536,
  },

  // 7. 补色艺术 - 使用 complementary 算法
  complementaryArt: {
    colorStops: [
      { offset: 0, color: "#6B48FF" }, // 紫色
      { offset: 0.5, color: "#FFFFFF" }, // 白色
      { offset: 1, color: "#FF4848" }, // 红色
    ],
    algorithm: "complementary",
    angle: 90,
    steps: 28,
    variation: "spiral",
    intensity: 0.6,
    seed: Math.random() * 65536,
  },

  // 8. HSL流光 - 使用 hsl 算法
  hslFlow: {
    colorStops: [
      { offset: 0, color: "#FF0080" }, // 玫红
      { offset: 0.4, color: "#FF8C00" }, // 橙色
      { offset: 0.6, color: "#00FF8C" }, // 绿色
      { offset: 1, color: "#00C8FF" }, // 蓝色
    ],
    algorithm: "hsl",
    angle: 120,
    steps: 32,
    variation: "wave",
    intensity: 0.5,
    seed: Math.random() * 65536,
  },

  // 9. 高科技感 - 使用 lab 和 spiral 变化
  techGrade: {
    colorStops: [
      { offset: 0, color: "#0B1026" }, // 深蓝黑
      { offset: 0.5, color: "#2D5CFF" }, // 亮蓝
      { offset: 1, color: "#00FFFF" }, // 青色
    ],
    algorithm: "lab",
    angle: 215,
    steps: 24,
    variation: "spiral",
    intensity: 0.7,
    seed: Math.random() * 65536,
  },

  // 10. 随机艺术 - 使用 random 和 wave 变化
  randomArt: {
    colorStops: [
      { offset: 0, color: "#FF0099" }, // 粉红
      { offset: 0.3, color: "#00FF99" }, // 薄荷绿
      { offset: 0.6, color: "#9900FF" }, // 紫色
      { offset: 1, color: "#FF9900" }, // 橙色
    ],
    algorithm: "random",
    angle: 30,
    steps: 28,
    variation: "wave",
    intensity: 0.8,
    seed: Math.random() * 65536,
  },
};

export const RADIAL_GRADIENT_PRESETS: Record<string, RadialGradientConfig> = {
  sunburst: {
    type: "radial",
    colorStops: [
      { offset: 0, color: "#FFD700" }, // 金色中心
      { offset: 0.5, color: "#FFA500" }, // 橙色过渡
      { offset: 1, color: "#FF4500" }, // 红橙色边缘
    ],
    centerX: 0.5,
    centerY: 0.5,
    radius: 0.8,
    aspectRatio: 1,
    interpolation: "exponential",
    interpolationFactor: 1.5,
    gamma: 2.2,
  },

  oceanDepth: {
    type: "radial",
    colorStops: [
      { offset: 0, color: "#E0FFFF" }, // 浅蓝色中心
      { offset: 0.3, color: "#87CEEB" }, // 天蓝色
      { offset: 0.7, color: "#4169E1" }, // 皇家蓝
      { offset: 1, color: "#000080" }, // 深蓝色边缘
    ],
    centerX: 0.5,
    centerY: 0.3,
    radius: 1,
    aspectRatio: 1.2,
    interpolation: "logarithmic",
    interpolationFactor: 2,
    gamma: 2.2,
  },

  neonPulse: {
    type: "radial",
    colorStops: [
      { offset: 0, color: "#FF1493" }, // 深粉色中心
      { offset: 0.4, color: "#9400D3" }, // 紫色过渡
      { offset: 0.8, color: "#4B0082" }, // 靛蓝色
      { offset: 1, color: "#000000" }, // 黑色边缘
    ],
    centerX: 0.5,
    centerY: 0.5,
    radius: 0.7,
    aspectRatio: 1,
    interpolation: "gamma",
    interpolationFactor: 1,
    gamma: 1.8,
  },

  softFocus: {
    type: "radial",
    colorStops: [
      { offset: 0, color: "#FFFFFF" }, // 白色中心
      { offset: 0.6, color: "#F8F8FF" }, // 幽灵白
      { offset: 1, color: "#E6E6FA" }, // 淡紫色边缘
    ],
    centerX: 0.5,
    centerY: 0.5,
    radius: 0.9,
    aspectRatio: 1,
    interpolation: "linear",
    interpolationFactor: 1,
    gamma: 2.2,
  },

  emeraldCore: {
    type: "radial",
    colorStops: [
      { offset: 0, color: "#50C878" }, // 翡翠绿中心
      { offset: 0.5, color: "#228B22" }, // 森林绿过渡
      { offset: 1, color: "#006400" }, // 深绿色边缘
    ],
    centerX: 0.5,
    centerY: 0.6,
    radius: 0.75,
    aspectRatio: 0.9,
    interpolation: "exponential",
    interpolationFactor: 1.2,
    gamma: 2.2,
  },
};

export const PERLIN_GRADIENT_PRESETS: Record<string, PerlinGradientConfig> = {
  default: {
    colorStops: [
      { offset: 0, color: "#000" },
      { offset: 1, color: "#fff" },
    ],
    scale: 0.02,
    octaves: 4,
    persistence: 0.5,
    amplitude: 0.4,
    seed: Math.random() * 65536,
  },
  // 梦幻水彩
  dreamyWatercolor: {
    colorStops: [
      { offset: 0, color: "#FF9A9E" },
      { offset: 0.5, color: "#FAD0C4" },
      { offset: 1, color: "#FFF1F1" },
    ],
    scale: 0.015,
    octaves: 4,
    persistence: 0.5,
    amplitude: 0.4,
    seed: Math.random() * 65536,
  },

  // 玻璃态模糊
  glassmorphism: {
    colorStops: [
      { offset: 0, color: "#8EC5FC" },
      { offset: 0.5, color: "#E0C3FC" },
      { offset: 1, color: "#FFFFFF" },
    ],
    scale: 0.02,
    octaves: 3,
    persistence: 0.6,
    amplitude: 0.25,
    seed: Math.random() * 65536,
  },

  // 北极光
  borealis: {
    colorStops: [
      { offset: 0, color: "#4facfe" },
      { offset: 0.5, color: "#00f2fe" },
      { offset: 1, color: "#a8edea" },
    ],
    scale: 0.025,
    octaves: 5,
    persistence: 0.7,
    amplitude: 0.35,
    seed: Math.random() * 65536,
  },
};

export const DIFFUSION_GRADIENT_PRESETS: Record<
  string,
  DiffusionGradientConfig
> = {
  default: {
    colorStops: [
      { offset: 0, color: "#000" },
      { offset: 1, color: "#fff" },
    ],
    steps: 20,
    noiseScale: 0.5,
    denoisingStrength: 0.7,
    seed: Math.random() * 65536,
  },
  // 1. 水彩晕染
  watercolor: {
    colorStops: [
      { offset: 0, color: "#FF9A9E" }, // 柔粉
      { offset: 0.4, color: "#FAD0C4" }, // 淡珊瑚
      { offset: 1, color: "#FFF1F1" }, // 米白
    ],
    steps: 30,
    noiseScale: 0.4,
    denoisingStrength: 0.65,
    seed: 12345,
  },

  // 2. 烟雾缭绕
  smoke: {
    colorStops: [
      { offset: 0, color: "#304352" }, // 深青灰
      { offset: 0.5, color: "#808080" }, // 中灰
      { offset: 1, color: "#d7d2cc" }, // 浅灰
    ],
    steps: 35,
    noiseScale: 0.6,
    denoisingStrength: 0.55,
    seed: 23456,
  },

  // 3. 梦幻云彩
  dreamyClouds: {
    colorStops: [
      { offset: 0, color: "#7F7FD5" }, // 淡紫
      { offset: 0.5, color: "#91EAE4" }, // 薄荷
      { offset: 1, color: "#86A8E7" }, // 天蓝
    ],
    steps: 25,
    noiseScale: 0.45,
    denoisingStrength: 0.7,
    seed: 34567,
  },

  // 4. 油画质感
  oilPainting: {
    colorStops: [
      { offset: 0, color: "#E65C00" }, // 深橙
      { offset: 0.3, color: "#F9D423" }, // 金黄
      { offset: 1, color: "#F5F5F5" }, // 白
    ],
    steps: 40,
    noiseScale: 0.7,
    denoisingStrength: 0.5,
    seed: 45678,
  },

  // 5. 极光扰动
  auroraWaves: {
    colorStops: [
      { offset: 0, color: "#1D976C" }, // 深绿
      { offset: 0.5, color: "#93F9B9" }, // 荧光绿
      { offset: 1, color: "#2D31FA" }, // 亮蓝
    ],
    steps: 45,
    noiseScale: 0.55,
    denoisingStrength: 0.75,
    seed: 56789,
  },

  // 6. 沙漠风暴
  sandstorm: {
    colorStops: [
      { offset: 0, color: "#B79891" }, // 沙褐
      { offset: 0.4, color: "#E5DED8" }, // 浅褐
      { offset: 1, color: "#7E5686" }, // 暗紫
    ],
    steps: 35,
    noiseScale: 0.65,
    denoisingStrength: 0.6,
    seed: 67890,
  },

  // 7. 深海涌动
  oceanDepths: {
    colorStops: [
      { offset: 0, color: "#000046" }, // 深蓝
      { offset: 0.5, color: "#1CB5E0" }, // 海蓝
      { offset: 1, color: "#000046" }, // 深蓝
    ],
    steps: 40,
    noiseScale: 0.5,
    denoisingStrength: 0.8,
    seed: 78901,
  },

  // 8. 星云漩涡
  nebulaSpiral: {
    colorStops: [
      { offset: 0, color: "#FF057C" }, // 亮粉
      { offset: 0.4, color: "#7C64D5" }, // 紫色
      { offset: 0.8, color: "#4CC3FF" }, // 亮蓝
      { offset: 1, color: "#212121" }, // 深灰
    ],
    steps: 50,
    noiseScale: 0.8,
    denoisingStrength: 0.6,
    seed: 89012,
  },

  // 9. 熔岩流动
  lavaFlow: {
    colorStops: [
      { offset: 0, color: "#F83600" }, // 亮红
      { offset: 0.4, color: "#FE8C00" }, // 橙色
      { offset: 1, color: "#2C0101" }, // 深褐
    ],
    steps: 35,
    noiseScale: 0.7,
    denoisingStrength: 0.65,
    seed: 90123,
  },

  // 10. 量子涟漪
  quantumRipples: {
    colorStops: [
      { offset: 0, color: "#8E2DE2" }, // 紫色
      { offset: 0.3, color: "#4A00E0" }, // 深蓝
      { offset: 0.7, color: "#00E0E0" }, // 青色
      { offset: 1, color: "#2DE28E" }, // 绿色
    ],
    steps: 45,
    noiseScale: 0.6,
    denoisingStrength: 0.7,
    seed: 11234,
  },
};

export const STYLE_TRANSFER_PRESETS: Record<
  string,
  StyleTransferGradientConfig
> = {
  watercolorSunset: {
    colorStops: [
      { offset: 0, color: "#FF7B89" },
      { offset: 0.5, color: "#FFB6B9" },
      { offset: 1, color: "#FFF5E1" },
    ],
    stylePreset: "watercolor",
    styleStrength: 0.7,
    textureScale: 1.2,
  },
  oilPaintingForest: {
    colorStops: [
      { offset: 0, color: "#2D5A27" },
      { offset: 0.6, color: "#5B8C5A" },
      { offset: 1, color: "#A4C2A5" },
    ],
    stylePreset: "oilPainting",
    styleStrength: 0.8,
    textureScale: 1.5,
  },
  modernAbstract: {
    colorStops: [
      { offset: 0, color: "#FF4365" },
      { offset: 0.4, color: "#00D9C0" },
      { offset: 1, color: "#FFFFF3" },
    ],
    stylePreset: "modern",
    styleStrength: 0.9,
    textureScale: 0.8,
  },
};

export const SPLINE_GRADIENT_PRESETS: Record<string, SplineGradientConfig> = {
  smoothWave: {
    type: "spline",
    colorStops: [
      { offset: 0, color: "#4A90E2" }, // 天蓝色
      { offset: 0.4, color: "#50E3C2" }, // 绿松石色
      { offset: 0.6, color: "#F5A623" }, // 橙色
      { offset: 1, color: "#E74C3C" }, // 红色
    ],
    splineType: "catmullRom",
    tension: 0.5,
    bias: 0,
    controlPoints: [
      { x: 0, y: 0.2 },
      { x: 0.3, y: 0.8 },
      { x: 0.7, y: 0.3 },
      { x: 1, y: 0.9 },
    ],
    resolution: 100,
  },

  gentleCurve: {
    type: "spline",
    colorStops: [
      { offset: 0, color: "#FFAFBD" }, // 粉红色
      { offset: 0.5, color: "#FFC3A0" }, // 桃色
      { offset: 1, color: "#C9FFBF" }, // 薄荷绿
    ],
    splineType: "bezier",
    tension: 0.3,
    bias: 0.2,
    controlPoints: [
      { x: 0, y: 0 },
      { x: 0.2, y: 0.2 },
      { x: 0.8, y: 0.8 },
      { x: 1, y: 1 },
    ],
    resolution: 150,
  },

  dynamicFlow: {
    type: "spline",
    colorStops: [
      { offset: 0, color: "#8E2DE2" }, // 紫色
      { offset: 0.5, color: "#4A00E0" }, // 深蓝色
      { offset: 1, color: "#00C9FF" }, // 亮蓝色
    ],
    splineType: "hermite",
    tension: 0.7,
    bias: -0.3,
    controlPoints: [
      { x: 0, y: 0 },
      { x: 0.4, y: 0.9 },
      { x: 0.6, y: 0.1 },
      { x: 1, y: 1 },
    ],
    resolution: 120,
  },

  naturalPath: {
    type: "spline",
    colorStops: [
      { offset: 0, color: "#134E5E" }, // 深青色
      { offset: 0.5, color: "#71B280" }, // 森林绿
      { offset: 1, color: "#DAE2F8" }, // 淡蓝色
    ],
    splineType: "catmullRom",
    tension: 0.4,
    bias: 0.1,
    controlPoints: [
      { x: 0, y: 0.5 },
      { x: 0.25, y: 0.2 },
      { x: 0.75, y: 0.8 },
      { x: 1, y: 0.5 },
    ],
    resolution: 130,
  },

  artisanBlend: {
    type: "spline",
    colorStops: [
      { offset: 0, color: "#FF6B6B" }, // 珊瑚红
      { offset: 0.3, color: "#4ECDC4" }, // 绿松石
      { offset: 0.7, color: "#45B7D1" }, // 天蓝色
      { offset: 1, color: "#96E6A1" }, // 薄荷绿
    ],
    splineType: "bezier",
    tension: 0.6,
    bias: 0,
    controlPoints: [
      { x: 0, y: 0 },
      { x: 0.3, y: 0.7 },
      { x: 0.7, y: 0.3 },
      { x: 1, y: 1 },
    ],
    resolution: 140,
  },
};

export const FRACTAL_NOISE_PRESETS: Record<string, FractalNoiseGradientConfig> =
  {
    cloudySunset: {
      type: "fractalNoise",
      colorStops: [
        { offset: 0, color: "#FF7B89" }, // 粉红色
        { offset: 0.3, color: "#FFB6B9" }, // 浅粉色
        { offset: 0.6, color: "#FFC8A2" }, // 杏色
        { offset: 1, color: "#FFF5E1" }, // 米白色
      ],
      noiseType: "hybrid",
      octaves: 6,
      persistence: 0.6,
      scale: 0.003,
      seed: 12345,
      ridgeOffset: 1.2,
      turbulence: true,
      domainWarp: true,
      warpStrength: 0.4,
    },

    galaxyNight: {
      type: "fractalNoise",
      colorStops: [
        { offset: 0, color: "#0D1B2A" }, // 深蓝色
        { offset: 0.4, color: "#1B263B" }, // 午夜蓝
        { offset: 0.7, color: "#415A77" }, // 钢青色
        { offset: 0.9, color: "#778DA9" }, // 灰蓝色
        { offset: 1, color: "#E0E1DD" }, // 星光色
      ],
      noiseType: "fractal",
      octaves: 8,
      persistence: 0.7,
      scale: 0.008,
      seed: 67890,
      ridgeOffset: 1.5,
      turbulence: false,
      domainWarp: true,
      warpStrength: 0.8,
    },

    marbleTexture: {
      type: "fractalNoise",
      colorStops: [
        { offset: 0, color: "#E8E6E1" }, // 象牙白
        { offset: 0.3, color: "#D3D3D3" }, // 浅灰色
        { offset: 0.7, color: "#B8B8B8" }, // 中灰色
        { offset: 1, color: "#A9A9A9" }, // 深灰色
      ],
      noiseType: "simplex",
      octaves: 4,
      persistence: 0.5,
      scale: 0.006,
      seed: 23456,
      ridgeOffset: 1.8,
      turbulence: true,
      domainWarp: false,
      warpStrength: 0.3,
    },

    mistyForest: {
      type: "fractalNoise",
      colorStops: [
        { offset: 0, color: "#2D5A27" }, // 深绿色
        { offset: 0.4, color: "#5B8C5A" }, // 森林绿
        { offset: 0.7, color: "#86A97D" }, // 苔绿色
        { offset: 1, color: "#C2D6C4" }, // 薄雾色
      ],
      noiseType: "hybrid",
      octaves: 5,
      persistence: 0.45,
      scale: 0.004,
      seed: 34567,
      ridgeOffset: 1.3,
      turbulence: true,
      domainWarp: true,
      warpStrength: 0.6,
    },

    oceanWaves: {
      type: "fractalNoise",
      colorStops: [
        { offset: 0, color: "#003049" }, // 深海蓝
        { offset: 0.3, color: "#00509D" }, // 海军蓝
        { offset: 0.6, color: "#00A8E8" }, // 亮蓝色
        { offset: 1, color: "#61E8E1" }, // 浅绿松石色
      ],
      noiseType: "fractal",
      octaves: 7,
      persistence: 0.65,
      scale: 0.005,
      seed: 45678,
      ridgeOffset: 1.4,
      turbulence: true,
      domainWarp: true,
      warpStrength: 0.7,
    },

    desertSands: {
      type: "fractalNoise",
      colorStops: [
        { offset: 0, color: "#C2B280" }, // 沙褐色
        { offset: 0.4, color: "#D4C19C" }, // 浅沙色
        { offset: 0.7, color: "#E6D5B8" }, // 米色
        { offset: 1, color: "#F5E6CA" }, // 象牙色
      ],
      noiseType: "hybrid",
      octaves: 5,
      persistence: 0.55,
      scale: 0.007,
      seed: 56789,
      ridgeOffset: 1.6,
      turbulence: false,
      domainWarp: true,
      warpStrength: 0.5,
    },
  };

export const WORLEY_NOISE_PRESETS: Record<string, WorleyNoiseGradientConfig> = {
  crystalFormation: {
    type: "worleyNoise",
    colorStops: [
      { offset: 0, color: "#E3F2FD" }, // 浅蓝色
      { offset: 0.4, color: "#90CAF9" }, // 天蓝色
      { offset: 0.7, color: "#42A5F5" }, // 亮蓝色
      { offset: 1, color: "#1E88E5" }, // 深蓝色
    ],
    cellCount: 25,
    distanceFunction: "euclidean",
    combineFunction: "f2minusf1",
    jitter: 0.6,
    scale: 1.2,
    seed: 12345,
    edgeSmoothing: 0.4,
    distortionAmount: 0.2,
  },

  organicCells: {
    type: "worleyNoise",
    colorStops: [
      { offset: 0, color: "#81C784" }, // 浅绿色
      { offset: 0.3, color: "#66BB6A" }, // 中绿色
      { offset: 0.7, color: "#4CAF50" }, // 绿色
      { offset: 1, color: "#388E3C" }, // 深绿色
    ],
    cellCount: 30,
    distanceFunction: "manhattan",
    combineFunction: "f1",
    jitter: 0.8,
    scale: 0.9,
    seed: 23456,
    edgeSmoothing: 0.6,
    distortionAmount: 0.3,
  },

  leatherTexture: {
    type: "worleyNoise",
    colorStops: [
      { offset: 0, color: "#8D6E63" }, // 浅棕色
      { offset: 0.4, color: "#795548" }, // 棕色
      { offset: 0.7, color: "#6D4C41" }, // 深棕色
      { offset: 1, color: "#5D4037" }, // 暗棕色
    ],
    cellCount: 35,
    distanceFunction: "chebyshev",
    combineFunction: "f1plusf2",
    jitter: 0.5,
    scale: 1.5,
    seed: 34567,
    edgeSmoothing: 0.3,
    distortionAmount: 0.4,
  },

  reptileSkin: {
    type: "worleyNoise",
    colorStops: [
      { offset: 0, color: "#7CB342" }, // 浅橄榄绿
      { offset: 0.3, color: "#689F38" }, // 橄榄绿
      { offset: 0.6, color: "#558B2F" }, // 深橄榄绿
      { offset: 1, color: "#33691E" }, // 暗橄榄绿
    ],
    cellCount: 40,
    distanceFunction: "euclidean",
    combineFunction: "f2",
    jitter: 0.4,
    scale: 1.8,
    seed: 45678,
    edgeSmoothing: 0.2,
    distortionAmount: 0.5,
  },

  bubblePattern: {
    type: "worleyNoise",
    colorStops: [
      { offset: 0, color: "#B39DDB" }, // 浅紫色
      { offset: 0.4, color: "#9575CD" }, // 紫色
      { offset: 0.7, color: "#7E57C2" }, // 深紫色
      { offset: 1, color: "#673AB7" }, // 暗紫色
    ],
    cellCount: 20,
    distanceFunction: "euclidean",
    combineFunction: "f1",
    jitter: 0.7,
    scale: 1.1,
    seed: 56789,
    edgeSmoothing: 0.8,
    distortionAmount: 0.1,
  },

  crackedEarth: {
    type: "worleyNoise",
    colorStops: [
      { offset: 0, color: "#A1887F" }, // 浅土色
      { offset: 0.3, color: "#8D6E63" }, // 土色
      { offset: 0.7, color: "#795548" }, // 深土色
      { offset: 1, color: "#6D4C41" }, // 暗土色
    ],
    cellCount: 15,
    distanceFunction: "manhattan",
    combineFunction: "f2minusf1",
    jitter: 0.3,
    scale: 2.0,
    seed: 67890,
    edgeSmoothing: 0.1,
    distortionAmount: 0.6,
  },
};
