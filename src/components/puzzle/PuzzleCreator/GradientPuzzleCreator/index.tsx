import { FC, useState, useRef, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { debounce } from "lodash";
import { useI18n } from "@/app/[locale]/providers";

type GradientPuzzleCreatorMeta = {
  gradient?: string;
  angle?: number;
  gradientType?: "linear" | "radial";
  colors?: string[];
  selectedGradient?: {
    name: string;
    colors: string[];
    angle: number;
  };
};

type GradientPuzzleCreatorProps = {
  width?: number;
  height?: number;
  onGenerate: (image: string, meta: GradientPuzzleCreatorMeta) => void;
  meta?: GradientPuzzleCreatorMeta;
};

export const GradientPuzzleCreator: FC<GradientPuzzleCreatorProps> = ({
  width,
  height,
  onGenerate,
  meta,
}) => {
  // 预设渐变方案
  const presetGradients = [
    {
      name: "日落",
      colors: ["#f97316", "#db2777"],
      angle: 45,
    },
    {
      name: "极光",
      colors: ["#22c55e", "#0ea5e9"],
      angle: 120,
    },
    {
      name: "深邃",
      colors: ["#1e293b", "#334155"],
      angle: 165,
    },
    {
      name: "梦幻",
      colors: ["#d946ef", "#8b5cf6"],
      angle: 60,
    },
    {
      name: "彩虹",
      colors: [
        "#0ea5e9",
        "#f43f5e",
        "#f97316",
        "#22c55e",
        "#d946ef",
        "#8b5cf6",
      ],
      angle: 0,
    },
    {
      name: "星空",
      colors: ["#0f172a", "#1e293b", "#334155", "#475569"],
      angle: 180,
    },

    // ... 更多预设
  ];
  const { data } = useI18n();
  const [selectedGradient, setSelectedGradient] = useState(
    meta?.selectedGradient || presetGradients[0]
  );
  const [colors, setColors] = useState<string[]>(
    meta?.colors || selectedGradient.colors
  );
  const [angle, setAngle] = useState(meta?.angle || selectedGradient.angle);
  const [gradientType, setGradientType] = useState<"linear" | "radial">(
    meta?.gradientType || "linear"
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 添加新颜色
  const addColor = () => {
    if (colors.length < 7) {
      // 添加一个新颜色，默认为最后一个颜色
      setColors([...colors, colors[colors.length - 1]]);
    }
  };

  // 移除颜色
  const removeColor = (index: number) => {
    if (colors.length > 2) {
      const newColors = [...colors];
      newColors.splice(index, 1);
      setColors(newColors);
    }
  };

  // 更新特定位置的颜色
  const updateColor = (index: number, color: string) => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);
  };

  const update = useCallback(
    debounce((canvas: HTMLCanvasElement, meta: GradientPuzzleCreatorMeta) => {
      onGenerate?.(canvas.toDataURL("image/png"), meta);
    }, 300),
    []
  );
  // 渲染Canvas上的渐变
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置canvas尺寸
    canvas.width = width || 1024;
    canvas.height = height || 1024;

    if (gradientType === "linear") {
      // 计算角度对应的起点和终点
      const angleRad = (angle * Math.PI) / 180;
      const width = canvas.width;
      const height = canvas.height;

      // 计算渐变的起点和终点
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.max(width, height) / 2;

      const startX = centerX - Math.cos(angleRad) * radius;
      const startY = centerY - Math.sin(angleRad) * radius;
      const endX = centerX + Math.cos(angleRad) * radius;
      const endY = centerY + Math.sin(angleRad) * radius;

      // 创建线性渐变
      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);

      // 添加多个颜色停止点
      colors.forEach((color, index) => {
        const offset = index / (colors.length - 1);
        gradient.addColorStop(offset, color);
      });

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else {
      // 径向渐变
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.max(width, height) / 2;

      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
      );

      // 添加多个颜色停止点
      colors.forEach((color, index) => {
        const offset = index / (colors.length - 1);
        gradient.addColorStop(offset, color);
      });

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    update(canvas, {
      gradient: selectedGradient.name,
      angle,
      gradientType,
      colors,
      selectedGradient,
    });
  }, [
    colors,
    angle,
    gradientType,
    onGenerate,
    update,
    width,
    height,
    selectedGradient,
  ]);

  return (
    <div className="space-y-6">
      {/* 渐变预览 - 使用Canvas */}
      <canvas ref={canvasRef} className="h-40 w-full rounded-lg shadow-inner" />

      {/* 预设渐变 */}
      <div className="space-y-2">
        <Label>{data.presetGradient}</Label>
        <div className="grid grid-cols-4 gap-2">
          {presetGradients.map((gradient, index) => (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "w-full h-16 rounded-lg p-0 overflow-hidden",
                selectedGradient === gradient && "ring-2 ring-primary"
              )}
              onClick={() => {
                setSelectedGradient(gradient);
                setColors(gradient.colors);
                setAngle(gradient.angle);
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(${
                    gradient.angle
                  }deg, ${gradient.colors.join(", ")})`,
                }}
                title={gradient.name}
              />
            </Button>
          ))}
        </div>
      </div>

      {/* 渐变类型 */}
      <div className="space-y-2">
        <Label>{data.gradientType}</Label>
        <Select
          value={gradientType}
          onValueChange={(value: "linear" | "radial") => setGradientType(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">{data.linearGradient}</SelectItem>
            <SelectItem value="radial">{data.radialGradient}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 多颜色选择 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>
            {data.gradientColors.replace("{colors}", colors.length.toString())}
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={addColor}
            disabled={colors.length >= 7}
          >
            <Plus className="h-4 w-4 mr-1" />
            {data.addColor}
          </Button>
        </div>

        <div className="space-y-3">
          {colors.map((color, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="color"
                value={color}
                onChange={(e) => updateColor(index, e.target.value)}
                className="w-9 h-9 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => updateColor(index, e.target.value)}
                className="flex-1"
              />
              {colors.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeColor(index)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 角度控制 */}
      {gradientType === "linear" && (
        <div className="space-y-2">
          <Label>
            {data.gradientAngle.replace("{angle}", angle.toString())}
          </Label>
          <Slider
            value={[angle]}
            onValueChange={(value) => setAngle(value[0])}
            min={0}
            max={360}
            step={1}
          />
        </div>
      )}
    </div>
  );
};
