/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FC, useEffect, useRef, useState, useMemo } from "react";
import * as fabric from "fabric";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { gradientStrategies } from "./strategies";
import { GradientConfig, GradientType } from "./types";

interface GradientProps {
  className?: string;
  width?: number;
  height?: number;
}

export const Gradient: FC<GradientProps> = ({
  className,
  width = 1000,
  height = 1000,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [config, setConfig] = useState<GradientConfig>(
    gradientStrategies[gradientType].templates["default"]
  );
  const [preset, setPreset] = useState<string>("");
  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        skipTargetFind: true,
        preserveObjectStacking: true,
        selection: false,
      });

      setCanvas(fabricCanvas);
      return () => {
        fabricCanvas.dispose();
      };
    }
  }, [width, height]);

  const currentStrategy = useMemo(() => {
    return gradientStrategies[gradientType];
  }, [gradientType]);

  useEffect(() => {
    const config = Object.keys(currentStrategy.schema.properties).reduce(
      (acc, key) => {
        acc[key as keyof GradientConfig] =
          currentStrategy.schema.properties[key].default;
        return acc;
      },
      {} as GradientConfig
    );

    setConfig((prev) => ({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      colorStops: currentStrategy.colorStops,
      ...prev,
      ...config,
    }));
  }, [currentStrategy]);

  const handleConfigChange = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const drawGradient = () => {
    if (!canvas || !currentStrategy) return;
    currentStrategy.createGradient(canvas, config as any);
  };

  const addColorStop = () => {
    setConfig((prev) => ({
      ...prev,
      colorStops: [
        ...prev.colorStops,
        { offset: Math.random(), color: "#000000" },
      ].sort((a, b) => a.offset - b.offset),
    }));
  };

  const removeColorStop = (index: number) => {
    if (config.colorStops.length <= 2) return; // 保持至少两个颜色停止点
    setConfig((prev) => ({
      ...prev,
      colorStops: prev.colorStops.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    if (preset) {
      setConfig((prev) => ({
        ...prev,
        ...currentStrategy.templates[preset as string],
      }));
    }
  }, [currentStrategy.templates, preset]);

  const updateColorStop = (
    index: number,
    field: "offset" | "color",
    value: string | number
  ) => {
    setConfig((prev) => ({
      ...prev,
      colorStops: prev.colorStops
        .map((stop, i) =>
          i === index
            ? { ...stop, [field]: field === "offset" ? Number(value) : value }
            : stop
        )
        .sort((a, b) => a.offset - b.offset),
    }));
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex gap-4 flex-wrap">
        <Select
          value={preset}
          onValueChange={(value: string) => setPreset(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择预设" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(currentStrategy.templates).map((preset) => (
              <SelectItem key={preset} value={preset}>
                {preset}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={gradientType}
          onValueChange={(value: GradientType) => setGradientType(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择渐变类型" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(gradientStrategies).map((type) => (
              <SelectItem key={type} value={type}>
                {gradientStrategies[type as GradientType].name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 颜色停止点配置 */}
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">颜色停止点</h3>
            <Button variant="outline" size="sm" onClick={addColorStop}>
              添加颜色
            </Button>
          </div>

          {config.colorStops.map((stop, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={1}
                step={0.1}
                value={stop.offset}
                onChange={(e) =>
                  updateColorStop(index, "offset", e.target.value)
                }
                className="w-20"
              />
              <Input
                type="color"
                value={stop.color}
                onChange={(e) =>
                  updateColorStop(index, "color", e.target.value)
                }
                className="w-20"
              />
              {config.colorStops.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeColorStop(index)}
                >
                  删除
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* 动态渲染策略配置表单 */}
        {Object.entries(currentStrategy.schema.properties).map(
          ([key, schema]) => (
            <div key={key} className="flex items-center gap-2">
              <span>{schema.title}</span>
              {schema.type === "enum" ? (
                <Select
                  value={
                    config[key as keyof Omit<GradientConfig, "colorStops">]
                  }
                  onValueChange={(value) => handleConfigChange(key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择渐变类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {schema.enumNames?.map((item, index) => (
                      <SelectItem key={item} value={schema.enum?.[index] || ""}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : schema.type === "boolean" ? (
                <Switch
                  checked={
                    config[key as keyof Omit<GradientConfig, "colorStops">] ??
                    false
                  }
                  onCheckedChange={(checked) =>
                    handleConfigChange(key, checked)
                  }
                />
              ) : (
                <Input
                  type={schema.type === "number" ? "number" : "text"}
                  value={
                    config[key as keyof Omit<GradientConfig, "colorStops">] ??
                    schema.default
                  }
                  onChange={(e) => handleConfigChange(key, e.target.value)}
                  min={schema.minimum}
                  max={schema.maximum}
                />
              )}
            </div>
          )
        )}

        <Button onClick={drawGradient}>生成渐变</Button>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
};
