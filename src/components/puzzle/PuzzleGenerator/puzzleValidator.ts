import { PuzzlePiece } from "./puzzleSplitter";

export function checkPuzzleCompletion(
  x: number,
  y: number,
  pieces: PuzzlePiece[],
  positions: Record<string, { x: number; y: number }>,
  tolerance: number = 15 // 增加一点容差，使验证更友好
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
