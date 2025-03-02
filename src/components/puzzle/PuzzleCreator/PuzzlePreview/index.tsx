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
import { useI18n } from "@/app/[locale]/providers";
interface PuzzlePreviewProps {
  type: "image" | "solid" | "gradient" | "emoji" | "pattern" | "text" | "shape";
  image?: string | null;
  config: Omit<PuzzleConfigType, "image">;
  difficulty: string;
  useTime: string;
}

export const PuzzlePreview: FC<PuzzlePreviewProps> = ({
  type,
  image,
  config,
  difficulty,
  useTime,
}) => {
  const [open, setOpen] = useState(false);

  const { data } = useI18n();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">{data.previewEffect}</Label>
      </div>

      {/* 放大模态框 */}
      {image ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-full max-w-screen-md">
            <DialogTitle className="sr-only">{data.puzzlePreview}</DialogTitle>
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
              <div className="text-sm text-muted-foreground">
                {data.puzzlePreviewArea}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 拼图信息 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{data.puzzleType}</span>
          <span className="font-medium">
            {
              {
                image: data.imagePuzzle,
                solid: data.solidPuzzle,
                gradient: data.gradientPuzzle,
                emoji: data.emojiPuzzle,
                pattern: data.patternPuzzle,
                text: data.textPuzzle,
                shape: data.shapePuzzle,
              }[type]
            }
          </span>
        </div>
        {image ? (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {data.expectedDifficulty}
            </span>
            <span className="font-medium">{difficulty}</span>
          </div>
        ) : null}
        {image ? (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {data.expectedUseTime}
            </span>
            <span className="font-medium">{useTime}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
