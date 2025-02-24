import { FC, useState } from "react";
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
  // ... 更多预设
];

export const GradientPuzzleCreator: FC = () => {
  const [selectedGradient, setSelectedGradient] = useState(presetGradients[0]);
  const [startColor, setStartColor] = useState(selectedGradient.colors[0]);
  const [endColor, setEndColor] = useState(selectedGradient.colors[1]);
  const [angle, setAngle] = useState(selectedGradient.angle);
  const [gradientType, setGradientType] = useState<"linear" | "radial">(
    "linear"
  );

  const gradientStyle = {
    background:
      gradientType === "linear"
        ? `linear-gradient(${angle}deg, ${startColor}, ${endColor})`
        : `radial-gradient(circle, ${startColor}, ${endColor})`,
  };

  return (
    <div className="space-y-6">
      {/* 渐变预览 */}
      <div className="h-40 rounded-lg shadow-inner" style={gradientStyle} />

      {/* 预设渐变 */}
      <div className="space-y-2">
        <Label>预设渐变</Label>
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
                setStartColor(gradient.colors[0]);
                setEndColor(gradient.colors[1]);
                setAngle(gradient.angle);
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(${gradient.angle}deg, ${gradient.colors[0]}, ${gradient.colors[1]})`,
                }}
                title={gradient.name}
              />
            </Button>
          ))}
        </div>
      </div>

      {/* 渐变类型 */}
      <div className="space-y-2">
        <Label>渐变类型</Label>
        <Select
          value={gradientType}
          onValueChange={(value: "linear" | "radial") => setGradientType(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">线性渐变</SelectItem>
            <SelectItem value="radial">径向渐变</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 颜色选择 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>起始颜色</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={startColor}
              onChange={(e) => setStartColor(e.target.value)}
              className="w-9 h-9 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={startColor}
              onChange={(e) => setStartColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>结束颜色</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={endColor}
              onChange={(e) => setEndColor(e.target.value)}
              className="w-9 h-9 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={endColor}
              onChange={(e) => setEndColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* 角度控制 */}
      {gradientType === "linear" && (
        <div className="space-y-2">
          <Label>渐变角度: {angle}°</Label>
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
