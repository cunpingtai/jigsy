import { FC, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";
import { useI18n } from "@/app/[locale]/providers";

type ShapeType =
  | "circle"
  | "square"
  | "triangle"
  | "star"
  | "heart"
  | "polygon"
  | "spiral"
  | "flower";

type ShapePuzzleCreatorMeta = {
  shapeType?: ShapeType;
  size?: number;
  color?: string;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  rotation?: number;
  sides?: number;
  petals?: number;
  repeat?: number;
  repeatGap?: number;
  repeatMode?: "centered" | "tiled" | "random";
  randomRotation?: boolean;
};

type ShapePuzzleCreatorProps = {
  onGenerate?: (image: string, meta: ShapePuzzleCreatorMeta) => void;
  width?: number;
  height?: number;
  meta?: ShapePuzzleCreatorMeta;
};

export const ShapePuzzleCreator: FC<ShapePuzzleCreatorProps> = ({
  onGenerate,
  width,
  height,
  meta,
}) => {
  const { data } = useI18n();
  const shapePresets = useMemo(() => {
    return {
      circle: {
        name: data.circle,
        defaultSize: 400,
        defaultColor: "#3b82f6",
        defaultBackgroundColor: "#ffffff",
        defaultBorderWidth: 10,
        defaultBorderColor: "#1d4ed8",
      },
      square: {
        name: data.square,
        defaultSize: 400,
        defaultColor: "#ef4444",
        defaultBackgroundColor: "#ffffff",
        defaultBorderWidth: 10,
        defaultBorderColor: "#b91c1c",
      },
      triangle: {
        name: data.triangle,
        defaultSize: 400,
        defaultColor: "#22c55e",
        defaultBackgroundColor: "#ffffff",
        defaultBorderWidth: 10,
        defaultBorderColor: "#15803d",
      },
      star: {
        name: data.star,
        defaultSize: 400,
        defaultColor: "#eab308",
        defaultBackgroundColor: "#ffffff",
        defaultBorderWidth: 10,
        defaultBorderColor: "#a16207",
      },
      heart: {
        name: data.heart,
        defaultSize: 400,
        defaultColor: "#ec4899",
        defaultBackgroundColor: "#ffffff",
        defaultBorderWidth: 10,
        defaultBorderColor: "#be185d",
      },
      polygon: {
        name: data.polygon,
        defaultSize: 400,
        defaultColor: "#8b5cf6",
        defaultBackgroundColor: "#ffffff",
        defaultBorderWidth: 10,
        defaultBorderColor: "#6d28d9",
      },
      spiral: {
        name: data.spiral,
        defaultSize: 400,
        defaultColor: "#06b6d4",
        defaultBackgroundColor: "#ffffff",
        defaultBorderWidth: 5,
        defaultBorderColor: "#0e7490",
      },
      flower: {
        name: data.flower,
        defaultSize: 400,
        defaultColor: "#f472b6",
        defaultBackgroundColor: "#ffffff",
        defaultBorderWidth: 5,
        defaultBorderColor: "#db2777",
      },
    };
  }, [data]);

  const [shapeType, setShapeType] = useState<ShapeType>(
    meta?.shapeType || "circle"
  );
  const [size, setSize] = useState(
    meta?.size || shapePresets[shapeType].defaultSize
  );
  const [color, setColor] = useState(
    meta?.color || shapePresets[shapeType].defaultColor
  );
  const [backgroundColor, setBackgroundColor] = useState(
    meta?.backgroundColor || shapePresets[shapeType].defaultBackgroundColor
  );
  const [borderWidth, setBorderWidth] = useState(
    meta?.borderWidth || shapePresets[shapeType].defaultBorderWidth
  );
  const [borderColor, setBorderColor] = useState(
    meta?.borderColor || shapePresets[shapeType].defaultBorderColor
  );
  const [rotation, setRotation] = useState(meta?.rotation || 0);
  const [sides, setSides] = useState(meta?.sides || 6); // 用于多边形的边数
  const [petals, setPetals] = useState(meta?.petals || 8); // 用于花朵的花瓣数
  const [repeat, setRepeat] = useState(meta?.repeat || 5); // 图形重复次数
  const [repeatGap, setRepeatGap] = useState(meta?.repeatGap || 20); // 重复图形之间的间距
  const [repeatMode, setRepeatMode] = useState<"centered" | "tiled" | "random">(
    meta?.repeatMode || "centered"
  ); // 重复模式
  const [randomRotation, setRandomRotation] = useState(
    meta?.randomRotation || false
  ); // 随机旋转

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 当图形类型改变时，更新默认值
  useEffect(() => {
    if (meta && meta.shapeType === shapeType) {
      setSize(meta.size || shapePresets[shapeType].defaultSize);
      setColor(meta.color || shapePresets[shapeType].defaultColor);
      setBackgroundColor(
        meta.backgroundColor || shapePresets[shapeType].defaultBackgroundColor
      );
      setBorderWidth(
        meta.borderWidth || shapePresets[shapeType].defaultBorderWidth
      );
      setBorderColor(
        meta.borderColor || shapePresets[shapeType].defaultBorderColor
      );
    } else {
      setSize(shapePresets[shapeType].defaultSize);
      setColor(shapePresets[shapeType].defaultColor);
      setBackgroundColor(shapePresets[shapeType].defaultBackgroundColor);
      setBorderWidth(shapePresets[shapeType].defaultBorderWidth);
      setBorderColor(shapePresets[shapeType].defaultBorderColor);
    }
  }, [meta, shapeType]);

  const update = useCallback(
    debounce((canvas: HTMLCanvasElement, meta: ShapePuzzleCreatorMeta) => {
      onGenerate?.(canvas.toDataURL("image/png"), meta);
    }, 300),
    [onGenerate]
  );

  // 绘制图形
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置canvas尺寸
    canvas.width = width || 1024;
    canvas.height = height || 1024;

    // 绘制背景
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 计算实际绘制尺寸
    let actualSize = size;
    if (repeatMode === "tiled") {
      // 平铺模式下，根据重复次数调整大小
      actualSize =
        Math.min(canvas.width, canvas.height) / (Math.sqrt(repeat) + 1);
    } else if (repeat > 1) {
      // 居中或随机模式下，适当缩小图形
      actualSize = size / (repeat > 5 ? 2.5 : repeat > 2 ? 1.5 : 1);
    }

    // 根据重复模式绘制图形
    if (repeatMode === "centered") {
      // 居中模式：从中心向四周扩散
      // 首先绘制中心图形
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      const centerRotation = randomRotation ? Math.random() * 360 : rotation;
      ctx.rotate((centerRotation * Math.PI) / 180);
      drawShape(
        ctx,
        shapeType,
        actualSize,
        color,
        borderWidth,
        borderColor,
        sides,
        petals
      );
      ctx.restore();

      // 如果需要重复，则围绕中心图形绘制
      if (repeat > 1) {
        // 计算每层的图形数量
        // 第一层4个，第二层8个，依此类推
        let remainingShapes = repeat - 1;
        let layer = 1;

        while (remainingShapes > 0) {
          // 当前层的图形数量
          const shapesInLayer = Math.min(remainingShapes, layer * 8);

          // 计算当前层的半径
          const layerRadius = layer * (actualSize + repeatGap);

          // 均匀分布在圆周上
          for (let i = 0; i < shapesInLayer; i++) {
            ctx.save();

            // 计算位置角度
            const angle = (i * 2 * Math.PI) / shapesInLayer;

            // 计算位置
            const x = canvas.width / 2 + Math.cos(angle) * layerRadius;
            const y = canvas.height / 2 + Math.sin(angle) * layerRadius;

            ctx.translate(x, y);

            // 旋转
            const shapeRotation = randomRotation
              ? Math.random() * 360
              : rotation;
            ctx.rotate((shapeRotation * Math.PI) / 180);

            // 绘制图形
            drawShape(
              ctx,
              shapeType,
              actualSize,
              color,
              borderWidth,
              borderColor,
              sides,
              petals
            );

            ctx.restore();
          }

          // 更新剩余图形数量
          remainingShapes -= shapesInLayer;
          layer++;
        }
      }
    } else if (repeatMode === "tiled") {
      // 平铺模式：规则网格排列
      const cols = Math.ceil(Math.sqrt(repeat));
      const rows = Math.ceil(repeat / cols);
      const startX =
        (canvas.width - cols * (actualSize + repeatGap)) / 2 + actualSize / 2;
      const startY =
        (canvas.height - rows * (actualSize + repeatGap)) / 2 + actualSize / 2;

      let count = 0;
      for (let row = 0; row < rows && count < repeat; row++) {
        for (let col = 0; col < cols && count < repeat; col++) {
          ctx.save();

          const x = startX + col * (actualSize + repeatGap);
          const y = startY + row * (actualSize + repeatGap);

          ctx.translate(x, y);

          const currentRotation = randomRotation
            ? Math.random() * 360
            : rotation;
          ctx.rotate((currentRotation * Math.PI) / 180);

          drawShape(
            ctx,
            shapeType,
            actualSize,
            color,
            borderWidth,
            borderColor,
            sides,
            petals
          );

          ctx.restore();
          count++;
        }
      }
    } else if (repeatMode === "random") {
      // 随机模式：随机位置
      for (let r = 0; r < repeat; r++) {
        ctx.save();

        // 随机位置，但确保图形完全在画布内
        const margin = actualSize / 2 + borderWidth;
        const x = margin + Math.random() * (canvas.width - 2 * margin);
        const y = margin + Math.random() * (canvas.height - 2 * margin);

        ctx.translate(x, y);

        const currentRotation = randomRotation ? Math.random() * 360 : rotation;
        ctx.rotate((currentRotation * Math.PI) / 180);

        drawShape(
          ctx,
          shapeType,
          actualSize,
          color,
          borderWidth,
          borderColor,
          sides,
          petals
        );

        ctx.restore();
      }
    }

    update(canvas, {
      shapeType,
      size,
      color,
      backgroundColor,
      borderWidth,
      borderColor,
      rotation,
      sides,
      petals,
      repeat,
      repeatGap,
      repeatMode,
      randomRotation,
    });
  }, [
    width,
    height,
    shapeType,
    size,
    color,
    backgroundColor,
    borderWidth,
    borderColor,
    rotation,
    sides,
    petals,
    repeat,
    repeatGap,
    repeatMode,
    randomRotation,
    update,
  ]);

  // 抽取绘制单个图形的函数
  const drawShape = (
    ctx: CanvasRenderingContext2D,
    shapeType: ShapeType,
    size: number,
    color: string,
    borderWidth: number,
    borderColor: string,
    sides: number,
    petals: number
  ) => {
    // 设置边框样式
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColor;

    // 绘制图形
    if (shapeType === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      if (borderWidth > 0) {
        ctx.stroke();
      }
    } else if (shapeType === "square") {
      ctx.beginPath();
      ctx.rect(-size / 2, -size / 2, size, size);
      ctx.fillStyle = color;
      ctx.fill();
      if (borderWidth > 0) {
        ctx.stroke();
      }
    } else if (shapeType === "triangle") {
      ctx.beginPath();
      const h = (Math.sqrt(3) / 2) * size;
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(-size / 2, h / 2);
      ctx.lineTo(size / 2, h / 2);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      if (borderWidth > 0) {
        ctx.stroke();
      }
    } else if (shapeType === "star") {
      ctx.beginPath();
      const outerRadius = size / 2;
      const innerRadius = outerRadius * 0.4;
      const spikes = 5;

      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI / spikes) * i;
        const x = Math.sin(angle) * radius;
        const y = -Math.cos(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      if (borderWidth > 0) {
        ctx.stroke();
      }
    } else if (shapeType === "heart") {
      ctx.beginPath();
      const topCurveHeight = size * 0.3;

      // 开始点在底部中心
      ctx.moveTo(0, size / 2);

      // 左边曲线
      ctx.bezierCurveTo(
        -size / 2,
        size / 4,
        -size / 2,
        -size / 4,
        0,
        -size / 2
      );

      // 右边曲线
      ctx.bezierCurveTo(size / 2, -size / 4, size / 2, size / 4, 0, size / 2);

      ctx.fillStyle = color;
      ctx.fill();
      if (borderWidth > 0) {
        ctx.stroke();
      }
    } else if (shapeType === "polygon") {
      ctx.beginPath();
      const radius = size / 2;

      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        const x = Math.sin(angle) * radius;
        const y = -Math.cos(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      if (borderWidth > 0) {
        ctx.stroke();
      }
    } else if (shapeType === "spiral") {
      ctx.beginPath();
      const turns = 5;
      const points = 200;

      for (let i = 0; i < points; i++) {
        const angle = (i / points) * turns * 2 * Math.PI;
        const radius = (i / points) * (size / 2);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = borderWidth > 0 ? borderWidth : 5;
      ctx.stroke();
    } else if (shapeType === "flower") {
      ctx.beginPath();
      const radius = size / 2;
      const innerRadius = radius * 0.4;

      for (let i = 0; i <= petals * 2; i++) {
        const angle = (i * Math.PI) / petals;
        const r = i % 2 === 0 ? radius : innerRadius;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      if (borderWidth > 0) {
        ctx.stroke();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 图形预览 */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="rounded-lg shadow-inner"
          style={{
            width: "200px",
            height: "200px",
            display: "block",
          }}
        />
      </div>

      {/* 图形类型 */}
      <div className="space-y-2">
        <Label>{data.shapeType}</Label>
        <Select
          value={shapeType}
          onValueChange={(value: ShapeType) => setShapeType(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(shapePresets).map(([key, preset]) => (
              <SelectItem key={key} value={key}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 图形大小 */}
      <div className="space-y-2">
        <Label>{data.shapeSize.replace("{value}", size.toString())}</Label>
        <Slider
          value={[size]}
          onValueChange={(value) => setSize(value[0])}
          min={50}
          max={800}
          step={1}
        />
      </div>

      {/* 重复模式 */}
      <div className="space-y-2">
        <Label>{data.repeatMode}</Label>
        <Select
          value={repeatMode}
          onValueChange={(value: "centered" | "tiled" | "random") =>
            setRepeatMode(value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="centered">{data.centered}</SelectItem>
            <SelectItem value="tiled">{data.tiled}</SelectItem>
            <SelectItem value="random">{data.random}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 图形重复 */}
      <div className="space-y-2">
        <Label>{data.repeatTimes.replace("{value}", repeat.toString())}</Label>
        <Slider
          value={[repeat]}
          onValueChange={(value) => setRepeat(value[0])}
          min={1}
          max={100}
          step={1}
        />
      </div>

      {/* 重复间距 */}
      {repeat > 1 && (
        <div className="space-y-2">
          <Label>
            {data.repeatGap.replace("{value}", repeatGap.toString())}
          </Label>
          <Slider
            value={[repeatGap]}
            onValueChange={(value) => setRepeatGap(value[0])}
            min={0}
            max={100}
            step={1}
          />
        </div>
      )}

      {/* 随机旋转 */}
      {repeat > 1 && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="randomRotation"
            checked={randomRotation}
            onChange={(e) => setRandomRotation(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="randomRotation">{data.randomRotation}</Label>
        </div>
      )}

      {/* 旋转角度 */}
      <div className="space-y-2">
        <Label>{data.rotation.replace("{value}", rotation.toString())}</Label>
        <Slider
          value={[rotation]}
          onValueChange={(value) => setRotation(value[0])}
          min={0}
          max={360}
          step={1}
        />
      </div>

      {/* 图形颜色 */}
      <div className="space-y-2">
        <Label>{data.shapeColor}</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-9 h-9 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      {/* 背景颜色 */}
      <div className="space-y-2">
        <Label>{data.backgroundColor}</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-9 h-9 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      {/* 边框宽度 */}
      <div className="space-y-2">
        <Label>
          {data.borderWidth.replace("{value}", borderWidth.toString())}
        </Label>
        <Slider
          value={[borderWidth]}
          onValueChange={(value) => setBorderWidth(value[0])}
          min={0}
          max={20}
          step={1}
        />
      </div>

      {/* 边框颜色 */}
      <div className="space-y-2">
        <Label>{data.borderColor}</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={borderColor}
            onChange={(e) => setBorderColor(e.target.value)}
            className="w-9 h-9 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={borderColor}
            onChange={(e) => setBorderColor(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      {/* 多边形边数 */}
      {shapeType === "polygon" ? (
        <div className="space-y-2">
          <Label>
            {data.polygonSides.replace("{value}", sides.toString())}
          </Label>
          <Slider
            value={[sides]}
            onValueChange={(value) => setSides(value[0])}
            min={3}
            max={20}
            step={1}
          />
        </div>
      ) : null}

      {/* 花朵花瓣数 */}
      {shapeType === "flower" ? (
        <div className="space-y-2">
          <Label>
            {data.flowerPetals.replace("{value}", petals.toString())}
          </Label>
          <Slider
            value={[petals]}
            onValueChange={(value) => setPetals(value[0])}
            min={4}
            max={20}
            step={1}
          />
        </div>
      ) : null}
    </div>
  );
};
