import {
  ConfigSchema,
  GradientConfig,
  GradientStrategy,
  GradientType,
} from "./types";
import * as fabric from "fabric";

export abstract class BaseGradientStrategy<
  T extends GradientConfig = GradientConfig
> implements GradientStrategy<T>
{
  abstract type: GradientType;
  abstract schema: ConfigSchema;
  abstract createGradient(canvas: fabric.Canvas, config: T): void;
  abstract maxColorStops: number;
  abstract templates: Record<string, T>;
  abstract name: string;
}
