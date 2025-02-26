import { FC, useState } from "react";
import { Label } from "@/components/ui/label";
import { PreviewPuzzle } from "../../PreviewPuzzle";
import { Button } from "@/components/ui/button";
import { ZoomInIcon } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { PuzzleConfigType } from "../../PuzzleGenerator";
interface PuzzlePreviewProps {
  type: "image" | "solid" | "gradient" | "emoji" | "text" | "symbol";
  image?: string | null;
  config: Omit<PuzzleConfigType, "image">;
  difficulty: string;
  useTime: number;
}

export const PuzzlePreview: FC<PuzzlePreviewProps> = ({
  type,
  image,
  config,
  difficulty,
  useTime,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">预览效果</Label>
      </div>

      {/* 放大模态框 */}
      {image ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-full max-w-screen-md">
            <DialogTitle className="sr-only">拼图预览</DialogTitle>
            <div className="w-full aspect-square overflow-hidden">
              <PreviewPuzzle image={image} config={config} />
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* 预览区域 */}
      {image ? (
        <div className="w-full  aspect-square rounded-lg overflow-hidden border border-border relative">
          <PreviewPuzzle image={image} config={config} />
          {/* 右上角添加放大镜 */}
          <div className="absolute top-2 right-2">
            <Button onClick={() => setOpen(true)} variant="outline">
              <ZoomInIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full aspect-video rounded-lg overflow-hidden border border-border">
          <div className="w-full h-full bg-muted relative">
            {/* 网格线 */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border border-border/20" />
              ))}
            </div>

            {/* 预览内容 */}
            <div className="inset-0 absolute flex items-center justify-center">
              <div className="text-sm text-muted-foreground">拼图预览区域</div>
            </div>
          </div>
        </div>
      )}

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
        {image ? (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">预计难度</span>
            <span className="font-medium">{difficulty}</span>
          </div>
        ) : null}
        {image ? (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">预计用时</span>
            <span className="font-medium">约 {useTime} 分钟</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
