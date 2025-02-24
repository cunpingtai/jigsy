"use client";
import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { PuzzleGrid } from "../PuzzleGrid";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus, History } from "lucide-react";
import { useInView } from "react-intersection-observer";

// 分类数据
const categories = [
  { id: "all", name: "全部" },
  { id: "nature", name: "自然风光" },
  { id: "animals", name: "萌宠动物" },
  { id: "art", name: "艺术创作" },
  { id: "anime", name: "动漫" },
  { id: "city", name: "城市风光" },
  { id: "food", name: "美食" },
  { id: "sports", name: "体育" },
  { id: "travel", name: "旅行" },
  { id: "fashion", name: "时尚" },
  { id: "music", name: "音乐" },
  { id: "technology", name: "科技" },
  { id: "history", name: "历史" },
  { id: "science", name: "科学" },
  { id: "health", name: "健康" },
  { id: "education", name: "教育" },
  { id: "environment", name: "环境" },
  { id: "other", name: "其他" },
];

// 子分类数据
const subCategories: Record<string, string[]> = {
  nature: [
    "山水",
    "海洋",
    "森林",
    "花卉",
    "星空",
    "动物",
    "植物",
    "自然",
    "风景",
    "建筑",
    "街道",
    "天空",
    "山脉",
    "河流",
    "湖泊",
    "沙漠",
    "极光",
    "星空",
    "自然风光",
  ],
  animals: ["猫咪", "狗狗", "野生动物"],
  art: ["油画", "水彩", "插画"],
  anime: ["人物", "场景", "萌系"],
  city: ["城市风光", "建筑", "街道"],
  food: ["美食", "烹饪", "食材"],
  sports: ["体育", "运动", "健身"],
  travel: ["旅行", "探险", "户外"],
  fashion: ["时尚", "穿搭", "美容"],
  music: ["音乐", "乐器", "演唱会"],
  technology: ["科技", "互联网", "人工智能"],
  history: ["历史", "文化", "考古"],
  science: ["科学", "自然", "宇宙"],
  health: ["健康", "健身", "养生"],
  education: ["教育", "学习", "培训"],
  environment: ["环境", "环保", "气候"],
  other: ["其他", "未知", "未分类"],
};

export const PuzzleExplorer: FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const { ref, inView } = useInView();

  const handleLoadMore = () => {
    // 实现加载更多逻辑
    console.log("Loading more puzzles...");
  };

  return (
    <div className="space-y-4">
      {/* 功能按钮行 */}
      <div className="flex gap-4 pb-4 border-b">
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          创建拼图
        </Button>
        <Button variant="outline" className="gap-2">
          <History className="w-4 h-4" />
          创建记录
        </Button>
      </div>

      {/* 分类选项卡 */}
      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="w-full flex-wrap flex"
      >
        <TabsList className="w-full justify-start">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* 子分类选项卡 - 仅在选择特定分类时显示 */}
      {selectedCategory !== "all" && subCategories[selectedCategory] && (
        <Tabs
          value={selectedSubCategory}
          onValueChange={setSelectedSubCategory}
          className="w-full"
        >
          <TabsList className="w-full justify-start">
            {subCategories[selectedCategory].map((subCategory) => (
              <TabsTrigger key={subCategory} value={subCategory}>
                {subCategory}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* 拼图网格区域 */}
      <ScrollArea className="h-[calc(100vh-300px)]">
        <PuzzleGrid />

        {/* 加载更多触发器 */}
        <div ref={ref} className="w-full py-8 flex justify-center">
          {inView && (
            <Button
              variant="ghost"
              onClick={handleLoadMore}
              className="animate-pulse"
            >
              加载更多...
            </Button>
          )}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};
