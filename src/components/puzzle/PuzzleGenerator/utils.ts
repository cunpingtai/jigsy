import { PuzzlePiece } from "./puzzleSplitter";
import { AnimationState, DistributionStrategy, PiecePosition } from "./types";
import * as fabric from "fabric";

export function isAdjacent(piece1: PuzzlePiece, piece2: PuzzlePiece): boolean {
  const rowDiff = Math.abs(piece1.row - piece2.row);
  const colDiff = Math.abs(piece1.col - piece2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

export function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// 添加位置生成函数
export const generatePiecePosition = (
  piece: PuzzlePiece,
  canvasWidth: number,
  canvasHeight: number,
  strategy: DistributionStrategy
): PiecePosition => {
  switch (strategy) {
    case DistributionStrategy.SURROUNDING:
      // 在画布四周生成位置
      const isSide = Math.random() > 0.5;
      if (isSide) {
        // 左右两侧
        const isLeft = Math.random() > 0.5;
        return {
          x: isLeft ? piece.width : canvasWidth - piece.width * 2,
          y: Math.random() * (canvasHeight - piece.height),
          rotation: 0,
        };
      } else {
        // 上下两侧
        const isTop = Math.random() > 0.5;
        return {
          x: Math.random() * (canvasWidth - piece.width),
          y: isTop ? piece.height : canvasHeight - piece.height * 2,
          rotation: 0,
        };
      }

    case DistributionStrategy.CENTER_SCATTER:
      // 在中心区域随机分布
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const radius = Math.min(canvasWidth, canvasHeight) / 4;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;

      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        rotation: 0,
      };

    case DistributionStrategy.SPREAD_OUT:
      // 在整个画布范围内均匀分布
      const margin = 50; // 与边界保持的最小距离
      return {
        x: margin + Math.random() * (canvasWidth - piece.width - margin * 2),
        y: margin + Math.random() * (canvasHeight - piece.height - margin * 2),
        rotation: 0,
      };
  }
};

// 添加缓动函数
export const easeOutCubic = (x: number): number => {
  return 1 - Math.pow(1 - x, 3);
};

export const createAnimationLoop = (canvas: fabric.Canvas) => {
  let animations: AnimationState[] = [];
  let animationFrameId: number | null = null;

  const animate = (currentTime: number) => {
    let hasRunningAnimations = false;

    canvas.forEachObject((obj) => {
      const animation = animations.find((a) => a.obj === obj);
      if (!animation) return;

      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      const easeProgress = easeOutCubic(progress);

      // 更新对象属性
      Object.keys(animation.endProps).forEach((prop) => {
        const start = animation.startProps[prop];
        const end = animation.endProps[prop];
        obj.set(prop, start + (end - start) * easeProgress);
      });
      obj.dirty = true;

      if (progress < 1) {
        hasRunningAnimations = true;
      }
    });

    canvas.renderAll();

    if (hasRunningAnimations) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      animations = [];
      animationFrameId = null;
    }
  };

  return {
    addAnimation: (animation: Omit<AnimationState, "startTime">) => {
      animations.push({
        ...animation,
        startTime: performance.now(),
      });

      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(animate);
      }
    },
    clear: () => {
      animations = [];
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },
  };
};

// 创建径向渐变和阴影效果
export const createPiece3DEffect = (path: string) => {
  // 创建顶部光源渐变
  const topLightGradient = new fabric.Gradient({
    type: "linear",
    coords: {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 200,
    },
    colorStops: [
      { offset: 0, color: "rgba(255,255,255,0.4)" },
      { offset: 0.3, color: "rgba(255,255,255,0)" },
      { offset: 0.7, color: "rgba(0,0,0,0)" },
      { offset: 1, color: "rgba(0,0,0,0.3)" },
    ],
  });

  // 创建侧面光源渐变
  const sideLightGradient = new fabric.Gradient({
    type: "linear",
    coords: {
      x1: 0,
      y1: 100,
      x2: 200,
      y2: 100,
    },
    colorStops: [
      { offset: 0, color: "rgba(0,0,0,0.0)" },
      { offset: 0.4, color: "rgba(0,0,0,0)" },
      { offset: 0.6, color: "rgba(0,0,0,0)" },
      { offset: 1, color: "rgba(0,0,0,1)" },
    ],
  });

  // 创建光效层
  const topLightEffect = new fabric.Path(path, {
    left: 0,
    top: 0,
    fill: topLightGradient,
    selectable: false,
    evented: false,
    opacity: 0.7,
  });

  const sideLightEffect = new fabric.Path(path, {
    left: 0,
    top: 0,
    fill: sideLightGradient,
    selectable: false,
    evented: false,
    opacity: 0.5,
  });

  // 创建内部阴影
  const innerShadow = new fabric.Path(path, {
    left: 0,
    top: 0,
    fill: "rgba(0,0,0,0)",
    stroke: "rgba(0,0,0,0.8)",
    strokeWidth: 3,
    selectable: false,
    evented: false,
  });

  // 创建高光效果
  const highlight = new fabric.Path(path, {
    left: 0,
    top: 0,
    fill: "rgba(0,0,0,0)",
    stroke: "rgba(255,255,255,0.5)",
    strokeWidth: 1,
    selectable: false,
    evented: false,
  });

  return [topLightEffect, sideLightEffect, innerShadow, highlight];
};

// 添加爆炸粒子效果
export const createExplosionParticles = (
  canvas: fabric.Canvas,
  x: number,
  y: number
) => {
  const colors = ["#FF1461", "#080909", "#5A87FF", "#FBF38C"];
  const particles = [];

  for (let i = 0; i < 200; i++) {
    const radius = Math.random() * 3 + 2;
    const circle = new fabric.Circle({
      left: x,
      top: y,
      radius: radius,
      fill: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      selectable: false,
      evented: false,
    });

    particles.push({
      obj: circle,
      velocity: {
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 30,
      },
      radius: radius,
      initialOpacity: 1,
    });

    canvas.add(circle);
  }

  return particles;
};

export function createTempCanvas(
  image: fabric.Image,
  width: number,
  height: number
) {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx?.drawImage(
    image.getElement() as HTMLImageElement,
    0,
    0,
    width,
    height
  );
  return tempCanvas;
}
