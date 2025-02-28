import { FC, useState, useEffect } from "react";
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
import * as client from "@/services/client";
import { Category, Tag } from "@/services/types";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export type PuzzleMeta = {
  title: string;
  description: string;
  difficulty: string;
  pieces: number;
  categoryId?: number;
  groupId?: number;
  tags: number[];
} & Omit<PuzzleConfigType, "image">;

interface PuzzleSettingsProps {
  config: PuzzleMeta;
  onChange: (meta: PuzzleMeta) => void;
}

const piecesOptions = new Array(70).fill(0).map((_, i) => {
  const value = i + 2;
  const label = `${value * value} 片 (${value}×${value})`;
  return {
    value,
    label,
  };
});

export const PuzzleSettings: FC<PuzzleSettingsProps> = ({
  config,
  onChange,
}) => {
  const [customSize, setCustomSize] = useState(false);
  const [customPieces, setCustomPieces] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState({
    categories: false,
    groups: false,
    tags: false,
  });

  // 加载分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading((prev) => ({ ...prev, categories: true }));
      try {
        const response = await client.categoryService.getCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error("获取分类列表错误:", err);
      } finally {
        setLoading((prev) => ({ ...prev, categories: false }));
      }
    };

    fetchCategories();
  }, []);

  // 根据选择的分类加载分组
  useEffect(() => {
    const fetchGroups = async () => {
      if (!config.categoryId) return;

      setLoading((prev) => ({ ...prev, groups: true }));
      try {
        const response = await client.groupService.getGroupsByCategory(
          config.categoryId
        );
        setGroups(response.data || []);
      } catch (err) {
        console.error("获取分组列表错误:", err);
      } finally {
        setLoading((prev) => ({ ...prev, groups: false }));
      }
    };

    fetchGroups();
  }, [config.categoryId]);

  // 加载标签列表
  useEffect(() => {
    const fetchTags = async () => {
      setLoading((prev) => ({ ...prev, tags: true }));
      try {
        const response = await client.tagService.getTags();
        setTags(response || []);
      } catch (err) {
        console.error("获取标签列表错误:", err);
      } finally {
        setLoading((prev) => ({ ...prev, tags: false }));
      }
    };

    fetchTags();
  }, []);

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

  const handleCategoryChange = (categoryId: string) => {
    onChange({
      ...config,
      categoryId: parseInt(categoryId),
      groupId: undefined,
    });
  };

  const handleGroupChange = (groupId: string) => {
    handleChange("groupId", parseInt(groupId));
  };

  const handleTagSelect = (tag: Tag) => {
    if (selectedTags.length >= 5) return;
    if (selectedTags.some((t) => t.id === tag.id)) return;

    const newTags = [...selectedTags, tag];
    setSelectedTags(newTags);
    handleChange(
      "tags",
      newTags.map((t) => t.id)
    );
    setTagInput("");
  };

  const handleTagRemove = (tagId: number) => {
    const newTags = selectedTags.filter((t) => t.id !== tagId);
    setSelectedTags(newTags);
    handleChange(
      "tags",
      newTags.map((t) => t.id)
    );
  };

  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
      !selectedTags.some((t) => t.id === tag.id)
  );

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
        <Label>拼图分类</Label>
        <div className="flex items-center gap-2">
          <Select
            value={config.categoryId?.toString()}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              {loading.categories ? (
                <SelectItem value="loading" disabled>
                  加载中...
                </SelectItem>
              ) : (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>拼图分组</Label>
        <div className="flex items-center gap-2">
          <Select
            value={config.groupId?.toString()}
            onValueChange={handleGroupChange}
            disabled={!config.categoryId}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={config.categoryId ? "选择分组" : "请先选择分类"}
              />
            </SelectTrigger>
            <SelectContent>
              {loading.groups ? (
                <SelectItem value="loading" disabled>
                  加载中...
                </SelectItem>
              ) : (
                groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>拼图标签</Label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag.name}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleTagRemove(tag.id)}
                />
              </Badge>
            ))}
          </div>
          <div className="relative">
            <Input
              placeholder="搜索标签"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              disabled={selectedTags.length >= 5}
            />
            {tagInput && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md max-h-[200px] overflow-y-auto">
                {filteredTags.length > 0 ? (
                  filteredTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="px-3 py-2 hover:bg-accent cursor-pointer"
                      onClick={() => handleTagSelect(tag)}
                    >
                      {tag.name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-muted-foreground">
                    无匹配标签
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">最多添加 5 个标签</p>
        </div>
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
    </div>
  );
};
