import { FC } from "react";
import { cn } from "@/lib/utils";

interface PuzzleLoadingProps {
  className?: string;
}

export const PuzzleLoading: FC<PuzzleLoadingProps> = ({ className }) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className={cn(
          "relative w-full aspect-square max-w-md mx-auto",
          className
        )}
      >
        {/* 拼图背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg animate-pulse" />

        {/* 拼图块动画 */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 p-2">
          {/* 左上拼图块 */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 rounded-tl-lg animate-fade-slide-top-left" />
          </div>

          {/* 右上拼图块 */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/0 to-purple-500/0 rounded-tr-lg animate-fade-slide-top-right" />
          </div>

          {/* 左下拼图块 */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/0 to-orange-500/0 rounded-bl-lg animate-fade-slide-bottom-left" />
          </div>

          {/* 右下拼图块 */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tl from-orange-500/0 to-yellow-500/0 rounded-br-lg animate-fade-slide-bottom-right" />
          </div>
        </div>

        {/* 加载文字 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-lg font-medium text-foreground/80 bg-background/50 px-4 py-2 rounded-full backdrop-blur-sm animate-bounce">
            <Spin />
          </div>
        </div>
      </div>
    </div>
  );
};

function Spin() {
  return (
    <div
      className="w-4 h-4 border-2 border-t-2 border-b-2 border-gray-300 rounded-full animate-spin"
      style={{ transform: "rotate(45deg)" }}
    />
  );
}
