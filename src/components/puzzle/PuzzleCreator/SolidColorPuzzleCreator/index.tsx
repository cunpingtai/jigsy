import { FC, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// 预设颜色方案
const presetColors = [
  { name: "薄荷绿", value: "#4ade80" },
  { name: "天空蓝", value: "#60a5fa" },
  { name: "淡紫色", value: "#a78bfa" },
  { name: "珊瑚粉", value: "#fb7185" },
  { name: "金盏花", value: "#fbbf24" },
  { name: "薰衣草", value: "#a855f7" },
  { name: "蒂芙尼蓝", value: "#2dd4bf" },
  { name: "玫瑰红", value: "#f43f5e" },
  { name: "柠檬黄", value: "#facc15" },
  { name: "海洋蓝", value: "#0ea5e9" },
  { name: "石墨黑", value: "#334155" },
  { name: "珍珠白", value: "#f8fafc" },
];

export const SolidColorPuzzleCreator: FC = () => {
  const [selectedColor, setSelectedColor] = useState(presetColors[0].value);
  const [customColor, setCustomColor] = useState("");

  return (
    <div className="space-y-6">
      {/* 颜色预览 */}
      <div
        className="h-40 rounded-lg shadow-inner"
        style={{ backgroundColor: selectedColor }}
      />

      {/* 预设颜色选择 */}
      <div className="space-y-2">
        <Label>预设颜色</Label>
        <div className="grid grid-cols-6 gap-2">
          {presetColors.map((color) => (
            <Button
              key={color.value}
              variant="outline"
              className={cn(
                "w-full h-12 rounded-lg p-0 overflow-hidden",
                selectedColor === color.value && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedColor(color.value)}
            >
              <div
                className="w-full h-full"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            </Button>
          ))}
        </div>
      </div>

      {/* 自定义颜色 */}
      <div className="space-y-2">
        <Label>自定义颜色</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-9 h-9 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            placeholder="#HEX颜色码"
            className="flex-1"
          />
          <Button
            variant="secondary"
            onClick={() => setSelectedColor(customColor)}
          >
            应用
          </Button>
        </div>
      </div>
    </div>
  );
};
