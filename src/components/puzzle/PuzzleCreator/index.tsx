import { FC, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImagePuzzleCreator } from "./ImagePuzzleCreator";
import { SolidColorPuzzleCreator } from "./SolidColorPuzzleCreator";
import { GradientPuzzleCreator } from "./GradientPuzzleCreator";
import { EmojiPuzzleCreator } from "./EmojiPuzzleCreator";
import { TextPuzzleCreator } from "./TextPuzzleCreator";
import { SymbolPuzzleCreator } from "./SymbolPuzzleCreator";
import { PuzzlePreview } from "./PuzzlePreview";
import { PuzzleSettings } from "./PuzzleSettings";
import {
  Image as ImageIcon,
  Palette,
  PaintRoller,
  Smile,
  Type,
  Hash,
} from "lucide-react";

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
  const [puzzleConfig, setPuzzleConfig] = useState({
    title: "",
    description: "",
    difficulty: "medium",
    pieces: 100,
  });

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
                    <ImagePuzzleCreator />
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
        </div>

        {/* 右侧：预览和设置 */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <PuzzlePreview type={activeTab} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <PuzzleSettings
                config={puzzleConfig}
                onChange={setPuzzleConfig}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
