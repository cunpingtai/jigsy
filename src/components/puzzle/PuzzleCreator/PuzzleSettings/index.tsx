import { FC } from "react";
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

interface PuzzleConfig {
  title: string;
  description: string;
  difficulty: string;
  pieces: number;
}

interface PuzzleSettingsProps {
  config: PuzzleConfig;
  onChange: (config: PuzzleConfig) => void;
}

const difficulties = [
  { value: "easy", label: "简单" },
  { value: "medium", label: "中等" },
  { value: "hard", label: "困难" },
  { value: "expert", label: "专家" },
];

const piecesOptions = [
  { value: 24, label: "24 片 (6×4)" },
  { value: 48, label: "48 片 (8×6)" },
  { value: 96, label: "96 片 (12×8)" },
  { value: 192, label: "192 片 (16×12)" },
  { value: 300, label: "300 片 (20×15)" },
];

export const PuzzleSettings: FC<PuzzleSettingsProps> = ({
  config,
  onChange,
}) => {
  const handleChange = (key: keyof PuzzleConfig, value: string | number) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">拼图设置</Label>
      </div>

      {/* 标题设置 */}
      <div className="space-y-2">
        <Label htmlFor="title">拼图标题</Label>
        <Input
          id="title"
          value={config.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="给你的拼图起个名字"
        />
      </div>

      {/* 描述设置 */}
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

      {/* 难度设置 */}
      <div className="space-y-2">
        <Label>难度等级</Label>
        <Select
          value={config.difficulty}
          onValueChange={(value) => handleChange("difficulty", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {difficulties.map((difficulty) => (
              <SelectItem key={difficulty.value} value={difficulty.value}>
                {difficulty.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 碎片数量设置 */}
      <div className="space-y-2">
        <Label>碎片数量</Label>
        <Select
          value={config.pieces.toString()}
          onValueChange={(value) => handleChange("pieces", parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {piecesOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 标签设置 */}
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
