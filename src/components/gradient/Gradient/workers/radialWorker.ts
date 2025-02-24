import chroma from "chroma-js";
import { RadialGradientConfig } from "../types";

function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  aspectRatio: number = 1
): number {
  const dx = (x2 - x1) * aspectRatio;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function applyInterpolation(
  t: number,
  type: string,
  factor: number,
  gamma: number
): number {
  switch (type) {
    case "exponential":
      return Math.pow(t, factor);
    case "logarithmic":
      return Math.log1p(t * factor) / Math.log1p(factor);
    case "gamma":
      return Math.pow(t, 1 / gamma);
    default:
      return t;
  }
}

self.onmessage = (e: {
  data: { width: number; height: number; config: RadialGradientConfig };
}) => {
  const { width, height, config } = e.data;
  const {
    centerX,
    centerY,
    radius,
    aspectRatio = 1,
    interpolation = "linear",
    interpolationFactor = 1,
    gamma = 2.2,
    colorStops,
  } = config;

  const imageData = new ImageData(width, height);
  const colorScale = chroma
    .scale(colorStops.map((stop) => stop.color))
    .mode("lab")
    .domain(colorStops.map((stop) => stop.offset));

  const centerPxX = width * centerX;
  const centerPxY = height * centerY;
  const maxRadius = Math.max(width, height) * radius;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // 计算归一化距离
      const distance = calculateDistance(
        x,
        y,
        centerPxX,
        centerPxY,
        aspectRatio
      );
      let t = Math.min(distance / maxRadius, 1);

      // 应用插值
      t = applyInterpolation(t, interpolation, interpolationFactor, gamma);

      // 获取颜色
      const color = chroma(colorScale(t).hex());
      const [r, g, b] = color.rgb();

      const i = (y * width + x) * 4;
      imageData.data[i] = r;
      imageData.data[i + 1] = g;
      imageData.data[i + 2] = b;
      imageData.data[i + 3] = 255;
    }
  }

  self.postMessage(
    { result: imageData },
    { transfer: [imageData.data.buffer] }
  );
};
