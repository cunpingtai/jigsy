"use client";
import { FC, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImagePuzzleCreator } from "./ImagePuzzleCreator";
import { SolidColorPuzzleCreator } from "./SolidColorPuzzleCreator";
import { GradientPuzzleCreator } from "./GradientPuzzleCreator";
import { EmojiPuzzleCreator } from "./EmojiPuzzleCreator";
import { TextPuzzleCreator } from "./TextPuzzleCreator";
import { SymbolPuzzleCreator } from "./SymbolPuzzleCreator";
import { PuzzlePreview } from "./PuzzlePreview";
import { PuzzleMeta, PuzzleSettings } from "./PuzzleSettings";
import {
  Image as ImageIcon,
  Palette,
  PaintRoller,
  Smile,
  Type,
  Hash,
} from "lucide-react";
import { DistributionStrategy } from "../PuzzleGenerator/types";

type PuzzleType = "image" | "solid" | "gradient" | "emoji" | "text" | "symbol";

const tabs = [
  {
    id: "image" as PuzzleType,
    label: "图片拼图",
    icon: ImageIcon,
  },
  {
    id: "solid" as PuzzleType,
    label: "纯色拼图",
    icon: Palette,
  },
  {
    id: "gradient" as PuzzleType,
    label: "渐变拼图",
    icon: PaintRoller,
  },
  {
    id: "emoji" as PuzzleType,
    label: "Emoji拼图",
    icon: Smile,
  },
  {
    id: "text" as PuzzleType,
    label: "文字拼图",
    icon: Type,
  },
  {
    id: "symbol" as PuzzleType,
    label: "符号拼图",
    icon: Hash,
  },
];

export const PuzzleCreator: FC = () => {
  const [activeTab, setActiveTab] = useState<PuzzleType>("image");
  const [image, setImage] = useState<string | null>();
  const [config, setConfig] = useState<PuzzleMeta>({
    tilesX: 2,
    tilesY: 2,
    width: 0,
    height: 0,
    distributionStrategy: DistributionStrategy.SURROUNDING,
    seed: 2048,
    tabSize: 20,
    jitter: 4,
    showGrid: true,
    showPreview: false,
    zoomStep: 0.1,
    minZoom: 0.5,
    maxZoom: 2,
    lineColor: "#000000",
    lineWidth: 2,
    title: "",
    description: "",
    difficulty: "",
    pieces: 4,
  });

  const difficulty = useMemo(() => {
    // 根据拼图数量和类型计算难度
    const puzzleTypeComplexity = {
      image: 1, // 普通图片
      solid: 1.5, // 纯色背景更难
      gradient: 1.3, // 渐变背景
      emoji: 0.9, // Emoji相对简单
      text: 1.1, // 文字
      symbol: 1.2, // 符号
    };

    const complexityFactor = puzzleTypeComplexity[activeTab];
    const effectivePieces = config.pieces * complexityFactor;

    if (effectivePieces <= 50) return "easy";
    if (effectivePieces <= 200) return "medium";
    if (effectivePieces <= 1000) return "hard";
    return "expert";
  }, [config.pieces, activeTab]);

  const difficultyLabel = useMemo(() => {
    return difficulty === "easy"
      ? "简单"
      : difficulty === "medium"
      ? "中等"
      : difficulty === "hard"
      ? "困难"
      : "专家";
  }, [difficulty]);

  const useTime = useMemo(() => {
    // 使用经验公式计算预计完成时间
    const puzzleTypeComplexity = {
      image: 1.1, // 普通图片
      solid: 1.2, // 纯色背景更难
      gradient: 1.15, // 渐变背景
      emoji: 1.05, // Emoji相对简单
      text: 1.1, // 文字
      symbol: 1.15, // 符号
    };

    // 难度影响指数 b
    const b = puzzleTypeComplexity[activeTab];

    // 经验相关系数 k (假设中级玩家)
    const k = 0.04;

    // 根据拼图数量使用不同的计算公式
    let timeInMinutes;

    if (config.pieces < 10) {
      // 少于10片：基础时间 + 每片增加时间
      timeInMinutes = Math.max(1, 0.5 + 0.1 * config.pieces);
    } else if (config.pieces <= 100) {
      // 10-100片：线性增长
      timeInMinutes = 0.1 * config.pieces + 1;
    } else if (config.pieces <= 300) {
      // 100-300片
      timeInMinutes = 0.2 * config.pieces + 1;
    } else if (config.pieces <= 500) {
      // 300-500片
      timeInMinutes = 0.4 * config.pieces + 1;
    } else if (config.pieces <= 1000) {
      // 500-1000片
      timeInMinutes = 0.7 * config.pieces + 1;
    } else {
      // 1000片以上
      timeInMinutes = 0.9 * config.pieces + 1;
    }

    // 四舍五入到整数分钟
    return Math.round(timeInMinutes);
  }, [config.pieces, activeTab]);

  const handleImageUpload = (image?: string | null) => {
    setImage(image);
  };

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：创建器 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as PuzzleType)}
              >
                <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex flex-col items-center gap-1 py-2"
                    >
                      <tab.icon className="h-5 w-5" />
                      <span className="text-xs">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="image">
                    <ImagePuzzleCreator onImageUpload={handleImageUpload} />
                  </TabsContent>
                  <TabsContent value="solid">
                    <SolidColorPuzzleCreator />
                  </TabsContent>
                  <TabsContent value="gradient">
                    <GradientPuzzleCreator />
                  </TabsContent>
                  <TabsContent value="emoji">
                    <EmojiPuzzleCreator />
                  </TabsContent>
                  <TabsContent value="text">
                    <TextPuzzleCreator />
                  </TabsContent>
                  <TabsContent value="symbol">
                    <SymbolPuzzleCreator />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <PuzzleSettings config={config} onChange={setConfig} />
            </CardContent>
          </Card>
        </div>

        {/* 右侧：预览和设置 */}
        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="p-6">
              <PuzzlePreview
                config={config}
                type={activeTab}
                image={image}
                useTime={useTime}
                difficulty={difficultyLabel}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
