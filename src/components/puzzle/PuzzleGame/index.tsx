"use client";

import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  RefreshCcw,
  Loader2,
} from "lucide-react";
import { GameToolbar } from "./GameToolbar";
import { GameStats } from "./GameStats";
import { PuzzlePreview } from "./PuzzlePreview";
import { PuzzleConfigType, PuzzleGenerator } from "../PuzzleGenerator";
import { DistributionStrategy } from "../PuzzleGenerator/types";
import { PuzzleGameRef } from "../PuzzleGenerator/PuzzleGame";
import * as client from "@/services/client";
import { calculatePuzzleDifficulty, cn, getImageUrl } from "@/lib/utils";
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
import { Atom, AtomGameRecord } from "@/services/types";
import { PuzzleType } from "../PuzzleCreator";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/app/[locale]/providers";
import { Input } from "@/components/ui/input";

interface PuzzleGameProps {
  puzzle: Atom;
  id: number;
  hasUser?: boolean;
  locale: string;
}

export const PuzzleGame: FC<PuzzleGameProps> = ({
  puzzle,
  id,
  hasUser,
  locale,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPaused, setIsPaused] = useState(false);

  const puzzleGameRef = useRef<PuzzleGameRef>(null);
  const [showTextureDialog, setShowTextureDialog] = useState(false);
  const [selectedTexture, setSelectedTexture] = useState("bg-primary/50");
  const [showStartDialog, setShowStartDialog] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [recordId, setRecordId] = useState<number | null>(
    searchParams.get("rid") ? parseInt(searchParams.get("rid")!) : null
  );

  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [enablePanning, setEnablePanning] = useState<boolean>(false);
  const [fixCenter, setFixCenter] = useState<number>(0);

  const addQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(`?${params.toString()}`);
  };

  const [isLoading, setIsLoading] = useState(false);

  const { data } = useI18n();

  const config = useMemo<
    Omit<PuzzleConfigType, "image"> & {
      type: PuzzleType;
    }
  >(() => {
    const config = puzzle.config || {};
    return {
      tilesX: 2,
      tilesY: 2,
      width: 1024,
      height: 1024,
      lineColor: "#000000",
      lineWidth: 2,
      distributionStrategy: DistributionStrategy.SURROUNDING,
      showGrid: false,
      showPreview: false,
      zoomStep: 0.1,
      minZoom: 0.5,
      maxZoom: 2,
      seed: 2048,
      tabSize: 20,
      jitter: 4,
      type: "image",
      ...config,
    };
  }, [puzzle.config]);
  const pieces = config.tilesX * config.tilesY;
  const [tempSettings, setTempSettings] = useState({
    pieces: pieces,
    distribution: config.distributionStrategy,
    lineColor: config.lineColor || "#000000",
    lineWidth: config.lineWidth || 2,
    width: parseInt(config.width.toString()),
    height: parseInt(config.height.toString()),
  });

  const piecesOptions = [
    { value: 4, label: data.pieces.replace("{value}", "4") },
    { value: 9, label: data.pieces.replace("{value}", "9") },
    { value: 16, label: data.pieces.replace("{value}", "16") }, // 4x4
    { value: 25, label: data.pieces.replace("{value}", "25") }, // 5x5
    { value: 36, label: data.pieces.replace("{value}", "36") }, // 6x6
    { value: 49, label: data.pieces.replace("{value}", "49") }, // 7x7
    { value: 64, label: data.pieces.replace("{value}", "64") }, // 8x8
    { value: 81, label: data.pieces.replace("{value}", "81") }, // 9x9
    { value: 100, label: data.pieces.replace("{value}", "100") }, // 10x10
    { value: 121, label: data.pieces.replace("{value}", "121") }, // 11x11
    { value: 144, label: data.pieces.replace("{value}", "144") }, // 12x12
    { value: 169, label: data.pieces.replace("{value}", "169") }, // 13x13
    { value: 196, label: data.pieces.replace("{value}", "196") }, // 14x14
    { value: 225, label: data.pieces.replace("{value}", "225") }, // 15x15
    { value: 256, label: data.pieces.replace("{value}", "256") }, // 16x16
    { value: 289, label: data.pieces.replace("{value}", "289") }, // 17x17
    { value: 324, label: data.pieces.replace("{value}", "324") }, // 18x18
    { value: 361, label: data.pieces.replace("{value}", "361") }, // 19x19
    { value: 400, label: data.pieces.replace("{value}", "400") }, // 20x20
    { value: 441, label: data.pieces.replace("{value}", "441") }, // 21x21
    { value: 484, label: data.pieces.replace("{value}", "484") }, // 22x22
    { value: 529, label: data.pieces.replace("{value}", "529") }, // 23x23
    { value: 576, label: data.pieces.replace("{value}", "576") }, // 24x24
    { value: 625, label: data.pieces.replace("{value}", "625") }, // 25x25
    { value: 676, label: data.pieces.replace("{value}", "676") }, // 26x26
    { value: 729, label: data.pieces.replace("{value}", "729") }, // 27x27
    { value: 784, label: data.pieces.replace("{value}", "784") }, // 28x28
    { value: 841, label: data.pieces.replace("{value}", "841") }, // 29x29
    { value: 900, label: data.pieces.replace("{value}", "900") }, // 30x30
    // { value: 961, label: "神话 (961片)" }, // 31x31
    // { value: 1024, label: "神话 (1024片)" }, // 32x32
    // { value: 1089, label: "神话 (1089片)" }, // 33x33
    // { value: 1156, label: "神话 (1156片)" }, // 34x34
    // { value: 1225, label: "神话 (1225片)" }, // 35x35
    // { value: 1296, label: "神话 (1296片)" }, // 36x36
    // { value: 1369, label: "神话 (1369片)" }, // 37x37
    // { value: 1444, label: "神话 (1444片)" }, // 38x38
    // { value: 1521, label: "神话 (1521片)" }, // 39x39
    // { value: 1600, label: "神话 (1600片)" }, // 40x40
    // { value: 1681, label: "神话 (1681片)" }, // 41x41
    // { value: 1764, label: "神话 (1764片)" }, // 42x42
    // { value: 1849, label: "神话 (1849片)" }, // 43x43
    // { value: 1936, label: "神话 (1936片)" }, // 44x44
    // { value: 2025, label: "神话 (2025片)" }, // 45x45
    // { value: 2116, label: "神话 (2116片)" }, // 46x46
    // { value: 2209, label: "神话 (2209片)" }, // 47x47
    // { value: 2304, label: "神话 (2304片)" }, // 48x48
    // { value: 2401, label: "神话 (2401片)" }, // 49x49
    // { value: 2500, label: "神话 (2500片)" }, // 50x50
  ];

  const distributionOptions = [
    {
      value: DistributionStrategy.SURROUNDING,
      label: data.surrounding,
      description: data.surroundingDescription,
    },
    {
      value: DistributionStrategy.CENTER_SCATTER,
      label: data.centerScatter,
      description: data.centerScatterDescription,
    },
    {
      value: DistributionStrategy.SPREAD_OUT,
      label: data.uniformDistribution,
      description: data.uniformDistributionDescription,
    },
  ];

  const lineColorOptions = [
    { value: "#000000", label: data.black },
    { value: "#FFFFFF", label: data.white },
    { value: "#6b7280", label: data.gray },
    { value: "#3b82f6", label: data.blue },
    { value: "#10b981", label: data.green },
    { value: "#ef4444", label: data.red },
  ];

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoomLevel(Math.floor(newZoom * 100));
  }, []);

  const handlePanChange = useCallback((x: number, y: number) => {
    console.log(x, y);
  }, []);

  const [tempConfig, setTempConfig] =
    useState<Omit<PuzzleConfigType, "image">>(config);

  useEffect(() => {
    setTempConfig((prev) => ({
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

  const handleStartGame = async () => {
    if (!hasUser || recordId) {
      setShowStartDialog(false);
      setIsGameStarted(true);
      return;
    }
    setIsLoading(true);
    client.atomService
      .startAtomGame(id, {
        ...tempSettings,
      })
      .then(({ record }) => {
        addQueryParam("rid", record.id.toString());
        setRecordId(record.id);
        setShowStartDialog(false);
        setIsGameStarted(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSettingsConfirm = () => {
    setIsGameStarted(false);
    setShowStartDialog(false);
    setTimeElapsed(0);
    setZoomLevel(100);
    setFixCenter(0);
    setShowSettingsDialog(false);
    setEnablePanning(false);
    setTempConfig((prev) => ({
      ...prev,
      tilesX: Math.floor(Math.sqrt(tempSettings.pieces)),
      tilesY: Math.floor(Math.sqrt(tempSettings.pieces)),
      distributionStrategy: tempSettings.distribution,
      lineColor: tempSettings.lineColor,
      lineWidth: tempSettings.lineWidth,
      width: tempSettings.width,
      height: tempSettings.height,
    }));
    setRefresh((prev) => prev + 1);
  };

  const imageUrl = useMemo(() => {
    return getImageUrl(puzzle.coverImage);
  }, [puzzle.coverImage]);

  const difficulty = useMemo(() => {
    return calculatePuzzleDifficulty(pieces, config.type, data);
  }, [config.type, pieces, data]);

  const handleSettingsOpen = () => {
    setShowSettingsDialog(true);
  };

  const handleImageLoaded = useCallback(() => {
    setShowStartDialog(true);
  }, []);

  const [record, setRecord] = useState<AtomGameRecord | null>(null);

  useEffect(() => {
    if (recordId) {
      client.atomService.getAtomGameRecord(id, recordId).then((record) => {
        setRecord(record);
      });
    }
  }, [id, recordId]);

  const handleComplete = () => {
    if (!recordId || record?.record.meta?.status === "COMPLETED") {
      return Promise.resolve().then(() => {
        setIsGameStarted(false);
      });
    }
    setIsLoading(true);
    return client.atomService
      .completeAtomGame(id, recordId, {
        ...tempSettings,
        timeElapsed,
        status: "COMPLETED",
      })
      .then(() => {
        setIsGameStarted(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleReset = () => {
    handleComplete().then(() => {
      setIsGameStarted(false);
      setShowStartDialog(true);
      setTimeElapsed(0);
      setZoomLevel(100);
      setFixCenter(0);
      setRefresh((prev) => prev + 1);
    });
  };

  return (
    <div className="flex h-screen overflow-hidden relative" key={refresh}>
      {isLoading && (
        <div className="absolute z-50 inset-0 flex items-center justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
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
        onReset={handleReset}
        onPreviewToggle={() => setShowPreview(!showPreview)}
        onGridToggle={() => setShowGrid(!showGrid)}
        onSettingsOpen={handleSettingsOpen}
      />

      <div className="flex-1 flex flex-col">
        <div className="h-12 bg-card border-b border-border flex items-center px-4 justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                handleComplete().then(() => {
                  router.push(`/${locale}/puzzle/${id}`);
                });
              }}
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-primary"
            >
              <ArrowLeftToLine className="h-4 w-4" />
              {data.exitGame}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-primary"
              onClick={handleReset}
            >
              <RefreshCcw className="h-4 w-4" />
              {data.restartGame}
            </Button>
            <span className="text-muted-foreground">|</span>
            <GameStats
              locale={locale}
              timeElapsed={timeElapsed}
              piecesPlaced={0}
              totalPieces={pieces}
              bestTime={undefined} // 示例最佳时间
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
              <Button
                variant="ghost"
                className="h-8 text-muted-foreground hover:text-primary"
                onClick={() => setZoomLevel(100)}
              >
                {zoomLevel}%
              </Button>
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
                {...tempConfig}
                ref={puzzleGameRef}
                onLoaded={handleImageLoaded}
                zoom={zoomLevel / 100}
                onZoomChange={handleZoomChange}
                imageUrl={imageUrl}
                fixCenter={fixCenter}
                onPanChange={handlePanChange}
                enablePanning={enablePanning}
              />
            </div>
          </div>

          {showThumbnail && (
            <PuzzlePreview
              image={imageUrl}
              title={puzzle.title}
              onClose={() => setShowThumbnail(false)}
            />
          )}
        </div>

        {
          <div className="h-12 bg-card border-t border-border flex items-center px-4 justify-between">
            <div className="flex items-center gap-2 justify-center w-full">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  puzzleGameRef.current?.handleValidate().then((completed) => {
                    if (completed) {
                      handleComplete().then(() => {
                        setFixCenter(Date.now());
                        setZoomLevel(100);
                        toast.success(data.puzzleVerifiedSuccess);
                      });
                    } else {
                      toast.error(data.puzzleVerifiedFailed);
                    }
                  });
                }}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                {data.verifyPuzzle}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleComplete().then(() => {
                    setFixCenter(Date.now());
                    setZoomLevel(100);
                    puzzleGameRef.current?.handleAutoComplete();
                  });
                }}
                className="gap-2"
              >
                <Grid2X2Check className="h-4 w-4" />
                {data.autoArrange}
              </Button>
            </div>
          </div>
        }
      </div>

      <Dialog open={showTextureDialog} onOpenChange={setShowTextureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{data.selectBackgroundTexture}</DialogTitle>
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
            <DialogTitle>{data.readyToStart}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <Image
              src={imageUrl}
              alt={puzzle.title}
              className="w-full h-48 object-contain rounded-lg"
              width={600}
              height={400}
            />
            <div className="text-center">
              <h3 className="font-semibold">{puzzle.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {data.difficultyLabel}: {difficulty} | {data.puzzlePieces}:{" "}
                {tempSettings.pieces} {data.piecesUnit}
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <Button onClick={handleStartGame}>{data.startGame}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{data.gameSettings}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{data.puzzlePieces}</label>
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
                  <SelectValue placeholder={data.selectPuzzlePieces} />
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
              <label className="text-sm font-medium">
                {data.distributionStrategy}
              </label>
              <Select
                value={tempSettings.distribution}
                onValueChange={(value: DistributionStrategy) =>
                  setTempSettings((prev) => ({ ...prev, distribution: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={data.selectDistributionStrategy} />
                </SelectTrigger>
                <SelectContent>
                  {distributionOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="flex flex-col items-start py-2"
                    >
                      <div>{option.label}</div>
                      {/* <div className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </div> */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{data.lineColor}</label>
              <Select
                value={tempSettings.lineColor}
                onValueChange={(value) =>
                  setTempSettings((prev) => ({ ...prev, lineColor: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={data.selectLineColor} />
                </SelectTrigger>
                <SelectContent>
                  {lineColorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: option.value,
                            border: "1px solid #e2e8f0",
                          }}
                        />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {data.lineWidthLabel}
                </label>
                <span className="text-sm text-muted-foreground">
                  {tempSettings.lineWidth}px
                </span>
              </div>
              <Slider
                value={[tempSettings.lineWidth]}
                onValueChange={(value) =>
                  setTempSettings((prev) => ({ ...prev, lineWidth: value[0] }))
                }
                min={0.5}
                max={3}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {data.puzzleWidthWithHeight}
                </label>
                <span className="text-sm text-muted-foreground">
                  {tempSettings.width}px / {tempSettings.height}px
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={200}
                  max={4096}
                  value={tempSettings.width || undefined}
                  placeholder={
                    !tempSettings.width ? "auto" : tempSettings.width.toString()
                  }
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 200 && value <= 4096) {
                      setTempSettings((prev) => ({
                        ...prev,
                        width: value,
                      }));
                    }
                  }}
                />
                <span className="text-sm text-muted-foreground">x</span>
                <Input
                  type="number"
                  min={200}
                  max={4096}
                  value={tempSettings.height || undefined}
                  placeholder={
                    !tempSettings.height
                      ? "auto"
                      : tempSettings.height.toString()
                  }
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 200 && value <= 4096) {
                      setTempSettings((prev) => ({
                        ...prev,
                        height: value,
                      }));
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(false)}
            >
              {data.cancel}
            </Button>
            <Button onClick={handleSettingsConfirm}>{data.confirm}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function PuzzleGameWrapper(props: PuzzleGameProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted ? <PuzzleGame {...props} /> : null;
}
