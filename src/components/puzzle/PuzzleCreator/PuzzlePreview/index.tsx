/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";
import { Label } from "@/components/ui/label";

interface PuzzlePreviewProps {
  type: "image" | "solid" | "gradient" | "emoji" | "text" | "symbol";
  data?: any; // 后续可以根据具体需求定义更详细的类型
}

export const PuzzlePreview: FC<PuzzlePreviewProps> = ({ type, data }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">预览效果</Label>
      </div>

      {/* 预览区域 */}
      <div className="aspect-video w-full rounded-lg overflow-hidden border border-border">
        <div className="w-full h-full bg-muted relative">
          {/* 网格线 */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="border border-border/20" />
            ))}
          </div>

          {/* 预览内容 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-sm text-muted-foreground">拼图预览区域</div>
          </div>
        </div>
      </div>

      {/* 拼图信息 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">拼图类型</span>
          <span className="font-medium">
            {
              {
                image: "图片拼图",
                solid: "纯色拼图",
                gradient: "渐变拼图",
                emoji: "Emoji拼图",
                text: "文字拼图",
                symbol: "符号拼图",
              }[type]
            }
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">预计难度</span>
          <span className="font-medium">中等</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">预计用时</span>
          <span className="font-medium">约 30 分钟</span>
        </div>
      </div>
    </div>
  );
};
