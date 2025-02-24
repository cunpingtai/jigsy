import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ZoomIn,
  ZoomOut,
  ArrowLeftToLine,
  Grid2X2Check,
  Crosshair,
  Check,
  PictureInPicture2,
} from "lucide-react";
import { GameToolbar } from "./GameToolbar";
import { GameStats } from "./GameStats";
import { PuzzlePreview } from "./PuzzlePreview";
import { PuzzleConfigType, PuzzleGenerator } from "../PuzzleGenerator";
import { DistributionStrategy } from "../PuzzleGenerator/types";
import { PuzzleGameRef } from "../PuzzleGenerator/PuzzleGame";
import { cn } from "@/lib/utils";

interface PuzzleGameProps {
  puzzle: {
    id: number;
    title: string;
    image: string;
    pieces: number;
    difficulty: string;
  };
}

export const PuzzleGame: FC<PuzzleGameProps> = ({ puzzle }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [piecesPlaced, setPiecesPlaced] = useState(0);
  const [enablePanning, setEnablePanning] = useState(false);
  const [fixCenter, setFixCenter] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const puzzleGameRef = useRef<PuzzleGameRef>(null);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoomLevel(Math.floor(newZoom * 100));
  }, []);

  const handlePanChange = useCallback((x: number, y: number) => {
    console.log(x, y);
  }, []);

  const [config, setConfig] = useState<Omit<PuzzleConfigType, "image">>({
    tilesX: 10,
    tilesY: 10,
    width: 600,
    height: 600,
    distributionStrategy: DistributionStrategy.SURROUNDING,
    seed: 2048,
    tabSize: 20,
    jitter: 4,
    showGrid: false,
    showPreview: false,
    zoomStep: 0.1,
    minZoom: 0.5,
    maxZoom: 2,
  });

  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      showGrid: showGrid,
      showPreview: showPreview,
    }));
  }, [showGrid, showPreview]);

  return (
    <div className="flex h-screen overflow-hidden">
      <GameToolbar
        showPreview={showPreview}
        showGrid={showGrid}
        showHint={showHint}
        enablePanning={enablePanning}
        onEnablePanningToggle={() => setEnablePanning(!enablePanning)}
        isPaused={isPaused}
        onPauseToggle={() => setIsPaused(!isPaused)}
        onReset={() => {
          /* 实现重置逻辑 */
        }}
        onPreviewToggle={() => setShowPreview(!showPreview)}
        onGridToggle={() => setShowGrid(!showGrid)}
        onHintToggle={() => setShowHint(!showHint)}
        onSettingsOpen={() => {
          /* 实现设置打开逻辑 */
        }}
      />

      <div className="flex-1 flex flex-col">
        <div className="h-12 bg-card border-b border-border flex items-center px-4 justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-primary"
            >
              <ArrowLeftToLine className="h-4 w-4" />
              退出游戏
            </Button>
            <span className="text-muted-foreground">|</span>
            <GameStats
              timeElapsed={timeElapsed}
              piecesPlaced={piecesPlaced}
              totalPieces={puzzle.pieces}
              bestTime={3600} // 示例最佳时间
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 text-muted-foreground hover:text-primary",
                  showThumbnail && "!bg-accent text-accent-foreground"
                )}
                onClick={() => setShowThumbnail(!showThumbnail)}
              >
                <PictureInPicture2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => {
                  setFixCenter(Date.now());
                  setZoomLevel(100);
                }}
              >
                <Crosshair className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Slider
                value={[zoomLevel]}
                onValueChange={(value) => setZoomLevel(value[0])}
                min={50}
                max={200}
                step={10}
                className="w-32"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground w-12">
                {zoomLevel}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-background relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-card/50 relative">
              <PuzzleGenerator
                {...config}
                ref={puzzleGameRef}
                zoom={zoomLevel / 100}
                onZoomChange={handleZoomChange}
                imageUrl={puzzle.image}
                fixCenter={fixCenter}
                onPanChange={handlePanChange}
                enablePanning={enablePanning}
              />
            </div>
          </div>

          {showThumbnail && (
            <PuzzlePreview
              image={puzzle.image}
              title={puzzle.title}
              onClose={() => setShowThumbnail(false)}
            />
          )}
        </div>

        <div className="h-12 bg-card border-t border-border flex items-center px-4 justify-between">
          <div className="flex items-center gap-2 justify-center w-full">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                puzzleGameRef.current?.handleValidate();
              }}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              验证拼图
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFixCenter(Date.now());
                setZoomLevel(100);
                puzzleGameRef.current?.handleAutoComplete();
              }}
              className="gap-2"
            >
              <Grid2X2Check className="h-4 w-4" />
              自动排列
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
