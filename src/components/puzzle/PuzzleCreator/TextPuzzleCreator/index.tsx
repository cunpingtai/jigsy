import { FC, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 预设字体
const fonts = [
  { name: "默认", value: "sans-serif" },
  { name: "优雅", value: "serif" },
  { name: "等宽", value: "monospace" },
  { name: "手写", value: "cursive" },
  { name: "艺术", value: "fantasy" },
];

export const TextPuzzleCreator: FC = () => {
  const [text, setText] = useState("输入文字");
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [textColor, setTextColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textRotation, setTextRotation] = useState(0);

  return (
    <div className="space-y-6">
      {/* 文字预览 */}
      <div
        className="h-40 rounded-lg shadow-inner flex items-center justify-center"
        style={{ backgroundColor }}
      >
        <div
          style={{
            color: textColor,
            fontSize: `${fontSize}px`,
            fontFamily,
            transform: `rotate(${textRotation}deg)`,
            transition: "all 0.3s ease",
            maxWidth: "90%",
            textAlign: "center",
            wordBreak: "break-word",
          }}
        >
          {text}
        </div>
      </div>

      {/* 文字输入 */}
      <div className="space-y-2">
        <Label>文字内容</Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入要显示的文字"
          className="min-h-[100px]"
        />
      </div>

      {/* 字体选择 */}
      <div className="space-y-2">
        <Label>字体</Label>
        <Select value={fontFamily} onValueChange={setFontFamily}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fonts.map((font) => (
              <SelectItem
                key={font.value}
                value={font.value}
                style={{ fontFamily: font.value }}
              >
                {font.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 字体大小 */}
      <div className="space-y-2">
        <Label>字体大小: {fontSize}px</Label>
        <Slider
          value={[fontSize]}
          onValueChange={(value) => setFontSize(value[0])}
          min={20}
          max={100}
          step={2}
        />
      </div>

      {/* 颜色设置 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>文字颜色</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-9 h-9 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
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

      {/* 文字旋转 */}
      <div className="space-y-2">
        <Label>旋转角度: {textRotation}°</Label>
        <Slider
          value={[textRotation]}
          onValueChange={(value) => setTextRotation(value[0])}
          min={0}
          max={360}
          step={15}
        />
      </div>
    </div>
  );
};
