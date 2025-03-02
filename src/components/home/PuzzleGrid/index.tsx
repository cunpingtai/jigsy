import { FC } from "react";
import { PuzzleCard } from "../PuzzleCard";

interface PuzzleGridProps {
  puzzles: Array<{
    id: string;
    title: string;
    author: string;
    image: string;
    likes: number;
    difficulty: string;
    description: string;
    category?: string;
    subCategory?: string;
    status: string;
  }>;
  showStatus?: boolean;
  locale: string;
}

export const PuzzleGrid: FC<PuzzleGridProps> = ({
  locale,
  puzzles,
  showStatus,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {puzzles.map((puzzle) => (
        <PuzzleCard
          key={puzzle.id}
          locale={locale}
          puzzle={puzzle}
          showStatus={showStatus}
        />
      ))}
    </div>
  );
};
