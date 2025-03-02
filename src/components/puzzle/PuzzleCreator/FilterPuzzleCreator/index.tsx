import { FC, useState, useRef, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";
import { Upload } from "lucide-react";

type FilterType =
  | "grayscale"
  | "sepia"
  | "blur"
  | "brightness"
  | "contrast"
  | "hue-rotate"
  | "invert"
  | "saturate"
  | "pixelate"
  | "oil-painting"
  | "watercolor"
  | "comic";

const filterPresets = {
  grayscale: {
    name: "黑白",
    min: 0,
    max: 100,
    default: 100,
    unit: "%",
  },
  sepia: {
    name: "复古",
    min: 0,
    max: 100,
    default: 70,
    unit: "%",
  },
  blur: {
    name: "模糊",
    min: 0,
    max: 20,
    default: 5,
    unit: "px",
  },
  brightness: {
    name: "亮度",
    min: 0,
    max: 200,
    default: 120,
    unit: "%",
  },
  contrast: {
    name: "对比度",
    min: 0,
    max: 200,
    default: 150,
    unit: "%",
  },
  "hue-rotate": {
    name: "色相旋转",
    min: 0,
    max: 360,
    default: 180,
    unit: "deg",
  },
  invert: {
    name: "反色",
    min: 0,
    max: 100,
    default: 100,
    unit: "%",
  },
  saturate: {
    name: "饱和度",
    min: 0,
    max: 300,
    default: 200,
    unit: "%",
  },
  pixelate: {
    name: "像素化",
    min: 1,
    max: 50,
    default: 10,
    unit: "px",
  },
  "oil-painting": {
    name: "油画",
    min: 1,
    max: 20,
    default: 5,
    unit: "",
  },
  watercolor: {
    name: "水彩",
    min: 1,
    max: 100,
    default: 50,
    unit: "%",
  },
  comic: {
    name: "漫画",
    min: 1,
    max: 10,
    default: 5,
    unit: "",
  },
};

type FilterPuzzleCreatorProps = {
  onGenerate?: (image: string) => void;
};

export const FilterPuzzleCreator: FC<FilterPuzzleCreatorProps> = ({
  onGenerate,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("grayscale");
  const [filterValue, setFilterValue] = useState(
    filterPresets[selectedFilter].default
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const update = useCallback(
    debounce((canvas: HTMLCanvasElement) => {
      onGenerate?.(canvas.toDataURL("image/png"));
    }, 300),
    [onGenerate]
  );

  // 初始化并管理 Web Worker
  useEffect(() => {
    // 创建 Worker
    if (typeof window !== "undefined" && !workerRef.current) {
      workerRef.current = new Worker(
        new URL("./filterWorker.ts", import.meta.url)
      );
    }

    // 设置消息处理
    const handleWorkerMessage = (event: MessageEvent) => {
      const { imageData, filterType } = event.data;

      // 忽略过时的滤镜结果
      if (filterType !== selectedFilter) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const uint8Array = new Uint8ClampedArray(imageData.data);
      const newImageData = new ImageData(
        uint8Array,
        imageData.width,
        imageData.height
      );

      ctx.putImageData(newImageData, 0, 0);
      update(canvas);
      setIsProcessing(false);
    };

    if (workerRef.current) {
      workerRef.current.onmessage = handleWorkerMessage;
    }

    // 清理函数
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: "cancel" });
      }
    };
  }, [selectedFilter, update]);

  // 组件卸载时终止 Worker
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;

      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setUploadedImage(event.target?.result as string);
      };
      img.src = event.target.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 当滤镜类型改变时，更新默认值
  useEffect(() => {
    setFilterValue(filterPresets[selectedFilter].default);
  }, [selectedFilter]);

  // 应用滤镜效果
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置canvas尺寸
    canvas.width = 1024;
    canvas.height = 1024;

    // 绘制背景
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!uploadedImage || !imageRef.current) {
      // 如果没有上传图片，显示提示文本
      ctx.fillStyle = "#666";
      ctx.font = "100px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("请上传图片以应用滤镜", canvas.width / 2, canvas.height / 2);
      return;
    }

    // 绘制原始图片
    const img = imageRef.current;
    const scale = Math.min(
      canvas.width / img.width,
      canvas.height / img.height
    );
    const x = (canvas.width - img.width * scale) / 2;
    const y = (canvas.height - img.height * scale) / 2;

    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      x,
      y,
      img.width * scale,
      img.height * scale
    );

    // 使用 Worker 处理滤镜
    try {
      setIsProcessing(true);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (workerRef.current) {
        // 取消之前的操作
        workerRef.current.postMessage({ type: "cancel" });

        // 发送新的滤镜处理请求
        workerRef.current.postMessage({
          imageData,
          filterType: selectedFilter,
          filterValue,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
        });
      }
    } catch (error) {
      console.error("滤镜应用失败:", error);
      setIsProcessing(false);
      // 显示错误信息
      ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.font = "100px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        "滤镜应用失败，请尝试其他滤镜",
        canvas.width / 2,
        canvas.height / 2
      );
    }
  }, [uploadedImage, selectedFilter, filterValue, backgroundColor, update]);

  return (
    <div className="space-y-6">
      {/* 图片预览 */}
      <div className="flex justify-center relative">
        <canvas
          ref={canvasRef}
          className="rounded-lg shadow-inner object-contain"
          style={{
            width: "100%",
            maxWidth: "300px",
            height: "auto",
            aspectRatio: "1/1",
            display: "block",
          }}
        />
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* 图片上传 */}
      <div className="space-y-2">
        <Label>上传图片</Label>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex items-center justify-center gap-2 w-full h-12 border border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>{uploadedImage ? "更换图片" : "选择图片"}</span>
          </label>
        </div>
      </div>

      {/* 滤镜预设展示 */}
      <div className="space-y-2">
        <Label>滤镜预设</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {Object.entries(filterPresets).map(([key, preset]) => (
            <Button
              key={key}
              variant="outline"
              className={cn(
                "h-16 p-0 overflow-hidden",
                selectedFilter === key && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedFilter(key as FilterType)}
            >
              <div className="w-full h-full flex items-center justify-center text-xs">
                {preset.name}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* 滤镜强度 */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>{filterPresets[selectedFilter].name}强度</Label>
          <span className="text-sm text-muted-foreground">
            {filterValue}
            {filterPresets[selectedFilter].unit}
          </span>
        </div>
        <Slider
          value={[filterValue]}
          onValueChange={(value) => setFilterValue(value[0])}
          min={filterPresets[selectedFilter].min}
          max={filterPresets[selectedFilter].max}
          step={1}
          className="my-2"
        />
      </div>

      {/* 背景颜色 */}
      <div className="space-y-2">
        <Label>背景颜色</Label>
        <div className="flex gap-2">
          <div
            className="w-9 h-9 rounded border overflow-hidden"
            style={{ padding: 0 }}
          >
            <Input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-full h-full p-0 cursor-pointer border-0"
            />
          </div>
          <Input
            type="text"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="flex-1"
            placeholder="#RRGGBB"
          />
        </div>
      </div>
    </div>
  );
};
