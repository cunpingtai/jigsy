import * as fabric from "fabric";
import { PieceEdges } from "./generator";

export interface PuzzleConfig {
  seed: number;
  tabSize: number;
  jitter: number;
  tilesX: number;
  tilesY: number;
  width: number;
  height: number;
}

export interface PuzzlePiece {
  id: string;
  path: string;
  tabHeight: number;
  pieceWidth: number;
  pieceHeight: number;
  row: number;
  edges: PieceEdges;
  col: number;
  width: number;
  height: number;
  initialX: number;
  initialY: number;
  x: number;
  y: number;
  rotation?: number;
}

export interface PiecePosition {
  x: number;
  y: number;
  rotation: number;
}

export interface PuzzleGameProps {
  image: fabric.Image;
  preview?: boolean;
  showGrid: boolean;
  lineColor?: string;
  lineWidth?: number;
  showPreview: boolean;
  containerWidth: number;
  containerHeight: number;
  distributionStrategy: DistributionStrategy;
  width: number;
  height: number;
  tilesX: number;
  tilesY: number;
  seed: number;
  tabSize: number;
  jitter: number;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  fixCenter?: number;
  onZoomChange?: (zoom: number) => void;
  onPanChange?: (x: number, y: number) => void;
  enablePanning?: boolean;
}

// 添加策略枚举
export enum DistributionStrategy {
  SURROUNDING = "surrounding",
  CENTER_SCATTER = "centerScatter",
  SPREAD_OUT = "spreadOut",
}

export interface AnimationState {
  obj: fabric.Object;
  startProps: Record<string, number>;
  endProps: Record<string, number>;
  startTime: number;
  duration: number;
}
