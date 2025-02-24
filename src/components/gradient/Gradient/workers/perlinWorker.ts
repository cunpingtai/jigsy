/* eslint-disable @typescript-eslint/no-explicit-any */
import chroma from "chroma-js";

class Perlin {
  private p: number[] = [];
  private permutation: number[] = [];

  constructor(seed = 123) {
    this.permutation = new Array(256).fill(0).map((_, i) => i);
    const rand = this.mulberry32(seed);
    for (let i = this.permutation.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [this.permutation[i], this.permutation[j]] = [
        this.permutation[j],
        this.permutation[i],
      ];
    }
    this.p = [...this.permutation, ...this.permutation];
  }

  private mulberry32(a: number) {
    return () => {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const grad2 = 1 + (h & 7);
    return (h & 8 ? -grad2 : grad2) * x + (h & 4 ? -grad2 : grad2) * y;
  }

  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = this.fade(x);
    const v = this.fade(y);
    const A = this.p[X] + Y;
    const B = this.p[X + 1] + Y;
    return this.lerp(
      v,
      this.lerp(u, this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y)),
      this.lerp(
        u,
        this.grad(this.p[A + 1], x, y - 1),
        this.grad(this.p[B + 1], x - 1, y - 1)
      )
    );
  }
}

self.onmessage = (e) => {
  const { width, height, config } = e.data;
  const { scale, octaves, persistence, amplitude, seed, colorStops } = config;

  const noise = new Perlin(seed);
  const imageData = new ImageData(width, height);
  const colorScale = chroma
    .scale(colorStops.map((stop: any) => stop.color))
    .mode("lab")
    .domain(colorStops.map((stop: any) => stop.offset));

  function octavePerlin(x: number, y: number): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += noise.noise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const noiseValue = octavePerlin(x * scale, y * scale);
      const basePosition = y / height;
      const position = basePosition + (noiseValue - 0.5) * amplitude;
      const color = chroma(colorScale(position).hex());
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
