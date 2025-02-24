import { FC, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// 预设符号分类
const symbolCategories = {
  math: {
    name: "数学",
    symbols: ["π", "∑", "∞", "±", "÷", "×", "√", "∫", "≈", "≠"],
  },
  arrows: {
    name: "箭头",
    symbols: ["←", "→", "↑", "↓", "↔", "↕", "⇒", "⇐", "⇔", "⇌"],
  },
  shapes: {
    name: "形状",
    symbols: ["♠", "♥", "♦", "♣", "★", "☆", "○", "□", "△", "◇"],
  },
  music: {
    name: "音乐",
    symbols: ["♩", "♪", "♫", "♬", "♭", "♮", "♯", "𝄞", "𝄢", "𝄪"],
  },
  special: {
    name: "特殊",
    symbols: ["©", "®", "™", "§", "¶", "†", "‡", "¥", "€", "$"],
  },
  zodiac: {
    name: "星座",
    symbols: ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑"],
  },
};

export const SymbolPuzzleCreator: FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("π");
  const [selectedCategory, setSelectedCategory] = useState("math");
  const [symbolSize, setSymbolSize] = useState(100);
  const [symbolRotation, setSymbolRotation] = useState(0);
  const [symbolColor, setSymbolColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [symbolStyle, setSymbolStyle] = useState("normal");

  const styles = [
    { name: "普通", value: "normal" },
    { name: "粗体", value: "bold" },
    { name: "斜体", value: "italic" },
    { name: "粗斜体", value: "bold italic" },
  ];

  return (
    <div className="space-y-6">
      {/* 符号预览 */}
      <div
        className="h-40 rounded-lg shadow-inner flex items-center justify-center"
        style={{ backgroundColor }}
      >
        <div
          style={{
            color: symbolColor,
            fontSize: `${symbolSize}px`,
            transform: `rotate(${symbolRotation}deg)`,
            fontStyle: symbolStyle.includes("italic") ? "italic" : "normal",
            fontWeight: symbolStyle.includes("bold") ? "bold" : "normal",
            transition: "all 0.3s ease",
          }}
        >
          {selectedSymbol}
        </div>
      </div>

      {/* 符号分类选择 */}
      <div className="space-y-2">
        <Label>选择分类</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(symbolCategories).map(([key, category]) => (
              <SelectItem key={key} value={key}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 符号选择器 */}
      <div className="space-y-2">
        <Label>选择符号</Label>
        <div className="grid grid-cols-10 gap-2">
          {symbolCategories[
            selectedCategory as keyof typeof symbolCategories
          ].symbols.map((symbol) => (
            <Button
              key={symbol}
              variant="outline"
              className={cn(
                "w-10 h-10 p-0 text-xl",
                selectedSymbol === symbol && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedSymbol(symbol)}
            >
              {symbol}
            </Button>
          ))}
        </div>
      </div>

      {/* 符号样式 */}
      <div className="space-y-2">
        <Label>符号样式</Label>
        <Select value={symbolStyle} onValueChange={setSymbolStyle}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {styles.map((style) => (
              <SelectItem
                key={style.value}
                value={style.value}
                style={{
                  fontStyle: style.value.includes("italic")
                    ? "italic"
                    : "normal",
                  fontWeight: style.value.includes("bold") ? "bold" : "normal",
                }}
              >
                {style.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 颜色设置 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>符号颜色</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={symbolColor}
              onChange={(e) => setSymbolColor(e.target.value)}
              className="w-9 h-9 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={symbolColor}
              onChange={(e) => setSymbolColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>背景颜色</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-9 h-9 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* 大小控制 */}
      <div className="space-y-2">
        <Label>符号大小: {symbolSize}px</Label>
        <Slider
          value={[symbolSize]}
          onValueChange={(value) => setSymbolSize(value[0])}
          min={50}
          max={200}
          step={10}
        />
      </div>

      {/* 旋转控制 */}
      <div className="space-y-2">
        <Label>旋转角度: {symbolRotation}°</Label>
        <Slider
          value={[symbolRotation]}
          onValueChange={(value) => setSymbolRotation(value[0])}
          min={0}
          max={360}
          step={15}
        />
      </div>
    </div>
  );
};
