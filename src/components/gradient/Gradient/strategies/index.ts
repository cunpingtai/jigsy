import { LinearGradientStrategy } from "./LinearGradientStrategy";
import { RadialGradientStrategy } from "./RadialGradientStrategy";
import { PerlinGradientStrategy } from "./PerlinGradientStrategy";
import { DiffusionGradientStrategy } from "./DiffusionGradientStrategy";
import { StyleTransferGradientStrategy } from "./StyleTransferGradientStrategy";
import { SplineGradientStrategy } from "./SplineGradientStrategy";
import { FractalNoiseGradientStrategy } from "./FractalNoiseGradientStrategy";
import { WorleyNoiseGradientStrategy } from "./WorleyNoiseGradientStrategy";

export const gradientStrategies = {
  linear: new LinearGradientStrategy(),
  radial: new RadialGradientStrategy(),
  perlin: new PerlinGradientStrategy(),
  diffusion: new DiffusionGradientStrategy(),
  styleTransfer: new StyleTransferGradientStrategy(),
  spline: new SplineGradientStrategy(),
  fractalNoise: new FractalNoiseGradientStrategy(),
  worleyNoise: new WorleyNoiseGradientStrategy(),
};
