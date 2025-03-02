import { FC, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";
import { useI18n } from "@/app/[locale]/providers";

// 图案类型定义
type PatternType =
  | "grid"
  | "dots"
  | "lines"
  | "circles"
  | "triangles"
  | "zigzag"
  | "waves"
  | "checkerboard"
  | "hexagons"
  | "stars"
  | "crosshatch"
  | "polkaDots"
  | "diamonds"
  | "stripes"
  | "confetti"
  | "honeycomb";

type PatternPuzzleCreatorMeta = {
  patternType?: PatternType;
  size?: number;
  spacing?: number;
  color?: string;
  backgroundColor?: string;
  lineWidth?: number;
  rotation?: number;
};

type PatternPuzzleCreatorProps = {
  onGenerate?: (image: string, meta: PatternPuzzleCreatorMeta) => void;
  width?: number;
  height?: number;
  meta?: PatternPuzzleCreatorMeta;
};

export const PatternPuzzleCreator: FC<PatternPuzzleCreatorProps> = ({
  width,
  height,
  onGenerate,
  meta,
}) => {
  const { data } = useI18n();

  // 预设图案配置
  const patternPresets = useMemo(
    () => ({
      grid: {
        name: data.patternGrid,
        defaultSize: 40,
        defaultSpacing: 10,
        defaultColor: "#000000",
        defaultBackgroundColor: "#ffffff",
        defaultLineWidth: 2,
      },
      dots: {
        name: data.patternDots,
        defaultSize: 10,
        defaultSpacing: 30,
        defaultColor: "#3b82f6",
        defaultBackgroundColor: "#f8fafc",
        defaultLineWidth: 0,
      },
      lines: {
        name: data.patternLines,
        defaultSize: 2,
        defaultSpacing: 20,
        defaultColor: "#6b7280",
        defaultBackgroundColor: "#f3f4f6",
        defaultLineWidth: 2,
      },
      circles: {
        name: data.patternCircles,
        defaultSize: 30,
        defaultSpacing: 60,
        defaultColor: "#ec4899",
        defaultBackgroundColor: "#fdf2f8",
        defaultLineWidth: 2,
      },
      triangles: {
        name: data.patternTriangles,
        defaultSize: 20,
        defaultSpacing: 40,
        defaultColor: "#f97316",
        defaultBackgroundColor: "#fff7ed",
        defaultLineWidth: 0,
      },
      zigzag: {
        name: data.patternZigzag,
        defaultSize: 15,
        defaultSpacing: 30,
        defaultColor: "#8b5cf6",
        defaultBackgroundColor: "#f5f3ff",
        defaultLineWidth: 2,
      },
      waves: {
        name: data.patternWaves,
        defaultSize: 20,
        defaultSpacing: 40,
        defaultColor: "#0ea5e9",
        defaultBackgroundColor: "#f0f9ff",
        defaultLineWidth: 2,
      },
      checkerboard: {
        name: data.patternCheckerboard,
        defaultSize: 40,
        defaultSpacing: 0,
        defaultColor: "#1e293b",
        defaultBackgroundColor: "#f8fafc",
        defaultLineWidth: 0,
      },
      hexagons: {
        name: data.patternHexagons,
        defaultSize: 30,
        defaultSpacing: 5,
        defaultColor: "#10b981",
        defaultBackgroundColor: "#ecfdf5",
        defaultLineWidth: 2,
      },
      stars: {
        name: data.patternStars,
        defaultSize: 20,
        defaultSpacing: 40,
        defaultColor: "#eab308",
        defaultBackgroundColor: "#fefce8",
        defaultLineWidth: 0,
      },
      crosshatch: {
        name: data.patternCrosshatch,
        defaultSize: 30,
        defaultSpacing: 10,
        defaultColor: "#6b7280",
        defaultBackgroundColor: "#f9fafb",
        defaultLineWidth: 1,
      },
      polkaDots: {
        name: data.patternPolkaDots,
        defaultSize: 15,
        defaultSpacing: 30,
        defaultColor: "#f43f5e",
        defaultBackgroundColor: "#fff1f2",
        defaultLineWidth: 0,
      },
      diamonds: {
        name: data.patternDiamonds,
        defaultSize: 25,
        defaultSpacing: 15,
        defaultColor: "#8b5cf6",
        defaultBackgroundColor: "#f5f3ff",
        defaultLineWidth: 0,
      },
      stripes: {
        name: data.patternStripes,
        defaultSize: 20,
        defaultSpacing: 20,
        defaultColor: "#0284c7",
        defaultBackgroundColor: "#f0f9ff",
        defaultLineWidth: 10,
      },
      confetti: {
        name: data.patternConfetti,
        defaultSize: 8,
        defaultSpacing: 30,
        defaultColor: "#ec4899",
        defaultBackgroundColor: "#fdf2f8",
        defaultLineWidth: 0,
      },
      honeycomb: {
        name: data.patternHoneycomb,
        defaultSize: 30,
        defaultSpacing: 0,
        defaultColor: "#f59e0b",
        defaultBackgroundColor: "#fffbeb",
        defaultLineWidth: 2,
      },
    }),
    [data]
  );

  const [patternType, setPatternType] = useState<PatternType>(
    meta?.patternType || "grid"
  );
  const [size, setSize] = useState(
    meta?.size || patternPresets[patternType].defaultSize
  );
  const [spacing, setSpacing] = useState(
    meta?.spacing || patternPresets[patternType].defaultSpacing
  );
  const [color, setColor] = useState(
    meta?.color || patternPresets[patternType].defaultColor
  );
  const [backgroundColor, setBackgroundColor] = useState(
    meta?.backgroundColor || patternPresets[patternType].defaultBackgroundColor
  );
  const [lineWidth, setLineWidth] = useState(
    meta?.lineWidth || patternPresets[patternType].defaultLineWidth
  );
  const [rotation, setRotation] = useState(meta?.rotation || 0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 当图案类型改变时，更新默认值
  useEffect(() => {
    if (meta && meta.patternType === patternType) {
      setSize(meta.size || patternPresets[patternType].defaultSize);
      setSpacing(meta.spacing || patternPresets[patternType].defaultSpacing);
      setColor(meta.color || patternPresets[patternType].defaultColor);
      setBackgroundColor(
        meta.backgroundColor ||
          patternPresets[patternType].defaultBackgroundColor
      );
      setLineWidth(
        meta.lineWidth || patternPresets[patternType].defaultLineWidth
      );
      setRotation(meta.rotation || 0);
    } else {
      setSize(patternPresets[patternType].defaultSize);
      setSpacing(patternPresets[patternType].defaultSpacing);
      setColor(patternPresets[patternType].defaultColor);
      setBackgroundColor(patternPresets[patternType].defaultBackgroundColor);
      setLineWidth(patternPresets[patternType].defaultLineWidth);
    }
  }, [meta, patternPresets, patternType]);

  const update = useCallback(
    debounce((canvas: HTMLCanvasElement, meta: PatternPuzzleCreatorMeta) => {
      onGenerate?.(canvas.toDataURL("image/png"), meta);
    }, 300),
    [onGenerate]
  );

  // 绘制图案
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

    // 保存当前状态
    ctx.save();

    // 如果有旋转，先旋转整个画布
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // 设置绘图样式
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;

    // 根据不同的图案类型绘制
    switch (patternType) {
      case "grid":
        drawGrid(ctx, canvas.width, canvas.height, size, spacing, lineWidth);
        break;
      case "dots":
        drawDots(ctx, canvas.width, canvas.height, size, spacing);
        break;
      case "lines":
        drawLines(ctx, canvas.width, canvas.height, size, spacing);
        break;
      case "circles":
        drawCircles(ctx, canvas.width, canvas.height, size, spacing, lineWidth);
        break;
      case "triangles":
        drawTriangles(ctx, canvas.width, canvas.height, size, spacing);
        break;
      case "zigzag":
        drawZigzag(ctx, canvas.width, canvas.height, size, spacing);
        break;
      case "waves":
        drawWaves(ctx, canvas.width, canvas.height, size, spacing);
        break;
      case "checkerboard":
        drawCheckerboard(ctx, canvas.width, canvas.height, size);
        break;
      case "hexagons":
        drawHexagons(
          ctx,
          canvas.width,
          canvas.height,
          size,
          spacing,
          lineWidth
        );
        break;
      case "stars":
        drawStars(ctx, canvas.width, canvas.height, size, spacing);
        break;
      case "crosshatch":
        drawCrosshatch(
          ctx,
          canvas.width,
          canvas.height,
          size,
          spacing,
          lineWidth
        );
        break;
      case "polkaDots":
        drawPolkaDots(ctx, canvas.width, canvas.height, size, spacing);
        break;
      case "diamonds":
        drawDiamonds(ctx, canvas.width, canvas.height, size, spacing);
        break;
      case "stripes":
        drawStripes(ctx, canvas.width, canvas.height, size, spacing, lineWidth);
        break;
      case "confetti":
        drawConfetti(ctx, canvas.width, canvas.height, size, spacing);
        break;
      case "honeycomb":
        drawHoneycomb(
          ctx,
          canvas.width,
          canvas.height,
          size,
          spacing,
          lineWidth
        );
        break;
    }

    // 恢复画布状态
    ctx.restore();

    // 更新图像
    update(canvas, {
      patternType,
      size,
      spacing,
      color,
      backgroundColor,
      lineWidth,
      rotation,
    });
  }, [
    width,
    height,
    patternType,
    size,
    spacing,
    color,
    backgroundColor,
    lineWidth,
    rotation,
    update,
  ]);

  // 绘制网格
  function drawGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
    spacing: number,
    lineWidth: number
  ) {
    const totalSize = size + spacing;
    const offsetX = -totalSize;
    const offsetY = -totalSize;
    const cols = Math.ceil(width / totalSize) + 2;
    const rows = Math.ceil(height / totalSize) + 2;

    ctx.beginPath();

    // 绘制垂直线
    for (let i = 0; i < cols; i++) {
      const x = offsetX + i * totalSize;
      ctx.moveTo(x, offsetY);
      ctx.lineTo(x, height + totalSize);
    }

    // 绘制水平线
    for (let i = 0; i < rows; i++) {
      const y = offsetY + i * totalSize;
      ctx.moveTo(offsetX, y);
      ctx.lineTo(width + totalSize, y);
    }

    ctx.stroke();
  }

  // 绘制圆点
  function drawDots(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
    spacing: number
  ) {
    const totalSize = size + spacing;
    const offsetX = -totalSize;
    const offsetY = -totalSize;
    const cols = Math.ceil(width / totalSize) + 2;
    const rows = Math.ceil(height / totalSize) + 2;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = offsetX + i * totalSize + size / 2;
        const y = offsetY + j * totalSize + size / 2;

        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 绘制线条
  function drawLines(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
    spacing: number
  ) {
    const totalSize = size + spacing;
    const offsetY = -totalSize;
    const rows = Math.ceil(height / totalSize) + 2;

    ctx.beginPath();
    for (let i = 0; i < rows; i++) {
      const y = offsetY + i * totalSize + size / 2;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  // 绘制圆环
  function drawCircles(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
    spacing: number,
    lineWidth: number
  ) {
    const totalSize = size + spacing;
    const offsetX = -totalSize;
    const offsetY = -totalSize;
    const cols = Math.ceil(width / totalSize) + 2;
    const rows = Math.ceil(height / totalSize) + 2;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = offsetX + i * totalSize + size / 2;
        const y = offsetY + j * totalSize + size / 2;

        ctx.beginPath();
        ctx.arc(x, y, size / 2 - lineWidth / 2, 0, Math.PI * 2);
        if (lineWidth > 0) {
          ctx.stroke();
        } else {
          ctx.fill();
        }
      }
    }
  }

  // 绘制三角形
  function drawTriangles(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
    spacing: number
  ) {
    const totalSize = size + spacing;
    const offsetX = -totalSize;
    const offsetY = -totalSize;
    const cols = Math.ceil(width / totalSize) + 2;
    const rows = Math.ceil(height / totalSize) + 2;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = offsetX + i * totalSize;
        const y = offsetY + j * totalSize;

        ctx.beginPath();
        ctx.moveTo(x + size / 2, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x + size, y + size);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // 绘制锯齿线
  function drawZigzag(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
    spacing: number
  ) {
    const totalSize = size + spacing;
    const offsetY = -totalSize;
    const rows = Math.ceil(height / totalSize) + 2;
    const zigWidth = size * 2;

    for (let i = 0; i < rows; i++) {
      const y = offsetY + i * totalSize;

      ctx.beginPath();
      ctx.moveTo(0, y);

      let x = 0;
      while (x < width) {
        ctx.lineTo(x + zigWidth / 2, y + size);
        x += zigWidth / 2;
        ctx.lineTo(x, y);
        x += zigWidth / 2;
      }

      ctx.stroke();
    }
  }

  // 绘制波浪线
  function drawWaves(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
    spacing: number
  ) {
    const totalSize = size + spacing;
    const offsetY = -totalSize;
    const rows = Math.ceil(height / totalSize) + 2;
    const waveWidth = size * 2;

    for (let i = 0; i < rows; i++) {
      const y = offsetY + i * totalSize + size / 2;

      ctx.beginPath();
      ctx.moveTo(0, y);

      for (let x = 0; x <= width; x += 1) {
        const waveY = y + (Math.sin((x / waveWidth) * Math.PI * 2) * size) / 2;
        ctx.lineTo(x, waveY);
      }

      ctx.stroke();
    }
  }

  // 绘制棋盘格
  function drawCheckerboard(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number
  ) {
    const cols = Math.ceil(width / size) + 1;
    const rows = Math.ceil(height / size) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(i * size, j * size, size, size);
        }
      }
    }
  }

  // 绘制六边形
  function drawHexagons(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
    spacing: number,
    lineWidth: number
  ) {
    const totalSize = size + spacing;
    const hexHeight = size * Math.sqrt(3);
    const hexWidth = size * 2;
    const offsetX = -hexWidth;
    const offsetY = -hexHeight;

    const cols = Math.ceil(width / (hexWidth * 0.75)) + 2;
    const rows = Math.ceil(height / hexHeight) + 2;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = offsetX + i * (hexWidth * 0.75);
        const y = offsetY + j * hexHeight + (i % 2 === 0 ? 0 : hexHeight / 2);

        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const angle = (Math.PI / 3) * k;
          const pointX = x + size * Math.cos(angle);
          const pointY = y + size * Math.sin(angle);

          if (k === 0) {
            ctx.moveTo(pointX, pointY);
          } else {
            ctx.lineTo(pointX, pointY);
          }
        }
        ctx.closePath();

        if (lineWidth > 0) {
          ctx.stroke();
        } else {
          ctx.fill();
        }
      }
    }
  }

  // 绘制星星
  function drawStars(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
    spacing: number
  ) {
    const totalSize = size + spacing;
    const offsetX = -totalSize;
    const offsetY = -totalSize;
    const cols = Math.ceil(width / totalSize) + 2;
    const rows = Math.ceil(height / totalSize) + 2;

    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.4;
    const spikes = 5;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const centerX = offsetX + i * totalSize + size / 2;
        const centerY = offsetY + j * totalSize + size / 2;

        ctx.beginPath();

        for (let k = 0; k < spikes * 2; k++) {
          const radius = k % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * k) / spikes - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          if (k === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // 绘制交叉线
  function drawCrosshatch(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
    spacing: number,
    lineWidth: number
  ) {
    const totalSize = size + spacing;
    const offsetX = -totalSize;
    const offsetY = -totalSize;
    const cols = Math.ceil(width / totalSize) + 2;
    const rows = Math.ceil(height / totalSize) + 2;

    ctx.beginPath();

    // 绘制第一组对角线
    for (let i = 0; i < cols + rows; i++) {
      const startX = offsetX + Math.max(0, i - rows) * totalSize;
      const startY = offsetY + Math.min(i, rows - 1) * totalSize;
      const endX = Math.min(
        offsetX + (i + 1) * totalSize,
        offsetX + cols * totalSize
      );
      const endY = Math.max(offsetY, offsetY + (i - cols) * totalSize);

      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
    }

    // 绘制第二组对角线
    for (let i = -rows; i < cols; i++) {
      const startX = offsetX + Math.max(0, i) * totalSize;
      const startY = offsetY;
      const endX = offsetX + Math.min(cols - 1, i + rows) * totalSize;
      const endY =
        offsetY +
        Math.min(
          rows * totalSize,
          (i < 0 ? -i : 0) * totalSize + rows * totalSize
        );

      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
    }

    ctx.stroke();
  }

  // 绘制波点
  function drawPolkaDots(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
    spacing: number
  ) {
    const totalSize = size + spacing;
    const offsetX = -totalSize;
    const offsetY = -totalSize;
    const cols = Math.ceil(width / totalSize) + 2;
    const rows = Math.ceil(height / totalSize) + 2;

    // 绘制大圆点
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = offsetX + i * totalSize + size / 2;
        const y = offsetY + j * totalSize + size / 2;

        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();

        // 在每个大圆点周围绘制4个小圆点
        if (size > 10) {
          const smallSize = size / 4;
          const smallOffset = size * 0.75;

          // 上下左右四个小圆点
          const positions = [
            [x, y - smallOffset],
            [x + smallOffset, y],
            [x, y + smallOffset],
            [x - smallOffset, y],
          ];

          for (const [sx, sy] of positions) {
            ctx.beginPath();
            ctx.arc(sx, sy, smallSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }

  // 绘制菱形
  function drawDiamonds(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
    spacing: number
  ) {
    const totalSize = size + spacing;
    const offsetX = -totalSize;
    const offsetY = -totalSize;
    const cols = Math.ceil(width / totalSize) + 2;
    const rows = Math.ceil(height / totalSize) + 2;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const centerX = offsetX + i * totalSize + size / 2;
        const centerY = offsetY + j * totalSize + size / 2;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size / 2); // 上
        ctx.lineTo(centerX + size / 2, centerY); // 右
        ctx.lineTo(centerX, centerY + size / 2); // 下
        ctx.lineTo(centerX - size / 2, centerY); // 左
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // 绘制条纹
  function drawStripes(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
    spacing: number,
    lineWidth: number
  ) {
    const totalSize = size + spacing;
    const diagonal = Math.sqrt(width * width + height * height);
    const numStripes = Math.ceil(diagonal / totalSize) + 4;
    const center = { x: width / 2, y: height / 2 };

    ctx.lineWidth = lineWidth;

    for (let i = -numStripes / 2; i < numStripes / 2; i++) {
      const offset = i * totalSize;

      ctx.beginPath();

      // 垂直于旋转角度的线
      const angle = Math.PI / 4; // 45度角
      const perpAngle = angle + Math.PI / 2;

      const dirX = Math.cos(perpAngle);
      const dirY = Math.sin(perpAngle);

      const startX = center.x + dirX * offset - dirY * diagonal;
      const startY = center.y + dirY * offset + dirX * diagonal;
      const endX = center.x + dirX * offset + dirY * diagonal;
      const endY = center.y + dirY * offset - dirX * diagonal;

      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }

  // 绘制彩纸
  function drawConfetti(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
    spacing: number
  ) {
    const totalSize = size + spacing;
    const offsetX = -totalSize;
    const offsetY = -totalSize;
    const cols = Math.ceil(width / totalSize) + 4;
    const rows = Math.ceil(height / totalSize) + 4;

    // 保存原始颜色
    const originalColor = ctx.fillStyle;

    // 彩纸颜色
    const colors = [
      "#ef4444", // 红
      "#f97316", // 橙
      "#eab308", // 黄
      "#22c55e", // 绿
      "#0ea5e9", // 蓝
      "#8b5cf6", // 紫
      "#ec4899", // 粉
    ];

    // 彩纸形状：圆形、方形、三角形
    const shapes = ["circle", "square", "triangle"];

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x =
          offsetX + i * totalSize + size / 2 + (Math.random() - 0.5) * spacing;
        const y =
          offsetY + j * totalSize + size / 2 + (Math.random() - 0.5) * spacing;

        // 随机选择颜色和形状
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        // 随机旋转角度
        const rotation = Math.random() * Math.PI * 2;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // 绘制形状
        if (shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (shape === "square") {
          ctx.fillRect(-size / 2, -size / 2, size, size);
        } else if (shape === "triangle") {
          ctx.beginPath();
          ctx.moveTo(0, -size / 2);
          ctx.lineTo(size / 2, size / 2);
          ctx.lineTo(-size / 2, size / 2);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // 恢复原始颜色
    ctx.fillStyle = originalColor;
  }

  // 绘制蜂巢
  function drawHoneycomb(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
    spacing: number,
    lineWidth: number
  ) {
    const hexHeight = size * Math.sqrt(3);
    const hexWidth = size * 2;
    const totalWidth = hexWidth + spacing;
    const totalHeight = hexHeight + spacing;

    const cols = Math.ceil(width / (totalWidth * 0.75)) + 2;
    const rows = Math.ceil(height / totalHeight) + 2;

    const offsetX = -totalWidth;
    const offsetY = -totalHeight;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = offsetX + i * (totalWidth * 0.75);
        const y =
          offsetY + j * totalHeight + (i % 2 === 0 ? 0 : totalHeight / 2);

        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const angle = (Math.PI / 3) * k;
          const pointX = x + size * Math.cos(angle);
          const pointY = y + size * Math.sin(angle);

          if (k === 0) {
            ctx.moveTo(pointX, pointY);
          } else {
            ctx.lineTo(pointX, pointY);
          }
        }
        ctx.closePath();

        if (lineWidth > 0) {
          ctx.stroke();
        } else {
          ctx.fill();
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* 图案预览 */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="shadow-inner"
          style={{
            width: "160px",
            height: "160px",
            display: "block",
          }}
        />
      </div>

      {/* 图案类型选择 */}
      <div className="space-y-2">
        <Label>{data.patternType}</Label>
        <Select
          value={patternType}
          onValueChange={(value: PatternType) => setPatternType(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(patternPresets).map(([key, preset]) => (
              <SelectItem key={key} value={key}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 图案预设展示 */}
      <div className="space-y-2">
        <Label>{data.patternPresets}</Label>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(patternPresets).map(([key, preset]) => (
            <Button
              key={key}
              variant="outline"
              className={cn(
                "h-16 p-0 overflow-hidden",
                patternType === key && "ring-2 ring-primary"
              )}
              onClick={() => setPatternType(key as PatternType)}
            >
              <div
                className="w-full h-full flex items-center justify-center text-xs"
                style={{ backgroundColor: preset.defaultBackgroundColor }}
              >
                {preset.name}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* 图案大小 */}
      <div className="space-y-2">
        <Label>{data.patternSize.replace("{size}", size.toString())}</Label>
        <Slider
          value={[size]}
          onValueChange={(value) => setSize(value[0])}
          min={5}
          max={100}
          step={1}
        />
      </div>

      {/* 图案间距 */}
      {patternType !== "checkerboard" && (
        <div className="space-y-2">
          <Label>
            {data.patternSpacing.replace("{spacing}", spacing.toString())}
          </Label>
          <Slider
            value={[spacing]}
            onValueChange={(value) => setSpacing(value[0])}
            min={0}
            max={100}
            step={1}
          />
        </div>
      )}

      {/* 线条宽度 - 仅对某些图案类型显示 */}
      {["grid", "lines", "circles", "zigzag", "waves"].includes(
        patternType
      ) && (
        <div className="space-y-2">
          <Label>
            {data.lineWidth.replace("{lineWidth}", lineWidth.toString())}
          </Label>
          <Slider
            value={[lineWidth]}
            onValueChange={(value) => setLineWidth(value[0])}
            min={1}
            max={10}
            step={1}
          />
        </div>
      )}

      {/* 旋转角度 */}
      <div className="space-y-2">
        <Label>
          {data.patternRotation.replace("{rotation}", rotation.toString())}
        </Label>
        <Slider
          value={[rotation]}
          onValueChange={(value) => setRotation(value[0])}
          min={0}
          max={360}
          step={15}
        />
      </div>

      {/* 颜色设置 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{data.patternColor}</Label>
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
      </div>
    </div>
  );
};
