import { SplineGradientConfig } from "../types";
import chroma from "chroma-js";

interface Point {
  x: number;
  y: number;
}

class SplineInterpolator {
  private points: Point[];
  private tension: number;
  private bias: number;
  private splineType: string;

  constructor(
    points: Point[],
    tension: number,
    bias: number,
    splineType: string
  ) {
    this.points = points;
    this.tension = tension;
    this.bias = bias;
    this.splineType = splineType;
  }

  private bezier(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;

    return {
      x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
      y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
    };
  }

  private catmullRom(
    t: number,
    p0: Point,
    p1: Point,
    p2: Point,
    p3: Point
  ): Point {
    const t2 = t * t;
    const t3 = t2 * t;

    return {
      x:
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      y:
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    };
  }

  private hermite(
    t: number,
    p0: Point,
    p1: Point,
    p2: Point,
    p3: Point
  ): Point {
    const tension = this.tension;
    const bias = this.bias;

    const t2 = t * t;
    const t3 = t2 * t;

    const h1 = 2 * t3 - 3 * t2 + 1;
    const h2 = -2 * t3 + 3 * t2;
    const h3 = t3 - 2 * t2 + t;
    const h4 = t3 - t2;

    const m0 = (1 - tension) * (1 + bias) * (p1.y - p0.y);
    const m1 = (1 - tension) * (1 - bias) * (p2.y - p1.y);

    return {
      x: h1 * p1.x + h2 * p2.x + h3 * (p2.x - p0.x) + h4 * (p3.x - p1.x),
      y: h1 * p1.y + h2 * p2.y + h3 * m0 + h4 * m1,
    };
  }

  interpolate(t: number): Point {
    if (t <= 0) return this.points[0];
    if (t >= 1) return this.points[this.points.length - 1];

    const i = Math.floor(t * (this.points.length - 1));
    const localT = t * (this.points.length - 1) - i;

    const p0 = this.points[Math.max(0, i - 1)];
    const p1 = this.points[i];
    const p2 = this.points[Math.min(this.points.length - 1, i + 1)];
    const p3 = this.points[Math.min(this.points.length - 1, i + 2)];

    switch (this.splineType) {
      case "bezier":
        return this.bezier(localT, p0, p1, p2, p3);
      case "catmullRom":
        return this.catmullRom(localT, p0, p1, p2, p3);
      case "hermite":
        return this.hermite(localT, p0, p1, p2, p3);
      default:
        return this.catmullRom(localT, p0, p1, p2, p3);
    }
  }
}

self.onmessage = (e: {
  data: { width: number; height: number; config: SplineGradientConfig };
}) => {
  const { width, height, config } = e.data;
  const { splineType, tension, bias, controlPoints, resolution, colorStops } =
    config;

  const imageData = new ImageData(width, height);
  const colorScale = chroma
    .scale(colorStops.map((stop) => stop.color))
    .mode("lab")
    .domain(colorStops.map((stop) => stop.offset));

  const spline = new SplineInterpolator(
    controlPoints,
    tension,
    bias,
    splineType
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tx = x / width;
      const ty = y / height;

      // 计算当前点到样条曲线的最短距离
      let minDist = Infinity;
      let closestT = 0;

      for (let i = 0; i <= resolution; i++) {
        const t = i / resolution;
        const point = spline.interpolate(t);
        const dx = tx - point.x;
        const dy = ty - point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDist) {
          minDist = dist;
          closestT = t;
        }
      }

      // 获取颜色
      const color = chroma(colorScale(closestT).hex());
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
