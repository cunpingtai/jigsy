import { FC } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pause,
  Play,
  TimerReset,
  Grid3X3,
  Image as ImageIcon,
  Settings2,
  Move,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/[locale]/providers";

interface GameToolbarProps {
  isPaused: boolean;
  enablePanning?: boolean; // 添加拖动模式状态
  showGrid?: boolean;
  showPreview?: boolean;
  onPauseToggle: () => void;
  onReset: () => void;
  onPreviewToggle: () => void;
  onGridToggle: () => void;
  onSettingsOpen: () => void;
  onEnablePanningToggle?: () => void; // 添加拖动模式切换处理函数
}

export const GameToolbar: FC<GameToolbarProps> = ({
  isPaused,
  showPreview,
  showGrid,
  onPauseToggle,
  enablePanning = false,
  onEnablePanningToggle,
  onReset,
  onPreviewToggle,
  onGridToggle,
  onSettingsOpen,
}) => {
  const { data } = useI18n();
  const tools = [
    {
      icon: isPaused ? Play : Pause,
      label: isPaused ? data.continue : data.pause,
      onClick: onPauseToggle,
      className: isPaused ? "!bg-accent text-accent-foreground" : "",
    },
    {
      icon: TimerReset,
      label: data.reset2,
      onClick: onReset,
    },
    null, // 分隔线
    {
      icon: ImageIcon,
      label: data.preview,
      onClick: onPreviewToggle,
      className: showPreview ? "!bg-accent text-accent-foreground" : "",
    },
    {
      icon: Grid3X3,
      label: data.grid,
      onClick: onGridToggle,
      className: showGrid ? "!bg-accent text-accent-foreground" : "",
    },
    {
      icon: Move,
      label: enablePanning ? data.freePanning : data.panning,
      onClick: onEnablePanningToggle,
      className: enablePanning ? "!bg-accent text-accent-foreground" : "",
    },
    null, // 分隔线
    {
      icon: Settings2,
      label: data.settings,
      onClick: onSettingsOpen,
    },
  ];

  return (
    <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-4">
      <TooltipProvider>
        {tools.map((tool, index) =>
          tool === null ? (
            <div key={index} className="h-px w-8 bg-border my-2" />
          ) : (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-muted-foreground hover:text-accent-foreground hover:bg-accent/50",
                    tool.className
                  )}
                  onClick={tool.onClick}
                >
                  <tool.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          )
        )}
      </TooltipProvider>
    </div>
  );
};
