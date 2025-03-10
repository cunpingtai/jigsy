import { FC, useState, useEffect, useCallback, useMemo } from "react";
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
import { ZodFormattedError } from "zod";
import { useI18n } from "@/app/[locale]/providers";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryModal } from "./CategoryModal";
import { GroupModal } from "./GroupModal";
import { TagModal } from "./TagModal";

export type PuzzleMeta = {
  title: string;
  description: string;
  difficulty: string;
  pieces: number;
  categoryId?: number;
  groupId?: number;
  tags: Tag[];
} & Omit<PuzzleConfigType, "image">;

interface PuzzleSettingsProps {
  config: PuzzleMeta;
  onChange: (meta: PuzzleMeta) => void;
  error?: ZodFormattedError<PuzzleMeta> | null;
  locale: string;
  isAdmin: boolean;
}

export const PuzzleSettings: FC<PuzzleSettingsProps> = ({
  isAdmin,
  locale,
  error,
  config,
  onChange,
}) => {
  const { data } = useI18n();
  const piecesOptions = useMemo(
    () => [
      {
        value: 4,
        label: data.piecesOptionLabel
          .replace("{value}", "4")
          .replace("{tilesX}", "2")
          .replace("{tilesY}", "2"),
      },
      {
        value: 9,
        label: data.piecesOptionLabel
          .replace("{value}", "9")
          .replace("{tilesX}", "3")
          .replace("{tilesY}", "3"),
      },
      {
        value: 16,
        label: data.piecesOptionLabel
          .replace("{value}", "16")
          .replace("{tilesX}", "4")
          .replace("{tilesY}", "4"),
      },
      {
        value: 25,
        label: data.piecesOptionLabel
          .replace("{value}", "25")
          .replace("{tilesX}", "5")
          .replace("{tilesY}", "5"),
      },
      {
        value: 36,
        label: data.piecesOptionLabel
          .replace("{value}", "36")
          .replace("{tilesX}", "6")
          .replace("{tilesY}", "6"),
      },
      {
        value: 49,
        label: data.piecesOptionLabel
          .replace("{value}", "49")
          .replace("{tilesX}", "7")
          .replace("{tilesY}", "7"),
      },
      {
        value: 64,
        label: data.piecesOptionLabel
          .replace("{value}", "64")
          .replace("{tilesX}", "8")
          .replace("{tilesY}", "8"),
      },
      {
        value: 81,
        label: data.piecesOptionLabel
          .replace("{value}", "81")
          .replace("{tilesX}", "9")
          .replace("{tilesY}", "9"),
      },
      {
        value: 100,
        label: data.piecesOptionLabel
          .replace("{value}", "100")
          .replace("{tilesX}", "10")
          .replace("{tilesY}", "10"),
      },
      {
        value: 121,
        label: data.piecesOptionLabel
          .replace("{value}", "121")
          .replace("{tilesX}", "11")
          .replace("{tilesY}", "11"),
      },
      {
        value: 144,
        label: data.piecesOptionLabel
          .replace("{value}", "144")
          .replace("{tilesX}", "12")
          .replace("{tilesY}", "12"),
      },
      {
        value: 169,
        label: data.piecesOptionLabel
          .replace("{value}", "169")
          .replace("{tilesX}", "13")
          .replace("{tilesY}", "13"),
      },
      {
        value: 196,
        label: data.piecesOptionLabel
          .replace("{value}", "196")
          .replace("{tilesX}", "14")
          .replace("{tilesY}", "14"),
      },
      {
        value: 225,
        label: data.piecesOptionLabel
          .replace("{value}", "225")
          .replace("{tilesX}", "15")
          .replace("{tilesY}", "15"),
      },
      {
        value: 256,
        label: data.piecesOptionLabel
          .replace("{value}", "256")
          .replace("{tilesX}", "16")
          .replace("{tilesY}", "16"),
      },
      {
        value: 289,
        label: data.piecesOptionLabel
          .replace("{value}", "289")
          .replace("{tilesX}", "17")
          .replace("{tilesY}", "17"),
      },
      {
        value: 324,
        label: data.piecesOptionLabel
          .replace("{value}", "324")
          .replace("{tilesX}", "18")
          .replace("{tilesY}", "18"),
      },
      {
        value: 361,
        label: data.piecesOptionLabel
          .replace("{value}", "361")
          .replace("{tilesX}", "19")
          .replace("{tilesY}", "19"),
      },
      {
        value: 400,
        label: data.piecesOptionLabel
          .replace("{value}", "400")
          .replace("{tilesX}", "20")
          .replace("{tilesY}", "20"),
      },
      {
        value: 441,
        label: data.piecesOptionLabel
          .replace("{value}", "441")
          .replace("{tilesX}", "21")
          .replace("{tilesY}", "21"),
      },
      {
        value: 484,
        label: data.piecesOptionLabel
          .replace("{value}", "484")
          .replace("{tilesX}", "22")
          .replace("{tilesY}", "22"),
      },
      {
        value: 529,
        label: data.piecesOptionLabel
          .replace("{value}", "529")
          .replace("{tilesX}", "23")
          .replace("{tilesY}", "23"),
      },
      {
        value: 576,
        label: data.piecesOptionLabel
          .replace("{value}", "576")
          .replace("{tilesX}", "24")
          .replace("{tilesY}", "24"),
      },
      {
        value: 625,
        label: data.piecesOptionLabel
          .replace("{value}", "625")
          .replace("{tilesX}", "25")
          .replace("{tilesY}", "25"),
      },
      {
        value: 676,
        label: data.piecesOptionLabel
          .replace("{value}", "676")
          .replace("{tilesX}", "26")
          .replace("{tilesY}", "26"),
      },
      {
        value: 729,
        label: data.piecesOptionLabel
          .replace("{value}", "729")
          .replace("{tilesX}", "27")
          .replace("{tilesY}", "27"),
      },
      {
        value: 784,
        label: data.piecesOptionLabel
          .replace("{value}", "784")
          .replace("{tilesX}", "28")
          .replace("{tilesY}", "28"),
      },
      {
        value: 841,
        label: data.piecesOptionLabel
          .replace("{value}", "841")
          .replace("{tilesX}", "29")
          .replace("{tilesY}", "29"),
      },
      {
        value: 900,
        label: data.piecesOptionLabel
          .replace("{value}", "900")
          .replace("{tilesX}", "30")
          .replace("{tilesY}", "30"),
      },
    ],
    [data]
  );

  const [customSize, setCustomSize] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(config.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState({
    categories: false,
    groups: false,
    tags: false,
  });
  const [modals, setModals] = useState({
    category: false,
    group: false,
    tag: false,
  });

  // 加载分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading((prev) => ({ ...prev, categories: true }));
      try {
        const response = await client.categoryService.getCategories({
          language: locale,
        });
        setCategories(response.data || []);
      } catch (err) {
        console.error("获取分类列表错误:", err);
      } finally {
        setLoading((prev) => ({ ...prev, categories: false }));
      }
    };

    fetchCategories();
  }, [locale]);

  // 根据选择的分类加载分组
  useEffect(() => {
    const fetchGroups = async () => {
      if (!config.categoryId) return;

      setLoading((prev) => ({ ...prev, groups: true }));
      try {
        const response = await client.groupService.getGroupsByCategory(
          config.categoryId,
          {
            language: locale,
          }
        );
        setGroups(response.data || []);
      } catch (err) {
        console.error("获取分组列表错误:", err);
      } finally {
        setLoading((prev) => ({ ...prev, groups: false }));
      }
    };

    fetchGroups();
  }, [config.categoryId, locale]);

  // 加载标签列表
  useEffect(() => {
    const fetchTags = async () => {
      setLoading((prev) => ({ ...prev, tags: true }));
      try {
        const response = await client.tagService.getTags({
          language: locale,
        });
        setTags(response?.slice(0, 20) || []);
      } catch (err) {
        console.error("获取标签列表错误:", err);
      } finally {
        setLoading((prev) => ({ ...prev, tags: false }));
      }
    };

    fetchTags();
  }, [locale]);

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
    const existingTag = selectedTags.find((t) => t.id === tag.id);
    if (existingTag) {
      handleTagRemove(existingTag.id);
      return;
    }

    if (selectedTags.length >= 5) return;
    if (selectedTags.some((t) => t.id === tag.id)) return;

    const newTags = [...selectedTags, tag];
    setSelectedTags(newTags);
    handleChange("tags", newTags);
    setTagInput("");
  };

  const handleTagRemove = (tagId: number) => {
    const newTags = selectedTags.filter((t) => t.id !== tagId);
    setSelectedTags(newTags);
    handleChange("tags", newTags);
  };

  const searchTags = useCallback(
    async (tag: string) => {
      if (tag.trim()) {
        setLoading((prev) => ({ ...prev, tags: true }));
        try {
          const response = await client.tagService.searchTags(tag, {
            language: locale,
          });
          setTags((response || []).slice(0, 20));
        } catch (err) {
          console.error("搜索标签错误:", err);
        } finally {
          setLoading((prev) => ({ ...prev, tags: false }));
        }
      } else {
        // 当输入为空时，获取默认标签列表
        const fetchDefaultTags = async () => {
          setLoading((prev) => ({ ...prev, tags: true }));
          try {
            const response = await client.tagService.getTags({
              language: locale,
            });
            setTags((response || []).slice(0, 20));
          } catch (err) {
            console.error("获取标签列表错误:", err);
          } finally {
            setLoading((prev) => ({ ...prev, tags: false }));
          }
        };
        fetchDefaultTags();
      }
    },
    [locale]
  );

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchTags(tagInput);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTags, tagInput]);

  // 处理新创建的分类
  const handleCategoryCreated = (newCategory: Category) => {
    setCategories([...categories, newCategory]);
    handleCategoryChange(newCategory.id.toString());
    setModals((prev) => ({ ...prev, category: false }));
  };

  // 处理新创建的分组
  const handleGroupCreated = (newGroup: any) => {
    setGroups([...groups, newGroup]);
    handleGroupChange(newGroup.id.toString());
    setModals((prev) => ({ ...prev, group: false }));
  };

  // 处理新创建的标签
  const handleTagCreated = (newTag: Tag) => {
    setTags([...tags, newTag]);
    handleTagSelect(newTag);
    setModals((prev) => ({ ...prev, tag: false }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">{data.puzzleSettings}</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">{data.puzzleTitle}</Label>
        <Input
          id="title"
          value={config.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder={data.puzzleTitlePlaceholder}
        />
        {error?.title && (
          <p className="text-red-500 text-sm">{error.title._errors[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{data.puzzleDescription}</Label>
        <Textarea
          id="description"
          value={config.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder={data.puzzleDescriptionPlaceholder}
          className="min-h-[100px]"
        />
        {error?.description && (
          <p className="text-red-500 text-sm">{error.description._errors[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{data.puzzleCategory}</Label>
        <div className="flex items-center gap-2">
          <Select
            value={config.categoryId?.toString()}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={data.selectCategory} />
            </SelectTrigger>
            <SelectContent>
              {loading.categories ? (
                <SelectItem value="loading" disabled>
                  {data.loading}
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
          {isAdmin ? (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setModals((prev) => ({ ...prev, category: true }))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        {error?.categoryId && (
          <p className="text-red-500 text-sm">{error.categoryId._errors[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{data.puzzleGroup}</Label>
        <div className="flex items-center gap-2">
          <Select
            value={config.groupId?.toString()}
            onValueChange={handleGroupChange}
            disabled={!config.categoryId}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  config.categoryId
                    ? data.selectGroup
                    : data.pleaseSelectCategory
                }
              />
            </SelectTrigger>
            <SelectContent>
              {loading.groups ? (
                <SelectItem value="loading" disabled>
                  {data.loading}
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
          {config.categoryId && isAdmin ? (
            <Button
              variant="outline"
              size="icon"
              disabled={!config.categoryId}
              onClick={() => setModals((prev) => ({ ...prev, group: true }))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        {error?.groupId && (
          <p className="text-red-500 text-sm">{error.groupId._errors[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{data.puzzleTags}</Label>
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
          <div className="relative flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder={data.searchTags}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                disabled={selectedTags.length >= 5}
              />
              <div className="flex gap-2 space-x-2 p-2">
                {loading.tags ? (
                  <div className="px-3 py-2 text-muted-foreground">
                    {data.loading}
                  </div>
                ) : (
                  tags.map((tag) => (
                    <div
                      key={tag.id}
                      className={`px-3 rounded-sm py-2 hover:bg-accent cursor-pointer text-sm ${
                        selectedTags.some((t) => t.id === tag.id)
                          ? "bg-accent/50"
                          : ""
                      }`}
                      onClick={() => handleTagSelect(tag)}
                    >
                      {tag.name}
                      {selectedTags.some((t) => t.id === tag.id) && (
                        <span className="ml-2 text-primary">✓</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            {isAdmin ? (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setModals((prev) => ({ ...prev, tag: true }))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">{data.maxAddTags}</p>
        </div>
        {error?.tags && (
          <p className="text-red-500 text-sm">{error.tags._errors[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label>{data.puzzlePieces}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={config.pieces?.toString() || "16"}
            onValueChange={handlePiecesChange}
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
        <p className="text-xs text-muted-foreground">
          {data.puzzlePiecesMoreDifficult}
        </p>
        {error?.tilesX && (
          <p className="text-red-500 text-sm">{error.tilesX._errors[0]}</p>
        )}
        {error?.tilesY && (
          <p className="text-red-500 text-sm">{error.tilesY._errors[0]}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{data.customPuzzleSize}</Label>
          <Switch
            checked={customSize}
            onCheckedChange={() => {
              const newCustomSize = !customSize;
              setCustomSize(newCustomSize);
              if (!newCustomSize) {
                handleChange("width", 0);
                handleChange("height", 0);
              }
            }}
          />
        </div>

        {customSize && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">{data.puzzleWidth}</Label>
              <Input
                id="width"
                type="number"
                min={200}
                max={4096}
                value={config.width || ""}
                onChange={(e) =>
                  handleChange("width", parseInt(e.target.value) || 0)
                }
                placeholder={data.puzzleWidthPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">{data.puzzleHeight}</Label>
              <Input
                id="height"
                type="number"
                min={200}
                max={4096}
                value={config.height || ""}
                onChange={(e) =>
                  handleChange("height", parseInt(e.target.value) || 0)
                }
                placeholder={data.puzzleHeightPlaceholder}
              />
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground">{data.puzzleSizeNotSet}</p>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">{data.puzzleStyle}</Label>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>{data.puzzleEdgeSize}</Label>
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
            <Label>{data.puzzleEdgeRandomness}</Label>
            <span className="text-sm">{config.jitter || 4}</span>
          </div>
          <Slider
            value={[config.jitter || 4]}
            min={0}
            max={50}
            step={1}
            onValueChange={(value) => handleChange("jitter", value[0])}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>{data.puzzleSeed}</Label>
            <span className="text-sm">{config.seed || 0}</span>
          </div>
          <Slider
            value={[config.seed || 0]}
            min={0}
            max={1000000}
            step={1}
            onValueChange={(value) => handleChange("seed", value[0])}
          />
        </div>

        <div className="space-y-2">
          <Label>{data.puzzleLineColor}</Label>
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
            <Label>{data.puzzleLineWidth}</Label>
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

      {/* 模态框组件 */}
      <CategoryModal
        open={modals.category}
        onClose={() => setModals((prev) => ({ ...prev, category: false }))}
        onCreated={handleCategoryCreated}
        locale={locale}
      />

      {config.categoryId ? (
        <GroupModal
          open={modals.group}
          onClose={() => setModals((prev) => ({ ...prev, group: false }))}
          onCreated={handleGroupCreated}
          categoryId={config.categoryId}
          categories={categories}
          locale={locale}
        />
      ) : null}

      <TagModal
        open={modals.tag}
        onClose={() => setModals((prev) => ({ ...prev, tag: false }))}
        onCreated={handleTagCreated}
        locale={locale}
      />
    </div>
  );
};
