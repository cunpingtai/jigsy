import { PuzzlePiece } from "./puzzleSplitter";
import * as fabric from "fabric";
export function checkPuzzleCompletion(
  x: number,
  y: number,
  pieces: PuzzlePiece[],
  positions: Record<string, { x: number; y: number }>,
  tolerance: number = 30 // 增加一点容差，使验证更友好
): boolean {
  // 检查所有拼图块是否都在正确位置
  const isComplete = pieces.every((piece) => {
    const pos = positions[piece.id];
    if (!pos) return false;

    const expectedX = piece.x + x;
    const expectedY = piece.y + y;

    const xDiff = Math.abs(pos.x - expectedX);
    const yDiff = Math.abs(pos.y - expectedY);

    return xDiff < tolerance && yDiff < tolerance;
  });

  return isComplete;
}

// 添加辅助函数来计算完成度
export function calculateCompletion(
  pieces: PuzzlePiece[],
  positions: Record<string, { x: number; y: number }>,
  tolerance: number = 15
): number {
  const correctPieces = pieces.filter((piece) => {
    const pos = positions[piece.id];
    if (!pos) return false;

    const expectedX = piece.col * piece.width;
    const expectedY = piece.row * piece.height;

    const xDiff = Math.abs(pos.x - expectedX);
    const yDiff = Math.abs(pos.y - expectedY);

    return xDiff < tolerance && yDiff < tolerance;
  });

  return (correctPieces.length / pieces.length) * 100;
}

export function checkRelativePositions(
  pieces: PuzzlePiece[],
  positions: Record<
    string,
    {
      x: number;
      y: number;
      width: number;
      height: number;
      target: fabric.Object;
    }
  >
): boolean {
  // 找到拼图范围
  let minX = Infinity,
    minY = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity;

  // 计算拼图的整体范围
  Object.values(positions).forEach((pos) => {
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + pos.width);
    maxY = Math.max(maxY, pos.y + pos.height);
  });

  // 获取单个拼图块的尺寸（假设所有块大小相同）
  const pieceWidth = pieces[0]?.width || 0;
  const pieceHeight = pieces[0]?.height || 0;

  // 计算网格大小
  const gridWidth = Math.round((maxX - minX) / pieceWidth);
  const gridHeight = Math.round((maxY - minY) / pieceHeight);

  // 初始化网格
  const grid = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(null));

  // 将拼图块放入网格并验证相对位置
  for (const piece of pieces) {
    const pos = positions[piece.id];
    if (!pos) continue;

    // 计算该块在网格中的位置
    const gridX = Math.round((pos.x - minX) / pieceWidth);
    const gridY = Math.round((pos.y - minY) / pieceHeight);

    // 检查是否在有效范围内
    if (gridX < 0 || gridX >= gridWidth || gridY < 0 || gridY >= gridHeight) {
      return false;
    }

    // 如果位置已被占用，说明拼图块重叠
    if (grid[gridY][gridX] !== null) {
      return false;
    }

    // 存储piece的原始位置信息
    grid[gridY][gridX] = {
      row: piece.row,
      col: piece.col,
    };
  }

  // 验证相对位置是否正确
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const cell = grid[y][x];
      if (!cell) return false;

      if (cell.row !== y || cell.col !== x) {
        return false;
      }
    }
  }

  return true;
}
