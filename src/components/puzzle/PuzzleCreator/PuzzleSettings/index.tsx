import { FC, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PuzzleConfigType } from "../../PuzzleGenerator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";

export type PuzzleMeta = {
  title: string;
  description: string;
  difficulty: string;
  pieces: number;
} & Omit<PuzzleConfigType, "image">;

interface PuzzleSettingsProps {
  config: PuzzleMeta;
  onChange: (meta: PuzzleMeta) => void;
}

const piecesOptions = [
  { value: 4, label: "4 片 (2×2)" },
  { value: 9, label: "9 片 (3×3)" },
  { value: 16, label: "16 片 (4×4)" },
  { value: 36, label: "36 片 (6×6)" },
  { value: 64, label: "64 片 (8×8)" },
  { value: 100, label: "100 片 (10×10)" },
  { value: 256, label: "256 片 (16×16)" },
  { value: 1024, label: "1024 片 (32×32)" },
  { value: 4096, label: "4096 片 (64×64)" },
];

export const PuzzleSettings: FC<PuzzleSettingsProps> = ({
  config,
  onChange,
}) => {
  const [customSize, setCustomSize] = useState(false);
  const [customPieces, setCustomPieces] = useState(false);
  const handleChange = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const calculateTiles = (pieces: number) => {
    const side = Math.sqrt(pieces);
    return { tilesX: side, tilesY: side };
  };

  const handlePiecesChange = (value: string) => {
    const pieces = parseInt(value);
    const { tilesX, tilesY } = calculateTiles(pieces);
    onChange({
      ...config,
      pieces,
      tilesX,
      tilesY,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">拼图设置</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">拼图标题</Label>
        <Input
          id="title"
          value={config.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="给你的拼图起个名字"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">拼图描述</Label>
        <Textarea
          id="description"
          value={config.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="添加一些描述信息"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label>拼图数量</Label>
          <div className="flex items-center justify-between gap-2">
            <Label className="whitespace-nowrap">自定义拼图网格</Label>
            <Switch checked={customPieces} onCheckedChange={setCustomPieces} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {customPieces ? null : (
            <Select
              value={config.pieces?.toString() || "16"}
              onValueChange={handlePiecesChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {piecesOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {customPieces && (
            <div className="flex items-center w-full gap-2">
              <Input
                type="number"
                value={Math.sqrt(config.pieces || 16)}
                min={2}
                max={90}
                onChange={(e) => {
                  handlePiecesChange(
                    `${Number(e.target.value) * Number(e.target.value)}`
                  );
                }}
              />
              <span>x</span>
              <Input
                type="number"
                value={Math.sqrt(config.pieces || 16)}
                min={2}
                max={90}
                onChange={(e) => {
                  handlePiecesChange(
                    `${Number(e.target.value) * Number(e.target.value)}`
                  );
                }}
              />
              <span>=</span>
              <span className="whitespace-nowrap">{config.pieces} 片</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">拼图数量越多，难度越大</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>自定义拼图尺寸</Label>
          <Switch checked={customSize} onCheckedChange={setCustomSize} />
        </div>

        {customSize && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">宽度 (像素)</Label>
              <Input
                id="width"
                type="number"
                min={200}
                max={4096}
                value={config.width || ""}
                onChange={(e) =>
                  handleChange("width", parseInt(e.target.value) || 0)
                }
                placeholder="自动"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">高度 (像素)</Label>
              <Input
                id="height"
                type="number"
                min={200}
                max={4096}
                value={config.height || ""}
                onChange={(e) =>
                  handleChange("height", parseInt(e.target.value) || 0)
                }
                placeholder="自动"
              />
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground">不设置时将使用原图尺寸</p>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">拼图样式</Label>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>拼图边缘大小</Label>
            <span className="text-sm">{config.tabSize || 20}</span>
          </div>
          <Slider
            value={[config.tabSize || 20]}
            min={10}
            max={40}
            step={1}
            onValueChange={(value) => handleChange("tabSize", value[0])}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>拼图边缘随机度</Label>
            <span className="text-sm">{config.jitter || 4}</span>
          </div>
          <Slider
            value={[config.jitter || 4]}
            min={0}
            max={10}
            step={1}
            onValueChange={(value) => handleChange("jitter", value[0])}
          />
        </div>

        <div className="space-y-2">
          <Label>拼图线条颜色</Label>
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <div
                  className="w-8 h-8 rounded border shadow-sm"
                  style={{ backgroundColor: config.lineColor || "#000000" }}
                />
                <Input
                  value={config.lineColor || "#000000"}
                  onChange={(e) => handleChange("lineColor", e.target.value)}
                  className="w-28"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <HexColorPicker
                color={config.lineColor || "#000000"}
                onChange={(color) => handleChange("lineColor", color)}
                className="!w-full"
              />
              <div className="grid grid-cols-6 gap-1 mt-3">
                {[
                  "#000000",
                  "#FF0000",
                  "#00FF00",
                  "#0000FF",
                  "#FFFF00",
                  "#FF00FF",
                  "#00FFFF",
                  "#FFFFFF",
                  "#888888",
                  "#FF8800",
                  "#FF88FF",
                  "#0FFF00",
                ].map((color) => (
                  <div
                    key={color}
                    className="w-6 h-6 rounded-full border cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => handleChange("lineColor", color)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>拼图线条宽度</Label>
            <span className="text-sm">{config.lineWidth || 2}px</span>
          </div>
          <Slider
            value={[config.lineWidth || 2]}
            min={0}
            max={5}
            step={0.5}
            onValueChange={(value) => handleChange("lineWidth", value[0])}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>拼图标签</Label>
        <Input placeholder="添加标签，用逗号分隔" className="text-sm" />
        <p className="text-xs text-muted-foreground">
          最多添加 5 个标签，每个标签不超过 10 个字符
        </p>
      </div>
    </div>
  );
};
