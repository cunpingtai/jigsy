import { FC } from "react";
import { PuzzleConfigType, PuzzleGenerator } from "../PuzzleGenerator";

interface PreviewPuzzleProps {
  image: string;
  config: Omit<PuzzleConfigType, "image">;
}

export const PreviewPuzzle: FC<PreviewPuzzleProps> = ({ image, config }) => {
  return <PuzzleGenerator {...config} zoom={1} imageUrl={image} preview />;
};
