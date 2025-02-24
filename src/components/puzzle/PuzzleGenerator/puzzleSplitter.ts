import { PieceEdges, PuzzleGenerator } from "./generator";
import * as fabric from "fabric";
export interface PuzzlePiece {
  id: string;
  path: string;
  edges: PieceEdges;
  tabHeight: number;
  pieceWidth: number;
  pieceHeight: number;
  row: number;
  col: number;
  width: number;
  height: number;
  x: number;
  y: number;
  initialX: number;
  initialY: number;
}
export class PuzzleSplitter {
  private puzzleGenerator: PuzzleGenerator;

  constructor(puzzleGenerator: PuzzleGenerator) {
    this.puzzleGenerator = puzzleGenerator;
  }

  splitPuzzle(): PuzzlePiece[] {
    const pieces: PuzzlePiece[] = [];

    const tilesX = this.puzzleGenerator.config.tilesX;
    const tilesY = this.puzzleGenerator.config.tilesY;

    for (let row = 0; row < tilesY; row++) {
      for (let col = 0; col < tilesX; col++) {
        const { path, edges } = this.puzzleGenerator.generatePiecePath(
          row,
          col
        );
        const dimensions = this.puzzleGenerator.getPieceDimensions(row, col);
        const piece = new fabric.Path(path);
        pieces.push({
          id: `piece-${row}-${col}`,
          path,
          edges,
          tabHeight: dimensions.tabHeight,
          pieceWidth: this.puzzleGenerator.pieceWidth,
          pieceHeight: this.puzzleGenerator.pieceHeight,
          row,
          col,
          width: piece.width,
          height: piece.height,
          x: piece.left,
          y: piece.top,
          initialX: piece.width * col,
          initialY: piece.height * row,
        });
        piece.dispose();
      }
    }

    return pieces;
  }
}
