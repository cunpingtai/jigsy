import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DistributionStrategy,
  PiecePosition,
  PuzzleConfig,
  PuzzlePiece,
} from "./types";
import { PuzzleGenerator } from "./generator";
import * as fabric from "fabric";
import { PuzzleSplitter } from "./puzzleSplitter";
import {
  createPiece3DEffect,
  createTempCanvas,
  generatePiecePosition,
} from "./utils";

export function usePuzzleGenerator(config: PuzzleConfig) {
  const { width, height, tilesX, tilesY, seed, tabSize, jitter } = config;
  const puzzleGenerator = useMemo(
    () =>
      new PuzzleGenerator({
        width,
        height,
        tilesX,
        tilesY,
        seed,
        tabSize,
        jitter,
      }),
    [width, height, tilesX, tilesY, seed, tabSize, jitter]
  );

  const path = puzzleGenerator.generatePath();

  return {
    path,
    puzzleGenerator,
  };
}

// fabricCanvasRef.current;
export function useFabricCanvas(
  container?: HTMLCanvasElement | null,
  config?: {
    width?: number;
    height?: number;
    lineColor?: string;
    lineWidth?: number;
    zoomStep?: number;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    onZoomChange?: (zoom: number) => void;
  }
) {
  const {
    width,
    height,
    zoomStep = 0.1,
    zoom = 1,
    minZoom = 0.1,
    maxZoom = 20,
    onZoomChange,
  } = config || {};
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  // 记录上一次的缩放值，用于比较是否需要更新
  const prevZoomRef = useRef(zoom);
  // const lastGoodRef = useRef({
  //   left: 0,
  //   top: 0,
  // });

  // 监听外部缩放值变化
  useEffect(() => {
    if (!fabricCanvas || prevZoomRef.current === zoom) return;

    const center = new fabric.Point(
      fabricCanvas.width! / 2,
      fabricCanvas.height! / 2
    );

    fabricCanvas.zoomToPoint(center, zoom);
    prevZoomRef.current = zoom;
  }, [fabricCanvas, zoom]);

  // 处理缩放变化
  const handleZoomChange = useCallback(
    (newZoom: number, point?: { x: number; y: number }) => {
      const clampedZoom = Math.min(Math.max(newZoom, minZoom), maxZoom);

      if (!fabricCanvas) return;

      const zoomPoint = point
        ? new fabric.Point(point.x, point.y)
        : new fabric.Point(fabricCanvas.width! / 2, fabricCanvas.height! / 2);

      fabricCanvas.zoomToPoint(zoomPoint, clampedZoom);

      onZoomChange?.(clampedZoom);
      prevZoomRef.current = clampedZoom;
    },
    [minZoom, maxZoom, fabricCanvas, onZoomChange]
  );

  useEffect(() => {
    if (!container) return;
    const fabricCanvas = new fabric.Canvas(container, {
      preserveObjectStacking: true,
      width,
      height,
      renderOnAddRemove: false, // 减少不必要的渲染
      skipTargetFind: true, // 非拖动状态时禁用目标检测
      enableRetinaScaling: false, // 禁用视网膜缩放以提升性能
      stopContextMenu: false, // 禁用右键菜单
      selection: false, // 禁用多选功能
      backgroundColor: "transparent",
    });
    setFabricCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [container, height, width]);

  // 鼠标滚轮缩放监听
  useEffect(() => {
    if (!fabricCanvas) return;

    function onMouseWheel(opt: any) {
      if (!fabricCanvas) return;
      const delta = opt.e.deltaY;
      const currentZoom = fabricCanvas.getZoom();

      // 计算新的缩放值
      const newZoom = Number(
        (delta > 0 ? currentZoom - zoomStep : currentZoom + zoomStep).toFixed(2)
      );

      // 以鼠标位置为中心进行缩放
      handleZoomChange(newZoom, {
        x: opt.e.offsetX,
        y: opt.e.offsetY,
      });

      opt.e.preventDefault();
      opt.e.stopPropagation();
    }
    // 鼠标滚轮缩放
    fabricCanvas.on("mouse:wheel", onMouseWheel);

    return () => {
      fabricCanvas.off("mouse:wheel", onMouseWheel);
    };
  }, [fabricCanvas, handleZoomChange, zoomStep]);

  // 对象移动事件监听;
  useEffect(() => {
    if (!fabricCanvas) return;
    function onObjectMoving(e: any) {
      const movingObject = e.target as fabric.Object;
      if (movingObject) {
        // 将移动的对象置于顶层
        fabricCanvas!.bringObjectToFront(movingObject);
        fabricCanvas!.renderAll();
      }
    }

    // 添加对象移动事件监听
    fabricCanvas.on("object:moving", onObjectMoving);
    return () => {
      fabricCanvas.off("object:moving", onObjectMoving);
    };
  }, [fabricCanvas]);

  return {
    fabricCanvas,
  };
}

export function usePuzzleSplitter(
  puzzleGenerator: PuzzleGenerator,
  config: {
    width: number;
    height: number;
    distributionStrategy: DistributionStrategy;
  }
) {
  const { width, height, distributionStrategy } = config;
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [positions, setPositions] = useState<Record<string, PiecePosition>>({});

  useEffect(() => {
    const splitter = new PuzzleSplitter(puzzleGenerator);
    const initialPieces = splitter.splitPuzzle();
    const initialPositions: Record<string, PiecePosition> = {};

    // 选择分布策略
    const strategy = distributionStrategy; // 可以根据需要更改策略

    initialPieces.forEach((piece) => {
      const position = generatePiecePosition(piece, width, height, strategy);
      initialPositions[piece.id] = {
        ...position,
        x: Math.max(0, position.x),
        y: Math.max(0, position.y),
      };
    });

    setPieces(initialPieces);
    setPositions(initialPositions);
  }, [width, height, puzzleGenerator, distributionStrategy]);

  return {
    pieces,
    positions,
  };
}

export function useGeneratePieces(
  image: fabric.Image,
  config: {
    fabricCanvas?: fabric.Canvas | null;
    width: number;
    height: number;
    pieces: PuzzlePiece[];
    positions: Record<string, PiecePosition>;
  }
) {
  const { fabricCanvas, width, height, pieces, positions } = config;
  const [groups, setGroups] = useState<
    {
      id: string;
      target: fabric.Group;
      piece: PuzzlePiece;
    }[]
  >([]);

  const generatePieces = useCallback(
    (image: fabric.Image, fabricCanvas: fabric.Canvas) => {
      // 创建临时 canvas 来获取缩放后的图片
      const tempCanvas = createTempCanvas(image, width, height);
      const groups = pieces.map((piece) => {
        const left = positions[piece.id].x;
        const top = positions[piece.id].y;
        const rotation = positions[piece.id].rotation;

        const path = new fabric.Path(piece.path, {
          left: 0,
          top: 0,
          // 减少拖动时的渲染负担
          strokeUniform: true, // 统一描边宽度
          noScaleCache: false, // 启用缩放缓存
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
          perPixelTargetFind: false,
          // 设置缓存
          objectCaching: true,
          absolutePositioned: true,
          hasBorders: false,
          hasControls: false,
          // stroke: "white",
          // strokeWidth: 2,
          fill: "rgba(0,0,0,0.3)",
          strokeLineCap: "round",
          strokeLineJoin: "round",
        });

        const pattern = new fabric.Pattern({
          source: tempCanvas,
          repeat: "no-repeat",
          offsetX: Math.min(piece.x, -piece.x),
          offsetY: Math.min(piece.y, -piece.y),
        });

        const group = new fabric.Group(
          [...createPiece3DEffect(piece.path), path],
          {
            left,
            top,
            // 减少拖动时的渲染负担
            strokeUniform: true, // 统一描边宽度
            noScaleCache: false, // 启用缩放缓存
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            perPixelTargetFind: false,
            // 设置缓存
            objectCaching: true,
            absolutePositioned: true,
            hasBorders: false,
            hasControls: false,
            angle: rotation,
            subTargetCheck: false, // 允许组内元素接收事件
          }
        );

        path.set({
          fill: pattern,
        });

        fabricCanvas.add(group);

        return {
          id: piece.id,
          target: group,
          piece,
        };
      });

      fabricCanvas.renderAll();
      fabricCanvas.set({
        renderOnAddRemove: true, // 恢复正常渲染
        skipTargetFind: false, // 恢复目标检测
      });

      return groups;
    },
    [height, pieces, positions, width]
  );

  useEffect(() => {
    if (!image) return;
    if (!fabricCanvas) return;

    const groups = generatePieces(image, fabricCanvas);
    setGroups(groups);

    return () => {
      console.log("dispose");
      groups.forEach(({ target }) => {
        target.dispose();
      });
    };
  }, [image, generatePieces, fabricCanvas]);

  return {
    groups,
  };
}

export function usePieceBackground(
  image: fabric.Image,
  config: {
    width: number;
    height: number;
    path: string;
    container?: HTMLDivElement | null;
    fabricCanvas?: fabric.Canvas | null;
    lineColor?: string;
    lineWidth?: number;
  }
) {
  const { width, height, path, container, fabricCanvas, lineColor, lineWidth } =
    config;
  const [pieceBackground, setPieceBackground] = useState<{
    path: fabric.Path;
    image: fabric.Image;
    group: fabric.Group;
  } | null>(null);

  const createPieceBackground = useCallback(
    (image: fabric.Image, fabricCanvas: fabric.Canvas) => {
      // 创建临时 canvas 来获取缩放后的图片
      const tempCanvas = createTempCanvas(image, width, height);
      const gridPath = new fabric.Path(path, {
        left: 0,
        top: 0,
        fill: "transparent",
        stroke: lineColor || "white",
        strokeWidth: lineWidth || 2,
        visible: false,
      });

      const newImage = new fabric.Image(tempCanvas, {
        visible: false,
      });

      // 创建组合
      const group = new fabric.Group([newImage, gridPath], {
        selectable: false,
        evented: false,
        left: container?.offsetLeft ?? 0,
        top: container?.offsetTop ?? 0,
        width,
        height,
      });

      fabricCanvas.add(group);

      fabricCanvas.renderAll();

      return {
        path: gridPath,
        image: newImage,
        group,
      };
    },
    [width, height, container, path]
  );

  useEffect(() => {
    if (!image) return;
    if (!fabricCanvas) return;

    const pieceBackground = createPieceBackground(image, fabricCanvas);
    setPieceBackground(pieceBackground);

    return () => {
      pieceBackground?.group.dispose();
      pieceBackground?.path.dispose();
      pieceBackground?.image.dispose();
    };
  }, [image, createPieceBackground, fabricCanvas]);

  return {
    pieceBackground,
  };
}
