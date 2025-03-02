import { FC, useState, useRef, useEffect, useCallback } from "react";
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
import { debounce } from "lodash";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n } from "@/app/[locale]/providers";

type TextPuzzleCreatorMeta = {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  alignment?: "left" | "center" | "right";
  bold?: boolean;
  italic?: boolean;
  textMode?: "normal" | "random" | "tiled";
  repeat?: number;
  randomRotation?: boolean;
  randomSize?: boolean;
  randomColor?: boolean;
  colorVariation?: number;
};

type TextPuzzleCreatorProps = {
  onGenerate?: (image: string, meta: TextPuzzleCreatorMeta) => void;
  width?: number;
  height?: number;
  meta?: TextPuzzleCreatorMeta;
};

export const TextPuzzleCreator: FC<TextPuzzleCreatorProps> = ({
  width,
  height,
  onGenerate,
  meta,
}) => {
  const { data } = useI18n();

  const [text, setText] = useState(meta?.text || data.textPlaceholder);
  const [fontSize, setFontSize] = useState(meta?.fontSize || 120);
  const [fontFamily, setFontFamily] = useState(
    meta?.fontFamily || "sans-serif"
  );
  const [textColor, setTextColor] = useState(meta?.textColor || "#000000");
  const [backgroundColor, setBackgroundColor] = useState(
    meta?.backgroundColor || "#ffffff"
  );
  const [alignment, setAlignment] = useState<"left" | "center" | "right">(
    meta?.alignment || "center"
  );
  const [bold, setBold] = useState(meta?.bold || false);
  const [italic, setItalic] = useState(meta?.italic || false);
  const [textMode, setTextMode] = useState<"normal" | "random" | "tiled">(
    meta?.textMode || "normal"
  );
  const [repeat, setRepeat] = useState(meta?.repeat || 1);
  const [randomRotation, setRandomRotation] = useState(
    meta?.randomRotation || false
  );
  const [randomSize, setRandomSize] = useState(meta?.randomSize || false);
  const [randomColor, setRandomColor] = useState(meta?.randomColor || false);
  const [colorVariation, setColorVariation] = useState(
    meta?.colorVariation || 30
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const update = useCallback(
    debounce((canvas: HTMLCanvasElement, meta: TextPuzzleCreatorMeta) => {
      onGenerate?.(canvas.toDataURL("image/png"), meta);
    }, 300),
    [onGenerate]
  );

  // 生成随机颜色变化
  const getRandomColorVariation = (baseColor: string, variation: number) => {
    // 将十六进制颜色转换为RGB
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    // 添加随机变化
    const newR = Math.max(
      0,
      Math.min(255, r + (Math.random() * variation * 2 - variation))
    );
    const newG = Math.max(
      0,
      Math.min(255, g + (Math.random() * variation * 2 - variation))
    );
    const newB = Math.max(
      0,
      Math.min(255, b + (Math.random() * variation * 2 - variation))
    );

    // 转回十六进制
    return `#${Math.round(newR).toString(16).padStart(2, "0")}${Math.round(newG)
      .toString(16)
      .padStart(2, "0")}${Math.round(newB).toString(16).padStart(2, "0")}`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置canvas尺寸
    canvas.width = width || 1024;
    canvas.height = height || 1024;

    // 绘制背景
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 根据文本模式绘制
    if (textMode === "normal") {
      // 标准文本模式
      // 设置文字样式
      const fontStyle = `${italic ? "italic " : ""}${
        bold ? "bold " : ""
      }${fontSize}px ${fontFamily}`;
      ctx.font = fontStyle;
      ctx.fillStyle = textColor;
      ctx.textAlign = alignment;

      // 文本换行处理
      const words = text.split(" ");
      const lines = [];
      let currentLine = words[0];

      const maxWidth = canvas.width - 100; // 留出边距
      const lineHeight = fontSize * 1.2;

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + " " + words[i];
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      // 计算文本总高度
      const totalTextHeight = lines.length * lineHeight;

      // 计算起始Y坐标，使文本垂直居中
      let y = (canvas.height - totalTextHeight) / 2 + fontSize;

      // 绘制文本
      for (let i = 0; i < lines.length; i++) {
        let x;
        if (alignment === "left") {
          x = 50;
        } else if (alignment === "right") {
          x = canvas.width - 50;
        } else {
          x = canvas.width / 2;
        }

        ctx.fillText(lines[i], x, y);
        y += lineHeight;
      }
    } else if (textMode === "random") {
      // 随机字符模式
      const chars = text.split("");

      // 计算每个字符的基础大小
      const baseFontSize =
        fontSize * (repeat > 5 ? 0.7 : repeat > 2 ? 0.85 : 1);

      // 为每个字符绘制多次
      for (let r = 0; r < repeat; r++) {
        for (let i = 0; i < chars.length; i++) {
          if (chars[i] === " ") continue; // 跳过空格

          ctx.save();

          // 随机位置，但确保在画布内
          const currentFontSize = randomSize
            ? baseFontSize * (0.7 + Math.random() * 0.6)
            : baseFontSize;

          const margin = currentFontSize;
          const x = margin + Math.random() * (canvas.width - 2 * margin);
          const y = margin + Math.random() * (canvas.height - 2 * margin);

          // 随机旋转
          if (randomRotation) {
            ctx.translate(x, y);
            ctx.rotate(Math.random() * Math.PI * 2);
            ctx.translate(-x, -y);
          }

          // 设置字体
          const fontStyle = `${italic ? "italic " : ""}${
            bold ? "bold " : ""
          }${currentFontSize}px ${fontFamily}`;
          ctx.font = fontStyle;

          // 随机颜色变化
          ctx.fillStyle = randomColor
            ? getRandomColorVariation(textColor, colorVariation)
            : textColor;

          // 绘制字符
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(chars[i], x, y);

          ctx.restore();
        }
      }
    } else if (textMode === "tiled") {
      // 平铺文本模式
      const chars = text.split("");
      if (chars.length === 0) return;

      // 计算网格
      const gridSize = Math.ceil(Math.sqrt(repeat));
      const cellWidth = canvas.width / gridSize;
      const cellHeight = canvas.height / gridSize;

      // 计算字体大小，确保适合单元格
      const tileFontSize = Math.min(cellWidth, cellHeight) * 0.7;

      // 设置字体
      const fontStyle = `${italic ? "italic " : ""}${
        bold ? "bold " : ""
      }${tileFontSize}px ${fontFamily}`;

      let count = 0;
      for (let row = 0; row < gridSize && count < repeat; row++) {
        for (let col = 0; col < gridSize && count < repeat; col++) {
          const charIndex = count % chars.length;
          if (chars[charIndex] === " ") {
            count++;
            continue; // 跳过空格
          }

          ctx.save();

          // 计算位置
          const x = col * cellWidth + cellWidth / 2;
          const y = row * cellHeight + cellHeight / 2;

          // 随机旋转
          if (randomRotation) {
            ctx.translate(x, y);
            ctx.rotate(Math.random() * Math.PI * 2);
            ctx.translate(-x, -y);
          }

          // 设置字体
          ctx.font = fontStyle;

          // 随机颜色变化
          ctx.fillStyle = randomColor
            ? getRandomColorVariation(textColor, colorVariation)
            : textColor;

          // 绘制字符
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(chars[charIndex], x, y);

          ctx.restore();
          count++;
        }
      }
    }

    update(canvas, {
      text,
      fontSize,
      fontFamily,
      textColor,
      backgroundColor,
      alignment,
      bold,
      italic,
      textMode,
      repeat,
      randomRotation,
      randomSize,
      randomColor,
      colorVariation,
    });
  }, [
    width,
    height,
    text,
    fontSize,
    fontFamily,
    textColor,
    backgroundColor,
    alignment,
    bold,
    italic,
    textMode,
    repeat,
    randomRotation,
    randomSize,
    randomColor,
    colorVariation,
    update,
  ]);

  return (
    <div className="space-y-6">
      {/* 文字预览 */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="rounded-lg shadow-inner"
          style={{
            width: "200px",
            height: "200px",
            display: "block",
          }}
        />
      </div>

      {/* 文字输入 */}
      <div className="space-y-2">
        <Label>{data.text}</Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[100px]"
          placeholder={data.textPlaceholder}
        />
      </div>

      {/* 文字模式 */}
      <div className="space-y-2">
        <Label>{data.textMode}</Label>
        <Select
          value={textMode}
          onValueChange={(value: "normal" | "random" | "tiled") =>
            setTextMode(value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">{data.normal}</SelectItem>
            <SelectItem value="random">{data.randomText}</SelectItem>
            <SelectItem value="tiled">{data.tiledText}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 重复次数 - 仅在随机或平铺模式下显示 */}
      {textMode !== "normal" && (
        <div className="space-y-2">
          <Label>{data.textRepeat.replace("{value}", repeat.toString())}</Label>
          <Slider
            value={[repeat]}
            onValueChange={(value) => setRepeat(value[0])}
            min={1}
            max={textMode === "tiled" ? 100 : 50}
            step={1}
          />
        </div>
      )}

      {/* 随机选项 - 仅在随机或平铺模式下显示 */}
      {textMode !== "normal" && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="randomRotation"
              checked={randomRotation}
              onCheckedChange={(checked) => setRandomRotation(checked === true)}
            />
            <Label htmlFor="randomRotation">{data.randomRotation}</Label>
          </div>

          {textMode === "random" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="randomSize"
                checked={randomSize}
                onCheckedChange={(checked) => setRandomSize(checked === true)}
              />
              <Label htmlFor="randomSize">{data.randomSize}</Label>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="randomColor"
              checked={randomColor}
              onCheckedChange={(checked) => setRandomColor(checked === true)}
            />
            <Label htmlFor="randomColor">{data.randomColor}</Label>
          </div>

          {randomColor && (
            <div className="space-y-2">
              <Label>
                {data.colorVariation.replace(
                  "{value}",
                  colorVariation.toString()
                )}
              </Label>
              <Slider
                value={[colorVariation]}
                onValueChange={(value) => setColorVariation(value[0])}
                min={5}
                max={100}
                step={1}
              />
            </div>
          )}
        </div>
      )}

      {/* 字体设置 */}
      <div className="space-y-2">
        <Label>{data.font}</Label>
        <Select value={fontFamily} onValueChange={setFontFamily}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sans-serif">{data.sansSerif}</SelectItem>
            <SelectItem value="serif">{data.serif}</SelectItem>
            <SelectItem value="monospace">{data.monospace}</SelectItem>
            <SelectItem value="cursive">{data.cursive}</SelectItem>
            <SelectItem value="fantasy">{data.fantasy}</SelectItem>
            <SelectItem value="'Microsoft YaHei', sans-serif">
              {data.microsoftYaHei}
            </SelectItem>
            <SelectItem value="'SimSun', serif">{data.simSun}</SelectItem>
            <SelectItem value="'KaiTi', serif">{data.kaiTi}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 字体大小 */}
      <div className="space-y-2">
        <Label>{data.fontSize.replace("{value}", fontSize.toString())}</Label>
        <Slider
          value={[fontSize]}
          onValueChange={(value) => setFontSize(value[0])}
          min={20}
          max={120}
          step={1}
        />
      </div>

      {/* 文字对齐 - 仅在标准模式下显示 */}
      {textMode === "normal" && (
        <div className="space-y-2">
          <Label>{data.alignment}</Label>
          <Select
            value={alignment}
            onValueChange={(value: "left" | "center" | "right") =>
              setAlignment(value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">{data.left}</SelectItem>
              <SelectItem value="center">{data.center}</SelectItem>
              <SelectItem value="right">{data.right}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 文字样式 */}
      <div className="flex gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="bold"
            checked={bold}
            onCheckedChange={(checked) => setBold(checked === true)}
          />
          <Label htmlFor="bold">{data.bold}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="italic"
            checked={italic}
            onCheckedChange={(checked) => setItalic(checked === true)}
          />
          <Label htmlFor="italic">{data.italic}</Label>
        </div>
      </div>

      {/* 颜色设置 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{data.textColor}</Label>
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
          <Label>{data.backgroundColor}</Label>
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
    </div>
  );
};
