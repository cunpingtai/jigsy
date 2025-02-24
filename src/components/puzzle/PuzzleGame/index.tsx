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
  Palette,
} from "lucide-react";
import { GameToolbar } from "./GameToolbar";
import { GameStats } from "./GameStats";
import { PuzzlePreview } from "./PuzzlePreview";
import { PuzzleConfigType, PuzzleGenerator } from "../PuzzleGenerator";
import { DistributionStrategy } from "../PuzzleGenerator/types";
import { PuzzleGameRef } from "../PuzzleGenerator/PuzzleGame";
import { cn } from "@/lib/utils";
import { TextureSelector } from "../TextureSelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const puzzleGameRef = useRef<PuzzleGameRef>(null);
  const [showTextureDialog, setShowTextureDialog] = useState(false);
  const [selectedTexture, setSelectedTexture] = useState("bg-primary/50");
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(true);
  const timerRef = useRef<NodeJS.Timeout>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    pieces: puzzle.pieces,
    distribution: DistributionStrategy.SURROUNDING,
  });

  const piecesOptions = [
    { value: 12, label: "新手 (12片)" },
    { value: 24, label: "入门 (24片)" },
    { value: 48, label: "简单 (48片)" },
    { value: 96, label: "普通 (96片)" },
    { value: 144, label: "进阶 (144片)" },
    { value: 288, label: "困难 (288片)" },
    { value: 432, label: "挑战 (432片)" },
    { value: 576, label: "专家 (576片)" },
    { value: 720, label: "大师 (720片)" },
    { value: 864, label: "精英 (864片)" },
    { value: 1008, label: "王者 (1008片)" },
    { value: 1152, label: "传说 (1152片)" },
    { value: 1296, label: "史诗 (1296片)" },
    { value: 1440, label: "神话 (1440片)" },
    { value: 1584, label: "天神 (1584片)" },
    { value: 1728, label: "至尊 (1728片)" },
    { value: 1872, label: "终极 (1872片)" },
  ];

  const distributionOptions = [
    {
      value: DistributionStrategy.SURROUNDING,
      label: "环绕模式",
      description: "拼图块围绕在画布四周",
    },
    {
      value: DistributionStrategy.CENTER_SCATTER,
      label: "中心扩散",
      description: "拼图块从中心向外散开分布",
    },
    {
      value: DistributionStrategy.SPREAD_OUT,
      label: "均匀分散",
      description: "拼图块均匀分布在整个画布上",
    },
  ];

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

  useEffect(() => {
    if (isGameStarted && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isGameStarted, isPaused]);

  const handleStartGame = () => {
    setShowStartDialog(false);
    setIsGameStarted(true);
  };

  const handleSettingsConfirm = () => {
    setConfig((prev) => ({
      ...prev,
      tilesX: Math.floor(Math.sqrt(tempSettings.pieces)),
      tilesY: Math.floor(Math.sqrt(tempSettings.pieces)),
      distributionStrategy: tempSettings.distribution,
    }));

    setIsGameStarted(false);
    setShowStartDialog(true);
    setTimeElapsed(0);
    setPiecesPlaced(0);
    setZoomLevel(100);
    setFixCenter(0);
    setShowSettingsDialog(false);
  };

  const handleSettingsOpen = () => {
    setShowSettingsDialog(true);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <GameToolbar
        showPreview={showPreview}
        showGrid={showGrid}
        enablePanning={enablePanning}
        onEnablePanningToggle={() => setEnablePanning(!enablePanning)}
        isPaused={isPaused || !isGameStarted}
        onPauseToggle={() => {
          setIsPaused(!isPaused);
          setIsGameStarted(true);
        }}
        onReset={() => {
          setIsGameStarted(false);
          setShowStartDialog(true);
          setTimeElapsed(0);
          setPiecesPlaced(0);
          setZoomLevel(100);
          setFixCenter(0);
        }}
        onPreviewToggle={() => setShowPreview(!showPreview)}
        onGridToggle={() => setShowGrid(!showGrid)}
        onSettingsOpen={handleSettingsOpen}
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => setShowTextureDialog(true)}
            >
              <Palette className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-background relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn("w-full h-full relative", selectedTexture)}>
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

      <Dialog open={showTextureDialog} onOpenChange={setShowTextureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>选择背景纹理</DialogTitle>
          </DialogHeader>
          <TextureSelector
            selectedTexture={selectedTexture}
            onSelect={(texture) => {
              setSelectedTexture(texture);
              setShowTextureDialog(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>准备开始</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <Image
              src={puzzle.image}
              alt={puzzle.title}
              className="w-full h-48 object-contain rounded-lg"
              width={600}
              height={400}
            />
            <div className="text-center">
              <h3 className="font-semibold">{puzzle.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                难度: {puzzle.difficulty} | 拼图数量: {puzzle.pieces}片
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <Button onClick={handleStartGame}>开始游戏</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>游戏设置</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">拼图数量</label>
              <Select
                value={tempSettings.pieces.toString()}
                onValueChange={(value) =>
                  setTempSettings((prev) => ({
                    ...prev,
                    pieces: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择拼图数量" />
                </SelectTrigger>
                <SelectContent>
                  {piecesOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">分布策略</label>
              <Select
                value={tempSettings.distribution}
                onValueChange={(value: DistributionStrategy) =>
                  setTempSettings((prev) => ({ ...prev, distribution: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择分布策略" />
                </SelectTrigger>
                <SelectContent>
                  {distributionOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="flex flex-col items-start py-2"
                    >
                      <div>{option.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(false)}
            >
              取消
            </Button>
            <Button onClick={handleSettingsConfirm}>确定并重新开始</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
